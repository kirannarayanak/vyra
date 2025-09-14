package handlers

import (
	"net/http"

	"vyra-backend/internal/config"
	"vyra-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Handler struct {
	config   *config.Config
	services *services.Services
}

func New(cfg *config.Config) *Handler {
	services := services.New(cfg)
	return &Handler{
		config:   cfg,
		services: services,
	}
}

// HealthCheck returns the health status of the service
func (h *Handler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "vyra-backend",
		"version": "0.1.0",
	})
}

// ConnectWallet handles wallet connection
func (h *Handler) ConnectWallet(c *gin.Context) {
	var req struct {
		Type         string `json:"type" binding:"required"`
		PrivateKey   string `json:"privateKey,omitempty"`
		Mnemonic     string `json:"mnemonic,omitempty"`
		DerivationIndex int `json:"derivationIndex,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address, err := h.services.Wallet.Connect(req.Type, req.PrivateKey, req.Mnemonic, req.DerivationIndex)
	if err != nil {
		logrus.WithError(err).Error("Failed to connect wallet")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect wallet"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"message": "Wallet connected successfully",
	})
}

// GetBalance returns the ETH balance for an address
func (h *Handler) GetBalance(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	balance, err := h.services.Wallet.GetBalance(address)
	if err != nil {
		logrus.WithError(err).Error("Failed to get balance")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get balance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"balance": balance,
	})
}

// GetVyraBalance returns the VYR token balance for an address
func (h *Handler) GetVyraBalance(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	balance, err := h.services.Wallet.GetVyraBalance(address)
	if err != nil {
		logrus.WithError(err).Error("Failed to get VYR balance")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get VYR balance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"address": address,
		"vyraBalance": balance,
	})
}

// SendPayment handles VYR token transfers
func (h *Handler) SendPayment(c *gin.Context) {
	address := c.Param("address")
	if address == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Address is required"})
		return
	}

	var req struct {
		To          string `json:"to" binding:"required"`
		Amount      string `json:"amount" binding:"required"`
		Description string `json:"description,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	txHash, err := h.services.Wallet.SendPayment(address, req.To, req.Amount, req.Description)
	if err != nil {
		logrus.WithError(err).Error("Failed to send payment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"txHash": txHash,
		"message": "Payment sent successfully",
	})
}

// CreateInvoice creates a payment invoice
func (h *Handler) CreateInvoice(c *gin.Context) {
	var req struct {
		Amount      string `json:"amount" binding:"required"`
		Description string `json:"description" binding:"required"`
		Expiry      int64  `json:"expiry,omitempty"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoiceID, err := h.services.Payment.CreateInvoice(req.Amount, req.Description, req.Expiry)
	if err != nil {
		logrus.WithError(err).Error("Failed to create invoice")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create invoice"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"invoiceId": invoiceID,
		"message": "Invoice created successfully",
	})
}

// GetPayment retrieves payment information
func (h *Handler) GetPayment(c *gin.Context) {
	paymentID := c.Param("id")
	if paymentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment ID is required"})
		return
	}

	payment, err := h.services.Payment.GetPayment(paymentID)
	if err != nil {
		logrus.WithError(err).Error("Failed to get payment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payment"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

// ProcessPayment processes a payment
func (h *Handler) ProcessPayment(c *gin.Context) {
	paymentID := c.Param("id")
	if paymentID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment ID is required"})
		return
	}

	var req struct {
		Customer string `json:"customer" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	txHash, err := h.services.Payment.ProcessPayment(paymentID, req.Customer)
	if err != nil {
		logrus.WithError(err).Error("Failed to process payment")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process payment"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"txHash": txHash,
		"message": "Payment processed successfully",
	})
}

// Deposit handles bridge deposits
func (h *Handler) Deposit(c *gin.Context) {
	var req struct {
		Amount string `json:"amount" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	depositID, err := h.services.Bridge.Deposit(req.Amount)
	if err != nil {
		logrus.WithError(err).Error("Failed to deposit")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to deposit"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"depositId": depositID,
		"message": "Deposit initiated successfully",
	})
}

// Withdraw handles bridge withdrawals
func (h *Handler) Withdraw(c *gin.Context) {
	var req struct {
		Amount    string `json:"amount" binding:"required"`
		L2TxHash  string `json:"l2TxHash" binding:"required"`
		Signatures []string `json:"signatures" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	withdrawalID, err := h.services.Bridge.Withdraw(req.Amount, req.L2TxHash, req.Signatures)
	if err != nil {
		logrus.WithError(err).Error("Failed to withdraw")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to withdraw"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"withdrawalId": withdrawalID,
		"message": "Withdrawal initiated successfully",
	})
}

// GetBridgeStatus returns the status of a bridge transaction
func (h *Handler) GetBridgeStatus(c *gin.Context) {
	txID := c.Param("id")
	if txID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Transaction ID is required"})
		return
	}

	status, err := h.services.Bridge.GetStatus(txID)
	if err != nil {
		logrus.WithError(err).Error("Failed to get bridge status")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get bridge status"})
		return
	}

	c.JSON(http.StatusOK, status)
}

// CreateSessionKey creates a session key for gasless transactions
func (h *Handler) CreateSessionKey(c *gin.Context) {
	var req struct {
		Expiry int64 `json:"expiry" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sessionKey, err := h.services.Paymaster.CreateSessionKey(req.Expiry)
	if err != nil {
		logrus.WithError(err).Error("Failed to create session key")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create session key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"sessionKey": sessionKey,
		"message": "Session key created successfully",
	})
}

// RevokeSessionKey revokes a session key
func (h *Handler) RevokeSessionKey(c *gin.Context) {
	err := h.services.Paymaster.RevokeSessionKey()
	if err != nil {
		logrus.WithError(err).Error("Failed to revoke session key")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to revoke session key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Session key revoked successfully",
	})
}

// SponsorGas sponsors gas for a transaction
func (h *Handler) SponsorGas(c *gin.Context) {
	var req struct {
		User       string `json:"user" binding:"required"`
		GasUsed    string `json:"gasUsed" binding:"required"`
		Signature  string `json:"signature" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	txHash, err := h.services.Paymaster.SponsorGas(req.User, req.GasUsed, req.Signature)
	if err != nil {
		logrus.WithError(err).Error("Failed to sponsor gas")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to sponsor gas"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"txHash": txHash,
		"message": "Gas sponsored successfully",
	})
}
