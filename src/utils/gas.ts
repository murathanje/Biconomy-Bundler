export const GAS_BUFFER_PERCENTAGE = 10n;

export function packGasParams(callGasLimit: bigint, verificationGasLimit: bigint, maxFeePerGas: bigint, maxPriorityFeePerGas: bigint): { accountGasLimits: `0x${string}`, gasFees: `0x${string}` } {
    const accountGasLimits = `0x${(callGasLimit << 128n | verificationGasLimit).toString(16).padStart(64, '0')}` as `0x${string}`;
    const gasFees = `0x${(maxFeePerGas << 128n | maxPriorityFeePerGas).toString(16).padStart(64, '0')}` as `0x${string}`;
    return { accountGasLimits, gasFees };
}

export function calculateGasWithBuffer(estimate: bigint): bigint {
    const buffer = (estimate * GAS_BUFFER_PERCENTAGE) / 100n;
    return estimate + buffer;
} 