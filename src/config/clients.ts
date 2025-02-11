import { createPublicClient, http } from 'viem';
import { RPC_URL } from './environment';
import { localChain } from './chain';

// Ensure RPC URL is available
if (!RPC_URL) {
    throw new Error('RPC_URL is required but not provided in environment variables');
}

export const transport = http(RPC_URL);

export const publicClient = createPublicClient({
    chain: localChain,
    transport,
}); 