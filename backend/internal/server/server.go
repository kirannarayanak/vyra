package server

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"vyra-backend/internal/config"
	"vyra-backend/internal/handlers"
	"vyra-backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Server struct {
	config  *config.Config
	router  *gin.Engine
	server  *http.Server
	handler *handlers.Handler
}

func New(cfg *config.Config) *Server {
	// Set log level
	level, err := logrus.ParseLevel(cfg.LogLevel)
	if err != nil {
		level = logrus.InfoLevel
	}
	logrus.SetLevel(level)

	// Create router
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())
	router.Use(middleware.CORS())

	// Create handler
	handler := handlers.New(cfg)

	// Setup routes
	setupRoutes(router, handler)

	return &Server{
		config:  cfg,
		router:  router,
		handler: handler,
	}
}

func (s *Server) Start() error {
	s.server = &http.Server{
		Addr:         ":" + s.config.Port,
		Handler:      s.router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	logrus.Infof("Server starting on port %s", s.config.Port)
	return s.server.ListenAndServe()
}

func (s *Server) Stop(ctx context.Context) error {
	logrus.Info("Server shutting down...")
	return s.server.Shutdown(ctx)
}

func setupRoutes(router *gin.Engine, handler *handlers.Handler) {
	// Health check
	router.GET("/health", handler.HealthCheck)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Wallet routes
		wallets := v1.Group("/wallets")
		{
			wallets.POST("/connect", handler.ConnectWallet)
			wallets.GET("/:address/balance", handler.GetBalance)
			wallets.GET("/:address/vyra-balance", handler.GetVyraBalance)
			wallets.POST("/:address/send", handler.SendPayment)
		}

		// Payment routes
		payments := v1.Group("/payments")
		{
			payments.POST("/invoice", handler.CreateInvoice)
			payments.GET("/:id", handler.GetPayment)
			payments.POST("/:id/process", handler.ProcessPayment)
		}

		// Bridge routes
		bridge := v1.Group("/bridge")
		{
			bridge.POST("/deposit", handler.Deposit)
			bridge.POST("/withdraw", handler.Withdraw)
			bridge.GET("/status/:id", handler.GetBridgeStatus)
		}

		// Paymaster routes
		paymaster := v1.Group("/paymaster")
		{
			paymaster.POST("/session-key", handler.CreateSessionKey)
			paymaster.DELETE("/session-key", handler.RevokeSessionKey)
			paymaster.POST("/sponsor", handler.SponsorGas)
		}
	}
}
