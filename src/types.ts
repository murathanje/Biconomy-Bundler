export interface UserOperation {
    sender: string;
    nonce: string;
    initCode: string;
    callData: string;
    accountGasLimits: string;  
    preVerificationGas: string;
    gasFees: string;  
    paymasterAndData: string;
    signature: string;
}