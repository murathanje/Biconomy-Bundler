import { Hash } from 'viem';
import { ENTRY_POINT_ADDRESS } from '../config/environment';
import { MAX_ATTEMPTS, MAX_FEE_PER_GAS, MAX_PRIORITY_FEE_PER_GAS } from '../config/constants';
import { localChain } from '../config/chain';
import { ENTRY_POINT_ABI } from '../abi';
import { ProcessedUserOperation } from '../types/UserOperation';
import { RPCError, RPC_ERRORS } from '../types/ErrorTypes';
import { WalletManager } from './WalletManager';
import { EntryPointUserOp } from '../types/EntryPointUserOp';

import { GasEstimationService } from './transaction/GasEstimationService';
import { UserOperationValidator } from './transaction/UserOperationValidator';
import { TransactionLogger } from './transaction/TransactionLogger';
import { ErrorHandler } from './transaction/ErrorHandler';

export class TransactionService {
    private static instance: TransactionService;
    private readonly validator = new UserOperationValidator();
    private readonly gasEstimator = new GasEstimationService();
    private readonly logger = new TransactionLogger();
    private readonly errorHandler = new ErrorHandler();

    public static getInstance(): TransactionService {
        if (!TransactionService.instance) {
            TransactionService.instance = new TransactionService();
        }
        return TransactionService.instance;
    }

    public async sendHandleOps(userOp: ProcessedUserOperation): Promise<Hash> {
        const walletManager = await WalletManager.getInstance();
        let attempts = 0;

        while (attempts < MAX_ATTEMPTS) {
            const wallet = await walletManager.selectWallet();
            
            try {
                const { formattedUserOp, targetAddress } = this.validator.validateAndFormat(userOp);
                const gasLimit = await this.gasEstimator.estimateGasLimit(
                    wallet,
                    formattedUserOp,
                    targetAddress
                );

                const hash = await this.sendTransaction(wallet, formattedUserOp, gasLimit);
                await walletManager.trackTransaction(hash, wallet.account.address);
                this.logger.logTransactionDetails(userOp, hash, wallet.account.address, targetAddress);

                return hash;
            } catch (error: any) {
                console.error(`Transaction failed (attempt ${attempts + 1}/${MAX_ATTEMPTS}):`, error);
                attempts++;
                await this.errorHandler.handleTransactionError(error, attempts);
            }
        }

        throw new RPCError(
            RPC_ERRORS.MAX_RETRIES_EXCEEDED.code,
            `Failed after ${MAX_ATTEMPTS} attempts`
        );
    }

    private async sendTransaction(
        wallet: any,
        userOp: EntryPointUserOp,
        gasLimit: bigint
    ): Promise<Hash> {
        return wallet.writeContract({
            address: ENTRY_POINT_ADDRESS as `0x${string}`,
            abi: ENTRY_POINT_ABI,
            functionName: 'handleOps',
            args: [[userOp], ENTRY_POINT_ADDRESS] as any,
            chain: localChain,
            account: wallet.account,
            gas: gasLimit,
            maxFeePerGas: MAX_FEE_PER_GAS,
            maxPriorityFeePerGas: MAX_PRIORITY_FEE_PER_GAS
        } as const);
    }
}

export const sendHandleOps = TransactionService.getInstance().sendHandleOps.bind(TransactionService.getInstance()); 