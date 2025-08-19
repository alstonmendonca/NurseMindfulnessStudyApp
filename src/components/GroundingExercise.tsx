import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import { GroundingExercise as GroundingExerciseType } from '../types/calmCorner';

interface GroundingExerciseProps {
  exercise: GroundingExerciseType;
}

export const GroundingExercise: React.FC<GroundingExerciseProps> = ({
  exercise,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = React.useRef(new Animated.Value(0)).current;

  const startExercise = () => {
    setCurrentStep(0);
    animateProgress();
  };

  const animateProgress = () => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 5000, // 5 seconds per instruction
      useNativeDriver: false,
    }).start(() => {
      if (currentStep < exercise.instructions.length - 1) {
        setCurrentStep(prev => prev + 1);
        animateProgress();
      }
    });
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise.title}</Text>
      <Text style={styles.duration}>Duration: {exercise.duration}</Text>

      {currentStep === -1 ? (
        <TouchableOpacity style={styles.startButton} onPress={startExercise}>
          <Text style={styles.startButtonText}>Start Exercise</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.exerciseContainer}>
          <Text style={styles.instruction}>
            {exercise.instructions[currentStep]}
          </Text>
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressWidth,
                },
              ]}
            />
          </View>
          <Text style={styles.stepCount}>
            Step {currentStep + 1} of {exercise.instructions.length}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseContainer: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  stepCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
});
