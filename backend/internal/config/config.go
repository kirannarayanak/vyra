package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port         string
	DatabaseURL  string
	RedisURL     string
	RPCURL       string
	ChainID      int64
	LogLevel     string
	JWTSecret    string
	VyraToken    string
	Paymaster    string
	POS          string
	Bridge       string
	EntryPoint   string
}

func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	chainID, _ := strconv.ParseInt(getEnv("CHAIN_ID", "31337"), 10, 64)

	return &Config{
		Port:         getEnv("PORT", "8080"),
		DatabaseURL:  getEnv("DATABASE_URL", "postgres://localhost/vyra?sslmode=disable"),
		RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379"),
		RPCURL:       getEnv("RPC_URL", "http://localhost:8545"),
		ChainID:      chainID,
		LogLevel:     getEnv("LOG_LEVEL", "info"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key"),
		VyraToken:    getEnv("VYRA_TOKEN_ADDRESS", "0x5FbDB2315678afecb367f032d93F642f64180aa3"),
		Paymaster:    getEnv("PAYMASTER_ADDRESS", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"),
		POS:          getEnv("POS_ADDRESS", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"),
		Bridge:       getEnv("BRIDGE_ADDRESS", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"),
		EntryPoint:   getEnv("ENTRY_POINT_ADDRESS", "0x0165878A594ca255338adfa4d48449f69242Eb8F"),
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
