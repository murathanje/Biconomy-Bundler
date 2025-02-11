# ERC-4337 Minimal Bundler

A minimal implementation of an ERC-4337 bundler node that accepts and executes UserOperations on the Sepolia testnet. This implementation focuses on reliability, error handling, and proper EOA management.

## Features

- Single JSON-RPC endpoint (`eth_sendUserOperation`)
- Multiple EOA account management with automatic rotation
- Intelligent transaction retry mechanism
- Comprehensive error handling and validation
- Transaction status tracking
- Gas estimation and optimization
- No paymaster support (simplified implementation)

## Prerequisites

- Node.js v16 or higher
- Yarn or npm
- Two EOA accounts with Sepolia ETH for gas fees
- Access to Base Sepolia RPC endpoint

## Installation

1. Clone the repository:
```bash
git clone https://github.com/murathanje/Biconomy-Bundler.git
cd Biconomy-Bundler
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=3001

# Network Configuration
RPC_URL=https://base-sepolia.g.alchemy.com/v2/<key>

# EntryPoint Contract
ENTRY_POINT_ADDRESS=0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789

# EOA Private Keys (Do not use these in production!)
EOA1_PK=your_private_key_1_here
EOA2_PK=your_private_key_2_here

# Environment
NODE_ENV=development
```

## Usage

1. Start the server:
```bash
npm start
```

2. Send UserOperation:
```bash
curl -X POST http://localhost:3001 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "eth_sendUserOperation",
    "params": [
      {
        "sender": "0x...",
        "nonce": "0x...",
        "initCode": "0x",
        "callData": "0x...",
        "callGasLimit": "0x...",
        "verificationGasLimit": "0x...",
        "preVerificationGas": "0x...",
        "maxFeePerGas": "0x...",
        "maxPriorityFeePerGas": "0x...",
        "paymasterAndData": "0x",
        "signature": "0x..."
      },
    ]
  }'
```

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Coverage
- WalletManager: EOA management, transaction tracking, balance checks
- TransactionService: UserOperation validation, gas estimation, transaction sending
- Error handling and recovery scenarios

## Error Handling

The bundler implements comprehensive error handling with specific error codes:

- Standard JSON-RPC Errors (-32000 to -32099)
- EntryPoint Related Errors (-32100 to -32199)
- Bundler Related Errors (-32200 to -32299)
- Security Related Errors (-32300 to -32399)

Example error response:
```json
{
    "jsonrpc": "2.0",
    "error": {
        "code": -32201,
        "message": "Insufficient wallet balance",
        "data": {
            "balance": "1000000000000",
            "minimum": "10000000000000"
        }
    },
    "id": null
}
```

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   - Ensure your EOA accounts have enough Sepolia ETH
   - Default minimum balance: 0.01 ETH

2. **Transaction Failures**
   - Check gas parameters in UserOperation
   - Verify signature is correct
   - Ensure nonce is valid

3. **No Available Wallet**
   - Wait for cooldown period (default: 5 seconds)
   - Check if wallets have too many pending transactions
   - Verify wallet failure counts haven't exceeded maximum

### Monitoring

The bundler logs important events and errors to help with debugging:
- Transaction success/failure
- Wallet selection events
- Balance checks
- Gas estimations

## Architecture

### Components

1. **WalletManager**
   - Manages multiple EOA accounts
   - Handles transaction tracking
   - Implements wallet selection strategy

2. **TransactionService**
   - Processes UserOperations
   - Handles gas estimation
   - Manages transaction retries

3. **Validation**
   - UserOperation validation
   - Gas limit checks
   - Security validations

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License 
