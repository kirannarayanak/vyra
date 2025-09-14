#!/bin/bash

# Vyra Deployment Script
set -e

echo "🚀 Starting Vyra deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from env.example...${NC}"
    cp env.example .env
    echo -e "${YELLOW}📝 Please update .env with your configuration before running again.${NC}"
    exit 1
fi

# Load environment variables
source .env

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists forge; then
    echo -e "${RED}❌ Foundry not found. Please install Foundry first.${NC}"
    echo "Run: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

if ! command_exists go; then
    echo -e "${RED}❌ Go not found. Please install Go 1.21+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites found${NC}"

# Deploy smart contracts
echo "📦 Deploying smart contracts..."
cd contracts

# Install dependencies
echo "📥 Installing contract dependencies..."
forge install

# Build contracts
echo "🔨 Building contracts..."
forge build

# Run tests
echo "🧪 Running contract tests..."
forge test

# Deploy contracts (this would need to be implemented)
echo "🚀 Deploying contracts to ${RPC_URL}..."
# forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify

cd ..

# Build and start backend
echo "🔧 Building backend service..."
cd backend

# Install Go dependencies
echo "📥 Installing Go dependencies..."
go mod tidy

# Build backend
echo "🔨 Building backend binary..."
go build -o bin/vyra-backend cmd/server/main.go

# Start backend in background
echo "🚀 Starting backend service..."
./bin/vyra-backend &
BACKEND_PID=$!

cd ..

# Build and start frontend
echo "🎨 Building frontend..."
cd frontend

# Install dependencies
echo "📥 Installing frontend dependencies..."
npm install

# Start frontend development server
echo "🚀 Starting frontend development server..."
npm run web &
FRONTEND_PID=$!

cd ..

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."

# Check backend
if curl -f http://localhost:8080/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend service is running${NC}"
else
    echo -e "${RED}❌ Backend service failed to start${NC}"
fi

# Check frontend
if curl -f http://localhost:19006 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend service is running${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend service may still be starting...${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Vyra deployment completed!${NC}"
echo ""
echo "📱 Frontend: http://localhost:19006"
echo "🔧 Backend API: http://localhost:8080"
echo "📊 Health Check: http://localhost:8080/health"
echo ""
echo "🛑 To stop services, run:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "📚 For more information, see README.md"
