import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { SEPOLIA_RPC_URL } from './constants';

export const transport = http(SEPOLIA_RPC_URL);

export const publicClient = createPublicClient({
    chain: sepolia,
    transport,
}); 