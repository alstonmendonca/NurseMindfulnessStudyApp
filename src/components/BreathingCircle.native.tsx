import React, { useCallback } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';

interface BreathingCircleProps {
  size: number;
  isBreathing: boolean;
  phase: 'inhale' | 'hold' | 'exhale';
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ 
  size,
  isBreathing,
  phase
}) => {
  const progress = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(0.5)).current;

  const animate = useCallback((value: number, animation: Animated.Value) => {
    const duration = phase === 'hold' ? 2000 : 4000;
    Animated.timing(animation, {
      toValue: value,
      duration,
      useNativeDriver: true
    }).start();
  }, [phase]);

  React.useEffect(() => {
    if (isBreathing) {
      switch (phase) {
        case 'inhale':
          animate(1, scale);
          animate(1, progress);
          break;
        case 'hold':
          animate(1, progress);
          break;
        case 'exhale':
          animate(0.5, scale);
          animate(0, progress);
          break;
      }
    }
  }, [isBreathing, phase, animate]);

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size * 0.4);

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  const currentScale = scale.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0.5, 1]
  });

  return (
    <Canvas style={{ width: size, height: size }}>
      <Group blendMode="multiply">
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          opacity={opacity as unknown as number}
          transform={[{ scale: currentScale as unknown as number }]}
          color="#4A90E2"
        />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
