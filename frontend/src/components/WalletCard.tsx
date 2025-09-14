import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WalletState } from '../types';

interface WalletCardProps {
  walletState: WalletState;
  onSendPress: () => void;
  onReceivePress: () => void;
  onRefreshPress: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  walletState,
  onSendPress,
  onReceivePress,
  onRefreshPress,
}) => {
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num < 0.001) return '< 0.001';
    return num.toFixed(3);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vyra Wallet</Text>
        <TouchableOpacity onPress={onRefreshPress} style={styles.refreshButton}>
          <Text style={styles.refreshText}>↻</Text>
        </TouchableOpacity>
      </View>

      {walletState.isConnected ? (
        <>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Address</Text>
            <Text style={styles.address}>{formatAddress(walletState.address || '')}</Text>
          </View>

          <View style={styles.balanceContainer}>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>ETH Balance</Text>
              <Text style={styles.balanceValue}>{formatBalance(walletState.balance)} ETH</Text>
            </View>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>VYR Balance</Text>
              <Text style={styles.balanceValue}>{formatBalance(walletState.vyraBalance)} VYR</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.sendButton]} onPress={onSendPress}>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.receiveButton]} onPress={onReceivePress}>
              <Text style={styles.actionButtonText}>Receive</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.disconnectedContainer}>
          <Text style={styles.disconnectedText}>Wallet not connected</Text>
          <Text style={styles.disconnectedSubtext}>Connect your wallet to get started</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
    color: '#00d4ff',
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  balanceContainer: {
    marginBottom: 24,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#888888',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#ff6b6b',
  },
  receiveButton: {
    backgroundColor: '#4ecdc4',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  disconnectedContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  disconnectedText: {
    fontSize: 18,
    color: '#888888',
    marginBottom: 8,
  },
  disconnectedSubtext: {
    fontSize: 14,
    color: '#666666',
  },
});
