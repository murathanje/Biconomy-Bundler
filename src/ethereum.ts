import { 
    createPublicClient, 
    createWalletClient, 
    http, 
    WalletClient,  
    Hash, 
    Account, 
    Transport,
    custom
} from 'viem';
import { ENTRY_POINT_ABI, SMART_ACCOUNT_ABI } from './abi';
import { Mutex } from 'async-mutex';
import { UserOperation } from './types';
import { ENTRY_POINT_ADDRESS, SEPOLIA_RPC_URL } from './config';
import { privateKeyToAccount } from 'viem/accounts';
import { decodeFunctionData } from 'viem';
import { sepolia } from 'viem/chains';

const transport = http(SEPOLIA_RPC_URL);

const publicClient = createPublicClient({
    chain: sepolia,
    transport,
});

type CustomWalletClient = WalletClient & {
    account: Account;
};

interface WalletState {
    wallet: CustomWalletClient;
    pendingCount: number;
    lastNonce: bigint;
    lastUsed: number;
    failureCount: number;
}

class RPCError extends Error {
    constructor(
        public code: number,
        message: string,
        public data?: any
    ) {
        super(message);
        this.name = 'RPCError';
    }

    toJSON() {
        return {
            jsonrpc: "2.0",
            error: {
                code: this.code,
                message: this.message,
                data: this.data
            },
            id: null 
        };
    }
}

const RPC_ERRORS = {
   
    PARSE_ERROR: { code: -32700, message: "Parse error" },
    INVALID_REQUEST: { code: -32600, message: "Invalid Request" },
    METHOD_NOT_FOUND: { code: -32601, message: "Method not found" },
    INVALID_PARAMS: { code: -32602, message: "Invalid params" },
    INTERNAL_ERROR: { code: -32603, message: "Internal error" },
    
    
    INVALID_ENTRYPOINT: { code: -32000, message: "Unsupported EntryPoint" },
    INVALID_OPCODE: { code: -32001, message: "Banned operation detected" },
    BANNED_ADDRESS: { code: -32002, message: "Banned contract interaction" },
    NO_WALLET: { code: -32003, message: "No available wallet" },
    INSUFFICIENT_BALANCE: { code: -32004, message: "Insufficient wallet balance" },
    MAX_RETRIES_EXCEEDED: { code: -32005, message: "Max retry attempts exceeded" },
    TRANSACTION_FAILED: { code: -32006, message: "Transaction execution failed" },
    NONCE_ERROR: { code: -32007, message: "Nonce mismatch" }
};

class WalletManager {
    private walletStates: Map<string, WalletState> = new Map();
    private mutex = new Mutex();
    private readonly MAX_PENDING = 3;
    private readonly MAX_FAILURES = 3;
    private readonly MIN_BALANCE = BigInt(1e16); 
    private readonly COOL_DOWN_PERIOD = 5000;
    private static instance: WalletManager;

    private constructor(privateKeys: string[]) {
        this.initializeWallets(privateKeys);
    }

    public static getInstance(): WalletManager {
        if (!WalletManager.instance) {
            const pk1 = process.env.EOA1_PK;
            const pk2 = process.env.EOA2_PK;

            if (!pk1 || !pk2) {
                throw new RPCError(
                    RPC_ERRORS.INTERNAL_ERROR.code,
                    "EOA private keys not configured"
                );
            }

            WalletManager.instance = new WalletManager([pk1, pk2]);
        }
        return WalletManager.instance;
    }

    private initializeWallets(privateKeys: string[]) {
        for (const pk of privateKeys) {
            const account = privateKeyToAccount(pk as `0x${string}`);
            const wallet = createWalletClient({
                account,
                chain: sepolia,
                transport,
            }) as CustomWalletClient;
            
            this.walletStates.set(account.address, {
                wallet,
                pendingCount: 0,
                lastNonce: 0n,
                lastUsed: 0,
                failureCount: 0
            });
        }
    }

    private async updateWalletNonce(address: `0x${string}`): Promise<void> {
        const state = this.walletStates.get(address);
        if (!state) return;

        const nonce = await publicClient.getTransactionCount({
            address
        });
        state.lastNonce = BigInt(nonce);
    }

    private async checkBalance(address: `0x${string}`): Promise<boolean> {
        const balance = await publicClient.getBalance({
            address
        });
        return balance >= this.MIN_BALANCE;
    }

    private async isWalletAvailable(state: WalletState): Promise<boolean> {
        const now = Date.now();
        const hasBalance = await this.checkBalance(state.wallet.account.address);
        const cooldownPassed = (now - state.lastUsed) >= this.COOL_DOWN_PERIOD;
        
        return state.pendingCount < this.MAX_PENDING &&
               state.failureCount < this.MAX_FAILURES &&
               hasBalance &&
               cooldownPassed;
    }

    async selectWallet(): Promise<CustomWalletClient> {
        const release = await this.mutex.acquire();
        try {
            const availableWallets: [string, WalletState][] = [];
            
            for (const [address, state] of this.walletStates) {
                if (await this.isWalletAvailable(state)) {
                    availableWallets.push([address, state]);
                }
            }

            if (availableWallets.length === 0) {
                throw new RPCError(
                    RPC_ERRORS.NO_WALLET.code,
                    "No available wallets. All wallets are either busy, in cooldown, or have insufficient balance"
                );
            }

            
            const [_, state] = availableWallets.sort((a, b) => 
                a[1].pendingCount - b[1].pendingCount
            )[0];

            await this.updateWalletNonce(state.wallet.account.address);
            state.lastUsed = Date.now();
            state.pendingCount++;
            
            return state.wallet;
        } finally {
            release();
        }
    }

    async handleTransactionSuccess(wallet: CustomWalletClient): Promise<void> {
        const state = this.walletStates.get(wallet.account.address);
        if (state) {
            state.pendingCount = Math.max(0, state.pendingCount - 1);
            state.failureCount = 0;
        }
    }

    async handleTransactionFailure(wallet: CustomWalletClient, error: Error): Promise<void> {
        const state = this.walletStates.get(wallet.account.address);
        if (state) {
            state.failureCount++;
            state.pendingCount = Math.max(0, state.pendingCount - 1);
            
            
            if (error.message.includes('nonce') || error.message.includes('replacement transaction underpriced')) {
                await this.updateWalletNonce(wallet.account.address);
            }
        }
    }
}

const BANNED_OPCODES = ['SELFDESTRUCT', 'DELEGATECALL'];
const BANNED_ADDRESSES = new Set(['0xmaliciousContract']);

export async function sendHandleOps(userOp: UserOperation): Promise<Hash> {
    const walletManager = WalletManager.getInstance();
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    let lastError: Error | null = null;

    while (attempts < MAX_ATTEMPTS) {
        const wallet = await walletManager.selectWallet();
        
        try {
            
            const decoded = decodeFunctionData({
                abi: SMART_ACCOUNT_ABI,
                data: userOp.callData as `0x${string}`
            });

            if (!decoded.args) {
                throw new RPCError(
                    RPC_ERRORS.INVALID_PARAMS.code,
                    "Invalid callData: Could not decode function arguments"
                );
            }

            const targetAddress = decoded.args[0] as string;
            if (BANNED_ADDRESSES.has(targetAddress)) {
                throw new RPCError(
                    RPC_ERRORS.BANNED_ADDRESS.code,
                    RPC_ERRORS.BANNED_ADDRESS.message,
                    { address: targetAddress }
                );
            }

            type EntryPointUserOp = {
                sender: `0x${string}`;
                nonce: bigint;
                initCode: `0x${string}`;
                callData: `0x${string}`;
                accountGasLimits: `0x${string}`;
                preVerificationGas: bigint;
                gasFees: `0x${string}`;
                paymasterAndData: `0x${string}`;
                signature: `0x${string}`;
            };

            const formattedUserOp: EntryPointUserOp = {
                sender: userOp.sender as `0x${string}`,
                nonce: BigInt(userOp.nonce),
                initCode: userOp.initCode as `0x${string}`,
                callData: userOp.callData as `0x${string}`,
                accountGasLimits: userOp.accountGasLimits as `0x${string}`,
                preVerificationGas: BigInt(userOp.preVerificationGas),
                gasFees: userOp.gasFees as `0x${string}`,
                paymasterAndData: userOp.paymasterAndData as `0x${string}`,
                signature: userOp.signature as `0x${string}`
            };

            const args: readonly [readonly EntryPointUserOp[], `0x${string}`] = [[formattedUserOp], wallet.account.address];
            
            const gasEstimate = await publicClient.estimateContractGas({
                address: ENTRY_POINT_ADDRESS as `0x${string}`,
                abi: ENTRY_POINT_ABI,
                functionName: 'handleOps',
                args,
                account: wallet.account.address,
            });
            
            const gasBuffer = BigInt(Math.floor(Number(gasEstimate) * 1.2));

            const hash = await wallet.writeContract({
                address: ENTRY_POINT_ADDRESS as `0x${string}`,
                abi: ENTRY_POINT_ABI,
                functionName: 'handleOps',
                args,
                gas: gasBuffer,
                chain: null,
                account: wallet.account.address
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });
            
            if (receipt.status === 'success') {
                await walletManager.handleTransactionSuccess(wallet);
                console.log(`Transaction successful: ${hash}`);
                return hash;
            } else {
                throw new RPCError(
                    RPC_ERRORS.TRANSACTION_FAILED.code,
                    RPC_ERRORS.TRANSACTION_FAILED.message,
                    { receipt }
                );
            }
        } catch (error: any) {
            console.error(`Transaction failed:`, error);
            await walletManager.handleTransactionFailure(wallet, error);
            lastError = error;
            attempts++;
        }
    }

    throw new RPCError(
        RPC_ERRORS.MAX_RETRIES_EXCEEDED.code,
        `Failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`
    );
}