import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { WalletCard } from '../components/WalletCard';
import { ConnectWallet } from '../components/ConnectWallet';
import { useWallet } from '../hooks/useWallet';

export const HomeScreen: React.FC = () => {
  const {
    walletState,
    isLoading,
    error,
    connectWithPrivateKey,
    connectWithMnemonic,
    refreshBalances,
    disconnect,
  } = useWallet();

  const handleConnect = async (type: 'privateKey' | 'mnemonic', value: string, index?: number) => {
    try {
      if (type === 'privateKey') {
        await connectWithPrivateKey(value);
      } else {
        await connectWithMnemonic(value, index);
      }
    } catch (err) {
      Alert.alert('Connection Failed', (err as Error).message);
    }
  };

  const handleSendPress = () => {
    Alert.alert('Send', 'Send functionality would be implemented here');
  };

  const handleReceivePress = () => {
    Alert.alert('Receive', 'Receive functionality would be implemented here');
  };

  const handleRefreshPress = async () => {
    try {
      await refreshBalances();
    } catch (err) {
      Alert.alert('Refresh Failed', (err as Error).message);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Disconnect', style: 'destructive', onPress: disconnect },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {walletState.isConnected ? (
          <WalletCard
            walletState={walletState}
            onSendPress={handleSendPress}
            onReceivePress={handleReceivePress}
            onRefreshPress={handleRefreshPress}
          />
        ) : (
          <ConnectWallet onConnect={handleConnect} isLoading={isLoading} />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {walletState.isConnected && (
          <View style={styles.disconnectContainer}>
            <button
              style={styles.disconnectButton}
              onPress={handleDisconnect}
              title="Disconnect Wallet"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  errorContainer: {
    backgroundColor: '#2a1a00',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 14,
    color: '#ff6b6b',
  },
  disconnectContainer: {
    padding: 16,
  },
  disconnectButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
});
