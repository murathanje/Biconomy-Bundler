// Gas Limits (ERC-4337 specification)
export const MAX_ALLOWED_GAS = 10_000_000;        // Maximum total gas allowed
export const MAX_VERIFICATION_GAS = 5_000_000;     // Maximum verification gas limit
export const MIN_VERIFICATION_GAS = 30_000;        // Minimum verification gas required
export const MAX_CALLDATA_SIZE = 24_576;          // Maximum calldata size in bytes (24KB)

// Gas Settings
export const GAS_LIMIT = 1000000n;                // 1M gas units
export const MAX_FEE_PER_GAS = 100000000000n;     // 100 gwei
export const MAX_PRIORITY_FEE_PER_GAS = 2000000000n; // 2 gwei

// Transaction Settings
export const MAX_ATTEMPTS = 3;
export const RETRY_DELAY = 1000; // 1 second
export const TRANSACTION_TIMEOUT = 300000; // 5 minutes

// Wallet Settings
export const MAX_PENDING_TRANSACTIONS = 3;
export const MAX_FAILURES = 3;
export const MIN_BALANCE = BigInt(1e16); // 0.01 ETH
export const COOL_DOWN_PERIOD = 1000; // 1 second

// Security Settings
export const BANNED_ADDRESSES = new Set<string>([
    '0xmaliciousContract',
    // Add more banned addresses here
]); 