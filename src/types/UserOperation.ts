export interface UserOperation {
    sender: string;
    nonce: string;
    initCode: string;
    callData: string;
    callGasLimit: bigint;      
    verificationGasLimit: bigint;  
    preVerificationGas: bigint;
    maxFeePerGas: bigint;     
    maxPriorityFeePerGas: bigint; 
    paymasterAndData: string;
    signature: string;
} 