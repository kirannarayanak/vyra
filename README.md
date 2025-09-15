# Vyra (VYR) - Instant Payment Rail

A cash-like, instant, low-fee money rail for everyday payments and remittances.

## 🚀 Overview

Vyra is designed for:
- **P2P transfers** (phone-to-phone, @handles)
- **Merchant payments** (QR, online checkout)
- **Cross-border remittances** (AED↔INR, etc.)
- **Programmable payouts** (salaries, gig work, refunds)
- **Micropayments** (content tipping, pay-per-API-call)

## ✨ Target Experience
- <1s confirmation UX
- ~$0.001–$0.01 fees
- Human-readable pay IDs
- Self-custody or custodial
- No crypto jargon for end users

## 🏗️ Architecture

### Phase 1: L2 (zkEVM Rollup)
- Ethereum L2 with zkEVM rollup
- Account Abstraction (ERC-4337) for web2-simple UX
- ERC-20 token on L2
- Social login and passkey support

### Phase 2: L1 (Future)
- Standalone L1 (Cosmos SDK or Substrate)
- Native Account Abstraction
- IBC/XCMP interoperability

## 💰 Tokenomics

- **Max Supply**: 10,000,000,000 VYR
- **Genesis Circulating**: 2,000,000,000 VYR
- **Target Fee**: $0.002 avg per transaction on L2

### Allocation
- Community & incentives: 35%
- Ecosystem fund/Grants: 20%
- Core contributors: 15%
- Strategic partners/liquidity: 10%
- Foundation/Treasury: 15%
- Public sale: 5%

## 📁 Project Structure

```
├── contracts/          # Smart contracts (Foundry)
│   ├── src/
│   │   ├── VyraToken.sol
│   │   ├── paymasters/
│   │   ├── merchants/
│   │   └── bridge/
│   └── test/
├── frontend/           # React Native wallet + web apps
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── hooks/
│   │   └── services/
│   └── App.tsx
├── backend/            # Go services (relayers, bundlers, indexers)
│   ├── cmd/
│   ├── internal/
│   └── go.mod
├── sdk/                # TypeScript SDK
│   ├── src/
│   └── package.json
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- Foundry
- Docker (optional)

### 1. Clone and Install

```bash
git clone <repository-url>
cd vyra
npm install
```

### 2. Smart Contracts

```bash
cd contracts
forge install
forge build
forge test
```

### 3. Frontend Wallet

```bash
cd frontend
npm install
npm run web  # or npm run ios/android
```

### 4. Backend Service

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### 5. TypeScript SDK

```bash
cd sdk
npm install
npm run build
```

## 🔧 Development

### Smart Contracts

The contracts are built with Foundry and include:

- **VyraToken.sol**: ERC-20 token with fees, pausing, and role-based access
- **VyraPaymaster.sol**: Gas sponsorship and session key management
- **VyraPOS.sol**: Merchant payments and split payouts
- **VyraBridge.sol**: L1↔L2 token bridging

```bash
# Compile contracts
forge build

# Run tests
forge test

# Deploy to local network
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Frontend Wallet

React Native wallet with:
- Private key and mnemonic connection
- Balance display (ETH + VYR)
- Send/receive functionality
- QR code generation
- Biometric authentication (planned)

```bash
# Start development server
npm run dev

# Run on specific platform
npm run ios
npm run android
npm run web
```

### Backend Service

Go backend with:
- REST API for wallet operations
- Payment processing
- Bridge management
- Paymaster services

```bash
# Run server
go run cmd/server/main.go

# Run tests
go test ./...

# Build binary
go build -o bin/vyra-backend cmd/server/main.go
```

### TypeScript SDK

Comprehensive SDK for:
- Wallet management
- Payment processing
- Merchant integration
- Bridge operations

```bash
# Build SDK
npm run build

# Run tests
npm test

# Publish (when ready)
npm publish
```

## 🧪 Testing

### Smart Contracts
```bash
cd contracts
forge test --match-contract VyraTokenTest
forge test --match-contract VyraPaymasterTest
```

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
go test ./...
```

## 🚀 Deployment

### Smart Contracts

1. **Local Development**:
   ```bash
   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
   ```

2. **Testnet**:
   ```bash
   forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
   ```

3. **Mainnet**:
   ```bash
   forge script script/Deploy.s.sol --rpc-url $MAINNET_RPC_URL --broadcast --verify
   ```

### Frontend

1. **Expo Build**:
   ```bash
   cd frontend
   expo build:android
   expo build:ios
   ```

2. **Web Deployment**:
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ to your hosting service
   ```

### Backend

1. **Docker**:
   ```bash
   cd backend
   docker build -t vyra-backend .
   docker run -p 8080:8080 vyra-backend
   ```

2. **Binary**:
   ```bash
   cd backend
   go build -o bin/vyra-backend cmd/server/main.go
   ./bin/vyra-backend
   ```

## 📊 Monitoring

### Smart Contracts
- Contract verification on Etherscan
- Gas usage monitoring
- Event logging and indexing

### Backend
- Health check endpoint: `/health`
- Prometheus metrics (planned)
- Structured logging with logrus

### Frontend
- Error tracking (planned)
- Analytics (planned)
- Performance monitoring (planned)

## 🔒 Security

### Smart Contracts
- 100% branch-critical test coverage
- Formal verification for critical contracts
- 2+ independent security audits
- Continuous monitoring and bug bounty program

### Backend
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Secure headers

### Frontend
- Secure storage for private keys
- Biometric authentication
- Input validation
- Error handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs.vyra.com](https://docs.vyra.com)
- Discord: [discord.gg/vyra](https://discord.gg/vyra)
- Twitter: [@vyra_pay](https://twitter.com/vyra_pay)
- Email: support@vyra.com

## 🗺️ Roadmap

### Q1 2024
- [x] Core smart contracts
- [x] Basic wallet app
- [x] TypeScript SDK
- [x] Backend services

### Q2 2024
- [ ] L2 testnet deployment
- [ ] Merchant integrations
- [ ] Mobile app stores
- [ ] Security audits

### Q3 2024
- [ ] Mainnet deployment
- [ ] Exchange listings
- [ ] Fiat on/off ramps
- [ ] Advanced features

### Q4 2024
- [ ] L1 research
- [ ] Governance launch
- [ ] Ecosystem expansion
- [ ] Global partnerships

---

**Built with ❤️ by the Vyra team**# Deployment trigger Mon Sep 15 09:29:31 +04 2025
