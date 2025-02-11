import { Chain } from 'viem';

export const localChain: Chain = {
    id: 84532,
    name: 'Base Sepolia',
    network: 'base-sepolia',
    nativeCurrency: {
        decimals: 18,
        name: 'Base Sepolia Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [process.env.RPC_URL || 'https://sepolia.base.org'],
        },
        public: {
            http: ['https://sepolia.base.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Base Sepolia Explorer',
            url: 'https://sepolia.basescan.org',
        },
    },
    testnet: true,
}; 