# Vyra Deployment Guide

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Go 1.21+
- Foundry (for smart contracts)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd vyra
cp env.example .env
# Edit .env with your configuration
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Deploy Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Build contracts
forge build

# Run tests
forge test

# Deploy to local network
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Verify contracts
forge script script/Verify.s.sol --rpc-url http://localhost:8545
```

### 4. Access Services

- **Frontend**: http://localhost:19006
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health
- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090

## Production Deployment

### 1. Environment Setup

```bash
# Production environment variables
export NODE_ENV=production
export RPC_URL=https://your-ethereum-node.com
export CHAIN_ID=1
export DATABASE_URL=postgres://user:pass@host:5432/vyra
export REDIS_URL=redis://host:6379
export JWT_SECRET=your-secure-jwt-secret
```

### 2. Smart Contract Deployment

```bash
cd contracts

# Deploy to mainnet
forge script script/Deploy.s.sol \
  --rpc-url $MAINNET_RPC_URL \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Update environment variables with deployed addresses
```

### 3. Backend Deployment

#### Using Docker

```bash
# Build production image
docker build -t vyra-backend:latest ./backend

# Run container
docker run -d \
  --name vyra-backend \
  -p 8080:8080 \
  -e DATABASE_URL=$DATABASE_URL \
  -e REDIS_URL=$REDIS_URL \
  -e RPC_URL=$RPC_URL \
  vyra-backend:latest
```

#### Using Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vyra-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: vyra-backend
  template:
    metadata:
      labels:
        app: vyra-backend
    spec:
      containers:
      - name: vyra-backend
        image: vyra-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: vyra-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: vyra-secrets
              key: redis-url
        - name: RPC_URL
          valueFrom:
            secretKeyRef:
              name: vyra-secrets
              key: rpc-url
```

### 4. Frontend Deployment

#### Web App

```bash
cd frontend

# Build for production
npm run build

# Deploy to CDN/hosting service
# Upload dist/ folder to your hosting provider
```

#### Mobile App

```bash
cd frontend

# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Submit to app stores
```

### 5. Database Setup

```bash
# Create production database
createdb vyra_production

# Run migrations
psql vyra_production < scripts/init-db.sql

# Set up backups
pg_dump vyra_production > backup_$(date +%Y%m%d).sql
```

### 6. Monitoring Setup

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'vyra-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/metrics'
```

#### Grafana Dashboards

1. Import Vyra dashboard from `monitoring/grafana/dashboards/`
2. Configure data sources
3. Set up alerts

### 7. Load Balancer Setup

#### Nginx Configuration

```nginx
upstream vyra_backend {
    server backend1:8080;
    server backend2:8080;
    server backend3:8080;
}

server {
    listen 80;
    server_name api.vyra.com;

    location / {
        proxy_pass http://vyra_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Security Considerations

### 1. Private Keys

- Use hardware security modules (HSMs) for production
- Implement key rotation procedures
- Store keys in secure key management systems

### 2. Database Security

- Enable SSL/TLS connections
- Use strong passwords
- Implement access controls
- Regular security updates

### 3. API Security

- Implement rate limiting
- Use HTTPS everywhere
- Validate all inputs
- Implement proper authentication

### 4. Smart Contract Security

- Deploy with proper access controls
- Use multi-signature wallets for admin functions
- Implement emergency pause functionality
- Regular security audits

## Monitoring and Alerting

### 1. Health Checks

```bash
# Check backend health
curl http://localhost:8080/health

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check Redis connectivity
redis-cli -u $REDIS_URL ping
```

### 2. Logging

```bash
# View application logs
docker-compose logs -f backend

# View database logs
docker-compose logs -f postgres

# View Redis logs
docker-compose logs -f redis
```

### 3. Metrics

- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000
- **Custom metrics**: Available at `/metrics` endpoint

## Backup and Recovery

### 1. Database Backups

```bash
# Create backup
pg_dump vyra_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql vyra_production < backup_20240101_120000.sql
```

### 2. Configuration Backups

```bash
# Backup configuration
tar -czf config_backup_$(date +%Y%m%d).tar.gz .env docker-compose.yml
```

### 3. Disaster Recovery

1. **RTO (Recovery Time Objective)**: 4 hours
2. **RPO (Recovery Point Objective)**: 1 hour
3. **Backup frequency**: Every 6 hours
4. **Retention period**: 30 days

## Scaling

### 1. Horizontal Scaling

```yaml
# Kubernetes HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vyra-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vyra-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### 2. Database Scaling

- **Read replicas** for read-heavy workloads
- **Connection pooling** for better performance
- **Caching** with Redis for frequently accessed data

### 3. CDN Setup

- Use CloudFlare or AWS CloudFront
- Cache static assets
- Implement edge computing for better performance

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose ps postgres
   
   # Check logs
   docker-compose logs postgres
   ```

2. **Backend Not Starting**
   ```bash
   # Check environment variables
   docker-compose config
   
   # Check logs
   docker-compose logs backend
   ```

3. **Smart Contract Deployment Issues**
   ```bash
   # Check RPC connection
   curl -X POST -H "Content-Type: application/json" \
     --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
     $RPC_URL
   ```

### Support

- **Documentation**: https://docs.vyra.com
- **GitHub Issues**: https://github.com/vyra/vyra/issues
- **Discord**: https://discord.gg/vyra
- **Email**: support@vyra.com

## Maintenance

### 1. Regular Updates

- **Weekly**: Security updates
- **Monthly**: Dependency updates
- **Quarterly**: Major version updates

### 2. Monitoring

- **24/7**: System monitoring
- **Daily**: Health checks
- **Weekly**: Performance reviews

### 3. Backup Verification

- **Daily**: Backup integrity checks
- **Weekly**: Restore tests
- **Monthly**: Disaster recovery drills
