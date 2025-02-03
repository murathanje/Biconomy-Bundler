import { Hash, decodeFunctionData } from 'viem';
import { ENTRY_POINT_ADDRESS } from '../config/constants';
import { MAX_ATTEMPTS } from '../config/transaction';
import { ENTRY_POINT_ABI, SMART_ACCOUNT_ABI } from '../abi';
import { UserOperation } from '../types/UserOperation';
import { EntryPointUserOp } from '../types/EntryPointUserOp';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';
import { BANNED_ADDRESSES } from '../utils/validation';
import { calculateGasWithBuffer } from '../utils/gas';
import { formatUserOp } from '../utils/userOp';
import { WalletManager } from './WalletManager';
import { publicClient } from '../config/clients';
import { sepolia } from 'viem/chains';

export async function sendHandleOps(userOp: UserOperation): Promise<Hash> {
    const walletManager = WalletManager.getInstance();
    let attempts = 0;
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

            const formattedUserOp = formatUserOp(userOp);
            const args: readonly [readonly EntryPointUserOp[], `0x${string}`] = [[formattedUserOp], wallet.account.address];
            
            const gasEstimate = await publicClient.estimateContractGas({
                address: ENTRY_POINT_ADDRESS as `0x${string}`,
                abi: ENTRY_POINT_ABI,
                functionName: 'handleOps',
                args,
                account: wallet.account.address,
            });

            const hash = await wallet.writeContract({
                address: ENTRY_POINT_ADDRESS as `0x${string}`,
                abi: ENTRY_POINT_ABI,
                functionName: 'handleOps',
                args,
                gas: calculateGasWithBuffer(gasEstimate),
                chain: sepolia,
                account: wallet.account.address
            });

            await walletManager.trackTransaction(hash, wallet.account.address);
            return hash;
        } catch (error: any) {
            console.error(`Transaction failed:`, error);
            attempts++;
            lastError = error;
            
            if (attempts >= MAX_ATTEMPTS) {
                throw new RPCError(
                    RPC_ERRORS.MAX_RETRIES_EXCEEDED.code,
                    `Failed after ${MAX_ATTEMPTS} attempts: ${error.message}`
                );
            }
        }
    }

    throw new RPCError(
        RPC_ERRORS.MAX_RETRIES_EXCEEDED.code,
        `Failed after ${MAX_ATTEMPTS} attempts: ${lastError?.message}`
    );
} 