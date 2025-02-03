# ERC-4337 Bundler Node

A minimal bundler node implementation that handles ERC-4337 UserOperations on Ethereum Sepolia testnet. This bundler node accepts UserOperations, executes them through the EntryPoint contract, and returns transaction hashes.

## Overview

This is a take-home assignment implementation of a minimal ERC-4337 bundler node with the following key characteristics:

- Stateless architecture (no database/persistent storage)
- Implements only the `eth_sendUserOperation` JSON-RPC API
- Executes UserOperations directly through the EntryPoint contract
- Manages multiple EOA accounts for transaction sending
- Built with TypeScript, Express.js, and viem.sh
- Supports Ethereum Sepolia testnet

## Key Features

- **Single API Implementation**: Only implements `eth_sendUserOperation` as per requirements
- **Multiple EOA Management**: Uses at least two EOAs for transaction sending to prevent nonce conflicts
- **Smart Transaction Management**: 
  - Handles stuck/failed transactions
  - Implements cooldown periods
  - Manages nonce tracking
  - Provides transaction retry logic
- **Comprehensive Error Handling**: Implements standard JSON-RPC 2.0 error codes
- **No UserOp Mempool**: Direct execution of UserOperations without mempool implementation
- **No Paymaster Support**: Requires smart accounts to have native tokens for gas

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Sepolia testnet RPC URL (e.g., from Alchemy or Infura)
- At least two funded EOA accounts on Sepolia

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bundler
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
# Sepolia RPC URL
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# EOA Private Keys (minimum 2 required)
EOA1_PK=your_private_key_1
EOA2_PK=your_private_key_2

# Port (optional, defaults to 3001)
PORT=3001
```

## EntryPoint Contract

The bundler works with the official ERC-4337 EntryPoint contract on Sepolia:
- Address: `0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789`
- [View on Polygonscan](https://polygonscan.com/address/0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789)

## Running the Bundler

Start the bundler:
```bash
npm start
```
The service will be available at `http://localhost:3001` (or your configured PORT).

## API Usage

### eth_sendUserOperation

Send a UserOperation for execution:

```bash
curl -X POST http://localhost:3001 \
-H "Content-Type: application/json" \
-d '{
  "jsonrpc": "2.0",
  "method": "eth_sendUserOperation",
  "params": [
    {
      "sender": "0x...",
      "nonce": "0x...",
      "initCode": "0x",
      "callData": "0x...",
      "accountGasLimits": "0x...",
      "preVerificationGas": "0x...",
      "gasFees": "0x...",
      "paymasterAndData": "0x",
      "signature": "0x..."
    },
    "0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789"
  ],
  "id": 1
}'
```

### Health Check

```bash
curl http://localhost:3001/health
```

## Testing

1. Fund your test accounts with Sepolia ETH:
   - [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

2. Run tests:
```bash
npm test
```

## Generating Test UserOperations

Use the [Biconomy SDK Examples](https://github.com/bcnmy/sdk-examples) repository:

1. Clone and setup:
```bash
git clone https://github.com/bcnmy/sdk-examples.git
cd sdk-examples
npm install
```

2. Enable UserOp debug output:
```bash
export BICONOMY_SDK_DEBUG=true
```

3. Use example scripts like `scripts/gasless/nativeTransfer.ts` to generate test UserOperations.

## Architecture

### Key Components

1. **WalletManager** (`src/ethereum.ts`)
   - Manages multiple EOA accounts
   - Handles transaction retries
   - Implements cooldown periods
   - Tracks nonce and pending transactions

2. **RPC Handler** (`src/rpc-handlers.ts`)
   - Validates UserOperation parameters
   - Enforces gas limits
   - Handles EntryPoint contract interactions

3. **Error Handler**
   - Implements JSON-RPC 2.0 error codes
   - Provides detailed error messages
   - Handles blockchain-specific errors

### Security Features

- UserOperation validation
- Gas limit enforcement
- Multiple EOA management
- Transaction retry logic
- Nonce tracking
- Cooldown periods

## Limitations

As per assignment requirements, this implementation:
- Only supports `eth_sendUserOperation`
- Does not implement UserOp mempool
- Does not provide gas estimation endpoints
- Does not support paymasters
- Requires smart accounts to have native tokens for gas
- Only supports Sepolia testnet

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[MIT License](LICENSE) 
