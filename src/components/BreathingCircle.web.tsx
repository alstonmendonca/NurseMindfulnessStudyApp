import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface BreathingCircleProps {
  size: number;
  isBreathing: boolean;
  breathDuration?: number;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
  size,
  isBreathing,
  breathDuration = 4000,
}) => {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (isBreathing) {
      Animated.loop(
        Animated.sequence([
          // Inhale
          Animated.timing(scale, {
            toValue: 1,
            duration: breathDuration / 2,
            useNativeDriver: true,
          }),
          // Exhale
          Animated.timing(scale, {
            toValue: 0.5,
            duration: breathDuration / 2,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scale.setValue(0.5);
    }

    return () => {
      scale.stopAnimation();
    };
  }, [isBreathing, breathDuration, scale]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: 999,
    backgroundColor: '#4A90E2',
    opacity: 0.8,
  },
});
