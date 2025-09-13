import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { networkManager, ConnectivityState } from '../utils/networkManager';

interface InternetRequiredScreenProps {
  onInternetConnected?: () => void;
}

export const WiFiRequiredScreen: React.FC<InternetRequiredScreenProps> = ({ onInternetConnected }) => {
  const [connectivityState, setConnectivityState] = useState<ConnectivityState>({
    isConnected: false,
    isWiFi: false,
    isInternetReachable: null,
  });
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeNetworkCheck = async () => {
      // Initialize network manager
      const initialState = await networkManager.initialize();
      
      if (mounted) {
        setConnectivityState(initialState);
        setIsChecking(false);

        // If internet is already connected, proceed
        if (networkManager.hasInternetConnection()) {
          onInternetConnected?.();
          return;
        }
      }

      // Listen for connectivity changes
      const handleConnectivityChange = (state: ConnectivityState) => {
        if (mounted) {
          setConnectivityState(state);
          
          // Auto-proceed when internet becomes available
          if (networkManager.hasInternetConnection()) {
            onInternetConnected?.();
          }
        }
      };

      networkManager.addConnectivityListener(handleConnectivityChange);

      return () => {
        networkManager.removeConnectivityListener(handleConnectivityChange);
      };
    };

    const cleanup = initializeNetworkCheck();

    return () => {
      mounted = false;
      cleanup.then(cleanupFn => cleanupFn && cleanupFn());
    };
  }, [onInternetConnected]);

  const handleRetryConnection = async () => {
    setIsChecking(true);
    
    // Check for internet connection with 10 second timeout
    const startTime = Date.now();
    const timeout = 10000;
    
    const checkConnection = () => {
      if (networkManager.hasInternetConnection()) {
        setIsChecking(false);
        onInternetConnected?.();
        return;
      }
      
      if (Date.now() - startTime < timeout) {
        setTimeout(checkConnection, 1000);
      } else {
        setIsChecking(false);
      }
    };
    
    checkConnection();
  };

  const getConnectionStatus = () => {
    if (isChecking) {
      return { icon: 'wifi-off', message: 'Checking internet connection...', color: theme.colors.textSecondary };
    }

    if (!connectivityState.isConnected) {
      return { icon: 'wifi-off', message: 'No internet connection', color: theme.colors.error };
    }

    if (connectivityState.isInternetReachable === false) {
      return { icon: 'wifi-off', message: 'Connected but no internet access', color: theme.colors.warning };
    }

    if (connectivityState.isInternetReachable === true) {
      return { icon: 'wifi', message: 'Internet connected', color: theme.colors.success };
    }

    return { icon: 'wifi', message: 'Connecting...', color: theme.colors.success };
  };

  const status = getConnectionStatus();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Internet Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${status.color}15` }]}>
          <MaterialIcons name={status.icon as any} size={80} color={status.color} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Internet Connection Required</Text>

        {/* Status Message */}
        <Text style={[styles.statusMessage, { color: status.color }]}>
          {status.message}
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          This app requires a stable internet connection (WiFi or mobile data) to ensure 
          accurate data synchronization and the best user experience for the mindfulness study.
        </Text>

        {/* Connection Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <MaterialIcons 
              name={connectivityState.isConnected ? "check-circle" : "cancel"} 
              size={20} 
              color={connectivityState.isConnected ? theme.colors.success : theme.colors.error} 
            />
            <Text style={styles.detailText}>Internet Connection</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons 
              name={connectivityState.isInternetReachable ? "check-circle" : "cancel"} 
              size={20} 
              color={connectivityState.isInternetReachable ? theme.colors.success : theme.colors.error} 
            />
            <Text style={styles.detailText}>Internet Access</Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons 
              name={connectivityState.isWiFi ? "wifi" : "signal-cellular-4-bar"} 
              size={20} 
              color={connectivityState.isConnected ? theme.colors.success : theme.colors.textSecondary} 
            />
            <Text style={styles.detailText}>
              {connectivityState.isWiFi ? "WiFi Network" : "Mobile Data"}
            </Text>
          </View>
        </View>

        {/* Retry Button */}
        <TouchableOpacity 
          style={[styles.retryButton, isChecking && styles.retryButtonDisabled]}
          onPress={handleRetryConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <ActivityIndicator size="small" color={theme.colors.textOnPrimary} />
          ) : (
            <MaterialIcons name="refresh" size={20} color={theme.colors.textOnPrimary} />
          )}
          <Text style={styles.retryButtonText}>
            {isChecking ? 'Checking...' : 'Check Again'}
          </Text>
        </TouchableOpacity>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Please ensure you're connected to the internet (via WiFi or mobile data) and try again.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  statusMessage: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  description: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  detailsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    width: '100%',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  retryButtonDisabled: {
    opacity: 0.7,
  },
  retryButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textOnPrimary,
    marginLeft: theme.spacing.sm,
  },
  helpText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
