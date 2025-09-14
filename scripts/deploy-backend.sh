#!/bin/bash

echo "🚀 Deploying Vyra Backend to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway project create vyra-backend

# Set environment variables
echo "⚙️  Setting environment variables..."
railway variables set PORT=8080
railway variables set RPC_URL="https://sepolia.infura.io/v3/fbf51b3dbcef49a5a19de67ab30c9939"
railway variables set CHAIN_ID=11155111
railway variables set VYRA_TOKEN_ADDRESS="0x60a3712ba5D540DC9F9D60E3301216FDa9303ceC"
railway variables set PAYMASTER_ADDRESS="0x452Fe560171Fee16Fa1A654fd334ecaFB31bc2F1"
railway variables set POS_ADDRESS="0x9c56EfC658abb32F0f957d235456AE9Ba73B2280"
railway variables set BRIDGE_ADDRESS="0xE43b350CeBd4Ae235d068EE71440C854ECF5b910"
railway variables set ENTRY_POINT_ADDRESS="0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"
railway variables set JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Deploy
echo "🚀 Deploying to Railway..."
cd backend
railway up

echo "✅ Backend deployed successfully!"
echo "🌐 Check your Railway dashboard for the deployment URL"
