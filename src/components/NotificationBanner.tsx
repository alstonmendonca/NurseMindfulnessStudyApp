import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';

interface NotificationBannerProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onHide: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  message,
  type,
  visible,
  onHide,
}) => {
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        hide();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const hide = () => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        type === 'success' ? styles.successContainer : styles.errorContainer,
        { transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 1000,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successContainer: {
    backgroundColor: '#4CAF50',
  },
  errorContainer: {
    backgroundColor: '#F44336',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
