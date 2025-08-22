import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../src/constants/theme';

export const SplashGenerator = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>SHANTHI</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 1242, // High-res size for splash
    height: 2436,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 72,
    fontFamily: 'Roboto',
    letterSpacing: 4,
  },
});
