-- Vyra Database Initialization Script

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS vyra;

-- Use the vyra database
\c vyra;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    address VARCHAR(42) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR(42) UNIQUE NOT NULL,
    private_key_encrypted TEXT, -- Encrypted private key
    mnemonic_encrypted TEXT, -- Encrypted mnemonic
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hash VARCHAR(66) UNIQUE NOT NULL,
    from_address VARCHAR(42) NOT NULL,
    to_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    fee DECIMAL(36, 18) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    type VARCHAR(20) NOT NULL, -- 'send', 'receive', 'swap', 'bridge'
    block_number BIGINT,
    gas_used BIGINT,
    gas_price BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    description TEXT,
    expiry TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending',
    payment_id UUID REFERENCES transactions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id VARCHAR(64) UNIQUE NOT NULL,
    invoice_id UUID REFERENCES invoices(id),
    customer_address VARCHAR(42) NOT NULL,
    merchant_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    merchant_fee DECIMAL(36, 18) DEFAULT 0,
    platform_fee DECIMAL(36, 18) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create bridge_transactions table
CREATE TABLE IF NOT EXISTS bridge_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    direction VARCHAR(10) NOT NULL, -- 'deposit', 'withdrawal'
    status VARCHAR(20) DEFAULT 'pending',
    l1_tx_hash VARCHAR(66),
    l2_tx_hash VARCHAR(66),
    signatures TEXT[], -- Array of signatures
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create session_keys table
CREATE TABLE IF NOT EXISTS session_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(42) NOT NULL,
    session_key VARCHAR(42) NOT NULL,
    nonce BIGINT DEFAULT 0,
    expiry TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create paymaster_sponsorships table
CREATE TABLE IF NOT EXISTS paymaster_sponsorships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_address VARCHAR(42) NOT NULL,
    gas_used BIGINT NOT NULL,
    vyr_cost DECIMAL(36, 18) NOT NULL,
    transaction_hash VARCHAR(66) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users(address);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);
CREATE INDEX IF NOT EXISTS idx_transactions_from_address ON transactions(from_address);
CREATE INDEX IF NOT EXISTS idx_transactions_to_address ON transactions(to_address);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_id ON invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_address ON invoices(merchant_address);
CREATE INDEX IF NOT EXISTS idx_payments_payment_id ON payments(payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_address ON payments(customer_address);
CREATE INDEX IF NOT EXISTS idx_payments_merchant_address ON payments(merchant_address);
CREATE INDEX IF NOT EXISTS idx_bridge_transactions_transaction_id ON bridge_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bridge_transactions_user_address ON bridge_transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_session_keys_user_address ON session_keys(user_address);
CREATE INDEX IF NOT EXISTS idx_session_keys_session_key ON session_keys(session_key);
CREATE INDEX IF NOT EXISTS idx_paymaster_sponsorships_user_address ON paymaster_sponsorships(user_address);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bridge_transactions_updated_at BEFORE UPDATE ON bridge_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_keys_updated_at BEFORE UPDATE ON session_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development
INSERT INTO users (address) VALUES 
    ('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'),
    ('0x8ba1f109551bD432803012645Hac136c4c8e4e4')
ON CONFLICT (address) DO NOTHING;

-- Create views for common queries
CREATE OR REPLACE VIEW user_balances AS
SELECT 
    u.address,
    COALESCE(SUM(CASE WHEN t.type = 'receive' THEN t.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.type = 'send' THEN t.amount ELSE 0 END), 0) as balance
FROM users u
LEFT JOIN transactions t ON u.address = t.from_address OR u.address = t.to_address
GROUP BY u.address;

CREATE OR REPLACE VIEW merchant_stats AS
SELECT 
    p.merchant_address,
    COUNT(*) as total_payments,
    SUM(p.amount) as total_volume,
    SUM(p.merchant_fee) as total_fees,
    AVG(p.amount) as avg_payment_amount
FROM payments p
WHERE p.status = 'confirmed'
GROUP BY p.merchant_address;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE vyra TO vyra;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vyra;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO vyra;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO vyra;
