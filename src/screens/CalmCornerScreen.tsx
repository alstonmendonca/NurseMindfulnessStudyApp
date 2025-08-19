import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { BreathingCircle } from '../components/BreathingCircle';
import { SoundPlayer } from '../components/SoundPlayer';
import { GratitudeLog } from '../components/GratitudeLog';

type Props = NativeStackScreenProps<MainStackParamList, 'CalmCorner'>;

type BreathingPhase = 'inhale' | 'hold' | 'exhale';

interface Sound {
  name: string;
  source: any; // Will be properly typed when we add the audio files
}

const sounds: Sound[] = [
  { name: 'White Noise', source: null },
  { name: 'Brown Noise', source: null },
  { name: 'Ocean Waves', source: null },
  { name: 'Rain', source: null },
];

const groundingExercises = [
  '5 things you can see',
  '4 things you can touch',
  '3 things you can hear',
  '2 things you can smell',
  '1 thing you can taste',
];

export const CalmCornerScreen: React.FC<Props> = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('inhale');
  const [breathingDuration, setBreathingDuration] = useState<1 | 3 | 5>(1);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentGroundingIndex, setCurrentGroundingIndex] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const startBreathing = async (duration: 1 | 3 | 5) => {
    setBreathingDuration(duration);
    setIsBreathing(true);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    let totalCycles = breathingDuration * 3; // 3 cycles per minute
    let currentCycle = 0;

    const cycle = () => {
      if (currentCycle >= totalCycles) {
        setIsBreathing(false);
        setBreathingPhase('inhale');
        return;
      }

      // 4 seconds inhale
      setBreathingPhase('inhale');
      setTimeout(() => {
        // 2 seconds hold
        setBreathingPhase('hold');
        setTimeout(() => {
          // 4 seconds exhale
          setBreathingPhase('exhale');
          setTimeout(() => {
            currentCycle++;
            cycle();
          }, 4000);
        }, 2000);
      }, 4000);
    };

    cycle();
  };

  const toggleSound = async (soundName: string) => {
    if (currentSound === soundName) {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      setCurrentSound(null);
      setSound(null);
    } else {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      // In a real app, we would load the actual sound file here
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/placeholder.mp3'),
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
      setCurrentSound(soundName);
    }
  };

  const nextGroundingStep = () => {
    setCurrentGroundingIndex((prev) => 
      prev < groundingExercises.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guided Breathing</Text>
          <View style={styles.breathingContainer}>
            <BreathingCircle
              size={200}
              isBreathing={isBreathing}
              phase={breathingPhase}
            />
            {!isBreathing ? (
              <View style={styles.durationButtons}>
                <PrimaryButton
                  label="1 Min"
                  onPress={() => startBreathing(1)}
                  variant="secondary"
                  style={styles.durationButton}
                />
                <PrimaryButton
                  label="3 Min"
                  onPress={() => startBreathing(3)}
                  variant="secondary"
                  style={styles.durationButton}
                />
                <PrimaryButton
                  label="5 Min"
                  onPress={() => startBreathing(5)}
                  variant="secondary"
                  style={styles.durationButton}
                />
              </View>
            ) : (
              <Text style={styles.breathingText}>
                {breathingPhase === 'inhale' ? 'Breathe In...' :
                 breathingPhase === 'hold' ? 'Hold...' : 'Breathe Out...'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soothing Sounds</Text>
          {sounds.map((sound) => (
            <SoundPlayer
              key={sound.name}
              soundName={sound.name}
              soundSource={sound.source}
              isPlaying={currentSound === sound.name}
              onToggle={toggleSound}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grounding Exercise</Text>
          <View style={styles.groundingContainer}>
            <Text style={styles.groundingText}>
              {groundingExercises[currentGroundingIndex]}
            </Text>
            <PrimaryButton
              label="Next Step"
              onPress={nextGroundingStep}
              style={styles.nextButton}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Gratitude</Text>
          <GratitudeLog />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  breathingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  breathingText: {
    fontSize: 18,
    marginTop: 20,
    color: '#4A90E2',
  },
  durationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  durationButton: {
    flex: 0.3,
  },
  groundingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  groundingText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 26,
  },
  nextButton: {
    width: '50%',
  },
});
