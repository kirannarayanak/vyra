import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface ConnectWalletProps {
  onConnect: (type: 'privateKey' | 'mnemonic', value: string, index?: number) => void;
  isLoading: boolean;
}

export const ConnectWallet: React.FC<ConnectWalletProps> = ({ onConnect, isLoading }) => {
  const [connectionType, setConnectionType] = useState<'privateKey' | 'mnemonic'>('privateKey');
  const [privateKey, setPrivateKey] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [derivationIndex, setDerivationIndex] = useState('0');

  const handleConnect = () => {
    if (connectionType === 'privateKey') {
      if (!privateKey.trim()) {
        Alert.alert('Error', 'Please enter a private key');
        return;
      }
      onConnect('privateKey', privateKey.trim());
    } else {
      if (!mnemonic.trim()) {
        Alert.alert('Error', 'Please enter a mnemonic phrase');
        return;
      }
      const words = mnemonic.trim().split(' ');
      if (words.length !== 12 && words.length !== 24) {
        Alert.alert('Error', 'Mnemonic must be 12 or 24 words');
        return;
      }
      const index = parseInt(derivationIndex) || 0;
      onConnect('mnemonic', mnemonic.trim(), index);
    }
  };

  const generateRandomWallet = () => {
    // This would typically generate a new wallet
    Alert.alert('Info', 'Wallet generation would be implemented here');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect Wallet</Text>
          <Text style={styles.subtitle}>Connect your existing wallet or create a new one</Text>
        </View>

        <View style={styles.connectionTypeContainer}>
          <TouchableOpacity
            style={[
              styles.connectionTypeButton,
              connectionType === 'privateKey' && styles.connectionTypeButtonActive,
            ]}
            onPress={() => setConnectionType('privateKey')}
          >
            <Text
              style={[
                styles.connectionTypeText,
                connectionType === 'privateKey' && styles.connectionTypeTextActive,
              ]}
            >
              Private Key
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.connectionTypeButton,
              connectionType === 'mnemonic' && styles.connectionTypeButtonActive,
            ]}
            onPress={() => setConnectionType('mnemonic')}
          >
            <Text
              style={[
                styles.connectionTypeText,
                connectionType === 'mnemonic' && styles.connectionTypeTextActive,
              ]}
            >
              Mnemonic
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          {connectionType === 'privateKey' ? (
            <View>
              <Text style={styles.label}>Private Key</Text>
              <TextInput
                style={styles.input}
                value={privateKey}
                onChangeText={setPrivateKey}
                placeholder="Enter your private key (0x...)"
                placeholderTextColor="#666666"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Mnemonic Phrase</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={mnemonic}
                onChangeText={setMnemonic}
                placeholder="Enter your 12 or 24 word mnemonic phrase"
                placeholderTextColor="#666666"
                multiline
                numberOfLines={3}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.label}>Derivation Index (optional)</Text>
              <TextInput
                style={styles.input}
                value={derivationIndex}
                onChangeText={setDerivationIndex}
                placeholder="0"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.connectButton, isLoading && styles.connectButtonDisabled]}
            onPress={handleConnect}
            disabled={isLoading}
          >
            <Text style={styles.connectButtonText}>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.generateButton} onPress={generateRandomWallet}>
            <Text style={styles.generateButtonText}>Generate New Wallet</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Never share your private key or mnemonic phrase with anyone. Vyra will never ask for these details.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
  },
  connectionTypeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  connectionTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  connectionTypeButtonActive: {
    backgroundColor: '#00d4ff',
  },
  connectionTypeText: {
    fontSize: 16,
    color: '#888888',
    fontWeight: '500',
  },
  connectionTypeTextActive: {
    color: '#000000',
  },
  formContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  connectButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonDisabled: {
    backgroundColor: '#333333',
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#888888',
  },
  generateButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00d4ff',
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#00d4ff',
  },
  warningContainer: {
    backgroundColor: '#2a1a00',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  warningText: {
    fontSize: 14,
    color: '#ff6b6b',
    lineHeight: 20,
  },
});
