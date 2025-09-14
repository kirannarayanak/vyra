package wallet

import (
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"strings"

	"vyra-backend/internal/config"

	"github.com/ethereum/go-ethereum/accounts"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

type Service struct {
	config     *config.Config
	client     *ethclient.Client
	vyraToken  common.Address
}

func New(cfg *config.Config) *Service {
	client, err := ethclient.Dial(cfg.RPCURL)
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to Ethereum client: %v", err))
	}

	return &Service{
		config:    cfg,
		client:    client,
		vyraToken: common.HexToAddress(cfg.VyraToken),
	}
}

func (s *Service) Connect(connectionType, privateKey, mnemonic string, derivationIndex int) (string, error) {
	var privateKeyECDSA *ecdsa.PrivateKey
	var err error

	switch connectionType {
	case "privateKey":
		if !strings.HasPrefix(privateKey, "0x") {
			privateKey = "0x" + privateKey
		}
		privateKeyECDSA, err = crypto.HexToECDSA(privateKey[2:])
		if err != nil {
			return "", fmt.Errorf("invalid private key: %v", err)
		}
	case "mnemonic":
		// This would typically use a proper mnemonic derivation library
		// For now, we'll just return an error
		return "", fmt.Errorf("mnemonic connection not implemented yet")
	default:
		return "", fmt.Errorf("unsupported connection type: %s", connectionType)
	}

	publicKey := privateKeyECDSA.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", fmt.Errorf("error casting public key to ECDSA")
	}

	address := crypto.PubkeyToAddress(*publicKeyECDSA)
	return address.Hex(), nil
}

func (s *Service) GetBalance(address string) (string, error) {
	account := common.HexToAddress(address)
	balance, err := s.client.BalanceAt(nil, account, nil)
	if err != nil {
		return "", err
	}

	// Convert wei to ether
	ethBalance := new(big.Float).SetInt(balance)
	ethBalance = ethBalance.Quo(ethBalance, big.NewFloat(1e18))
	
	return ethBalance.Text('f', 18), nil
}

func (s *Service) GetVyraBalance(address string) (string, error) {
	// This would typically call the VYR token contract
	// For now, return a placeholder
	return "0.0", nil
}

func (s *Service) SendPayment(from, to, amount, description string) (string, error) {
	// This would typically create and send a transaction
	// For now, return a placeholder
	return "0xplaceholder_tx_hash", nil
}
