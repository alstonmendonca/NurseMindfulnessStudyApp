
import React from 'react';
import { StyleSheet, View, Image } from 'react-native';

type Props = {
  size: number;
};

export const BreathingCircle: React.FC<Props> = ({ size }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/breathing.gif')}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
