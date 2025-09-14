package services

import (
	"vyra-backend/internal/config"
	"vyra-backend/internal/services/bridge"
	"vyra-backend/internal/services/payment"
	"vyra-backend/internal/services/paymaster"
	"vyra-backend/internal/services/wallet"
)

type Services struct {
	Wallet    *wallet.Service
	Payment   *payment.Service
	Bridge    *bridge.Service
	Paymaster *paymaster.Service
}

func New(cfg *config.Config) *Services {
	return &Services{
		Wallet:    wallet.New(cfg),
		Payment:   payment.New(cfg),
		Bridge:    bridge.New(cfg),
		Paymaster: paymaster.New(cfg),
	}
}
