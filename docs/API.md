# Vyra API Documentation

## Overview

The Vyra API provides endpoints for wallet management, payment processing, bridge operations, and paymaster services.

**Base URL**: `http://localhost:8080/api/v1`

## Authentication

Currently, the API uses simple address-based authentication. In production, this should be replaced with proper JWT tokens or API keys.

## Endpoints

### Health Check

#### GET /health

Check the health status of the service.

**Response:**
```json
{
  "status": "healthy",
  "service": "vyra-backend",
  "version": "0.1.0"
}
```

### Wallet Management

#### POST /wallets/connect

Connect a wallet using private key or mnemonic.

**Request Body:**
```json
{
  "type": "privateKey", // or "mnemonic"
  "privateKey": "0x...", // required for privateKey type
  "mnemonic": "word1 word2 ...", // required for mnemonic type
  "derivationIndex": 0 // optional, defaults to 0
}
```

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "message": "Wallet connected successfully"
}
```

#### GET /wallets/{address}/balance

Get the ETH balance for an address.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "balance": "1.5"
}
```

#### GET /wallets/{address}/vyra-balance

Get the VYR token balance for an address.

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "vyraBalance": "1000.0"
}
```

#### POST /wallets/{address}/send

Send VYR tokens to another address.

**Request Body:**
```json
{
  "to": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "amount": "10.5",
  "description": "Payment for services" // optional
}
```

**Response:**
```json
{
  "txHash": "0x1234567890abcdef...",
  "message": "Payment sent successfully"
}
```

### Payment Processing

#### POST /payments/invoice

Create a payment invoice.

**Request Body:**
```json
{
  "amount": "100.0",
  "description": "Invoice for services",
  "expiry": 1640995200 // optional, Unix timestamp
}
```

**Response:**
```json
{
  "invoiceId": "abc123def456...",
  "message": "Invoice created successfully"
}
```

#### GET /payments/{id}

Get payment information by ID.

**Response:**
```json
{
  "id": "abc123def456...",
  "status": "pending",
  "amount": "100.0",
  "description": "Invoice for services"
}
```

#### POST /payments/{id}/process

Process a payment for an invoice.

**Request Body:**
```json
{
  "customer": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
}
```

**Response:**
```json
{
  "txHash": "0x1234567890abcdef...",
  "message": "Payment processed successfully"
}
```

### Bridge Operations

#### POST /bridge/deposit

Initiate a deposit to L2.

**Request Body:**
```json
{
  "amount": "50.0"
}
```

**Response:**
```json
{
  "depositId": "def456ghi789...",
  "message": "Deposit initiated successfully"
}
```

#### POST /bridge/withdraw

Initiate a withdrawal from L2.

**Request Body:**
```json
{
  "amount": "25.0",
  "l2TxHash": "0xabcdef123456...",
  "signatures": ["0x123...", "0x456..."]
}
```

**Response:**
```json
{
  "withdrawalId": "ghi789jkl012...",
  "message": "Withdrawal initiated successfully"
}
```

#### GET /bridge/status/{id}

Get the status of a bridge transaction.

**Response:**
```json
{
  "id": "def456ghi789...",
  "status": "pending",
  "type": "deposit"
}
```

### Paymaster Services

#### POST /paymaster/session-key

Create a session key for gasless transactions.

**Request Body:**
```json
{
  "expiry": 1640995200 // Unix timestamp
}
```

**Response:**
```json
{
  "sessionKey": "0x1234567890abcdef...",
  "message": "Session key created successfully"
}
```

#### DELETE /paymaster/session-key

Revoke the current session key.

**Response:**
```json
{
  "message": "Session key revoked successfully"
}
```

#### POST /paymaster/sponsor

Sponsor gas for a transaction.

**Request Body:**
```json
{
  "user": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "gasUsed": "21000",
  "signature": "0x1234567890abcdef..."
}
```

**Response:**
```json
{
  "txHash": "0x1234567890abcdef...",
  "message": "Gas sponsored successfully"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error message describing what went wrong"
}
```

## Rate Limiting

API requests are rate limited to prevent abuse:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## SDK Usage

The Vyra TypeScript SDK provides a convenient way to interact with the API:

```typescript
import { VyraSDK } from '@vyra/sdk';

// Initialize SDK
const sdk = new VyraSDK({
  rpcUrl: 'http://localhost:8545',
  chainId: 31337,
  vyraTokenAddress: '0x...',
  paymasterAddress: '0x...',
  posAddress: '0x...',
  bridgeAddress: '0x...',
  entryPointAddress: '0x...'
});

// Connect wallet
const wallet = sdk.getWallet();
wallet.connect('0x...');

// Send payment
const result = await wallet.sendPayment({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: '10.0',
  description: 'Payment for services'
});

console.log('Transaction hash:', result.data);
```

## Webhooks

Webhook endpoints for real-time notifications (coming soon):

- `POST /webhooks/payment` - Payment status updates
- `POST /webhooks/bridge` - Bridge transaction updates
- `POST /webhooks/session` - Session key events

## Support

For API support and questions:
- Email: api-support@vyra.com
- Documentation: https://docs.vyra.com
- GitHub Issues: https://github.com/vyra/vyra/issues
