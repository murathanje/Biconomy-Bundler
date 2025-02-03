import { UserOperation } from './types';
import { ENTRY_POINT_ADDRESS } from './config';
import { sendHandleOps } from './ethereum';

const MAX_ALLOWED_GAS = 10_000_000;

export async function handleEthSendUserOperation(params: any[]): Promise<string> {
    const [userOp, entryPoint] = params;

    if (entryPoint.toLowerCase() !== ENTRY_POINT_ADDRESS.toLowerCase()) {
        throw new Error('Unsupported EntryPoint address');
    }

    if (userOp.paymasterAndData !== '0x') {
        throw new Error('Paymaster not supported');
    }

    const totalGas = BigInt(userOp.callGasLimit) +
        (BigInt(userOp.verificationGasLimit) * 3n) +
        BigInt(userOp.preVerificationGas);

    if (totalGas > MAX_ALLOWED_GAS) {
        throw new Error('Gas limit exceeds maximum allowed');
    }

    return sendHandleOps(userOp);
}