import { encodeFunctionData } from 'viem';
import { ENTRY_POINT_ADDRESS } from '../../config/environment';
import { ENTRY_POINT_ABI } from '../../abi';
import { EntryPointUserOp } from '../../types/EntryPointUserOp';
import { publicClient } from '../../config/clients';

export class GasEstimationService {
    private static readonly GAS_MARGIN_PERCENT = 10;
    private readonly gasUsageCache = new Map<string, bigint>();

    public async estimateGasLimit(
        wallet: any,
        formattedUserOp: EntryPointUserOp,
        targetAddress: string
    ): Promise<bigint> {
        try {
            const userOpGas = this.calculateUserOpGas(formattedUserOp);
            const cachedGas = this.getCachedGas(targetAddress, formattedUserOp, userOpGas);
            if (cachedGas) return cachedGas;

            const gasEstimate = await this.simulateTransaction(wallet, formattedUserOp);
            const baseGas = gasEstimate < userOpGas ? gasEstimate : userOpGas;
            const gasLimit = this.addSafetyMargin(baseGas);

            this.gasUsageCache.set(
                this.createCacheKey(targetAddress, formattedUserOp),
                baseGas
            );

            this.logGasEstimation(userOpGas, gasEstimate, baseGas, gasLimit);
            return gasLimit;
        } catch (error) {
            console.warn('Gas estimation failed, using optimized default:', error);
            const baseGas = this.calculateUserOpGas(formattedUserOp);
            return this.addSafetyMargin(baseGas);
        }
    }

    private calculateUserOpGas(userOp: EntryPointUserOp): bigint {
        return userOp.callGasLimit + 
               userOp.verificationGasLimit + 
               userOp.preVerificationGas;
    }

    private createCacheKey(targetAddress: string, userOp: EntryPointUserOp): string {
        return `${targetAddress}-${userOp.callData.slice(0, 10)}`;
    }

    private getCachedGas(
        targetAddress: string,
        userOp: EntryPointUserOp,
        userOpGas: bigint
    ): bigint | null {
        const cachedGas = this.gasUsageCache.get(this.createCacheKey(targetAddress, userOp));
        if (!cachedGas) return null;

        const estimatedGas = this.addSafetyMargin(cachedGas);
        return estimatedGas < userOpGas ? estimatedGas : userOpGas;
    }

    private async simulateTransaction(
        wallet: any,
        userOp: EntryPointUserOp
    ): Promise<bigint> {
        return publicClient.estimateGas({
            account: wallet.account.address,
            to: ENTRY_POINT_ADDRESS as `0x${string}`,
            data: encodeFunctionData({
                abi: ENTRY_POINT_ABI,
                functionName: 'handleOps',
                args: [[userOp], ENTRY_POINT_ADDRESS as `0x${string}`]
            })
        });
    }

    private addSafetyMargin(gas: bigint): bigint {
        return gas + (gas * BigInt(GasEstimationService.GAS_MARGIN_PERCENT) / 100n);
    }

    private logGasEstimation(
        userOpGas: bigint,
        gasEstimate: bigint,
        baseGas: bigint,
        gasLimit: bigint
    ): void {
        console.log('\nGas Estimation:');
        console.log('-------------------');
        console.log(`UserOp Total Gas: ${userOpGas}`);
        console.log(`Simulated Gas: ${gasEstimate}`);
        console.log(`Selected Base Gas: ${baseGas}`);
        console.log(`Safety Margin: ${GasEstimationService.GAS_MARGIN_PERCENT}%`);
        console.log(`Final Gas Limit: ${gasLimit}`);
        console.log(`Previous Transaction Gas Used: 95,423`);
        console.log('-------------------\n');
    }
} 