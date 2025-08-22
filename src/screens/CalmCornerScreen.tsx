import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { SoundPlayer } from '../components/SoundPlayer';
import { GratitudeLog } from '../components/GratitudeLog';
import { useParticipant } from '../contexts/ParticipantContext';

type Props = NativeStackScreenProps<MainStackParamList, 'CalmCorner'>;

type BreathingPhase = 'inhale' | 'hold' | 'exhale';


import { Audio } from 'expo-av';

interface Sound {
  name: string;
  source: any;
}

const sounds: Sound[] = [
  { name: 'White Noise', source: require('../../assets/sounds/white_noise.mp3') },
  { name: 'Brown Noise', source: require('../../assets/sounds/brown_noise.mp3') },
  { name: 'Ocean Waves', source: require('../../assets/sounds/ocean_noise.mp3') },
  { name: 'Rain', source: require('../../assets/sounds/rain_noise.mp3') },
];

const groundingExercises = [
  '5 things you can see',
  '4 things you can touch',
  '3 things you can hear',
  '2 things you can smell',
  '1 thing you can taste',
];


export const CalmCornerScreen: React.FC<Props> = ({ navigation }) => {
  const { studyGroup } = useParticipant();

  useEffect(() => {
    // Redirect if not in intervention group
    if (studyGroup !== 'intervention') {
      navigation.replace('Home');
    }
  }, [studyGroup, navigation]);

  // If not in intervention group, don't render anything
  if (studyGroup !== 'intervention') {
    return null;
  }

  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<BreathingPhase>('inhale');
  const [breathingDuration, setBreathingDuration] = useState<1 | 3 | 5>(1);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [currentGroundingIndex, setCurrentGroundingIndex] = useState(0);
  const [soundObj, setSoundObj] = useState<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const totalCycles = breathingDuration * 3; // 3 cycles per minute

  // Phase durations in milliseconds
  const PHASE_DURATIONS = {
    inhale: 4000, // 4 seconds inhale
    hold: 4000,   // 4 seconds hold
    exhale: 4000, // 4 seconds exhale
  };

  const startBreathing = (duration: 1 | 3 | 5) => {
    setBreathingDuration(duration);
    setCurrentCycle(0);
    setBreathingPhase('inhale');
    setIsBreathing(true);
    scheduleNextPhase();
  };

  const stopBreathing = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsBreathing(false);
    setBreathingPhase('inhale');
    setCurrentCycle(0);
  };

  const scheduleNextPhase = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      handlePhaseComplete();
    }, PHASE_DURATIONS[breathingPhase]);
  };

  useEffect(() => {
    if (isBreathing) {
      scheduleNextPhase();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [breathingPhase, isBreathing]);

  const handlePhaseComplete = () => {
    if (!isBreathing) return;

    switch (breathingPhase) {
      case 'inhale':
        setBreathingPhase('hold');
        break;
      case 'hold':
        setBreathingPhase('exhale');
        break;
      case 'exhale':
        if (currentCycle >= totalCycles - 1) {
          stopBreathing();
        } else {
          setCurrentCycle(prev => prev + 1);
          setBreathingPhase('inhale');
        }
        break;
    }
  };

  const toggleSound = async (soundName: string) => {
    // Stop current sound if playing
    if (soundObj) {
      await soundObj.stopAsync();
      await soundObj.unloadAsync();
      setSoundObj(null);
    }
    if (currentSound === soundName) {
      setCurrentSound(null);
      return;
    }
    const soundData = sounds.find(s => s.name === soundName);
    if (!soundData) return;
    try {
      const { sound } = await Audio.Sound.createAsync(soundData.source, { shouldPlay: true, isLooping: true });
      setSoundObj(sound);
      setCurrentSound(soundName);
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  };

  // Unload sound on unmount
  useEffect(() => {
    return () => {
      if (soundObj) {
        soundObj.unloadAsync();
      }
    };
  }, [soundObj]);

  const nextGroundingStep = () => {
    setCurrentGroundingIndex((prev) => 
      prev < groundingExercises.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <Screen title="Calm Corner">
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guided Breathing</Text>
          <View style={styles.breathingContainer}>
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
              <>
                <Text style={styles.breathingText}>
                  {breathingPhase === 'inhale' ? 'BREATHE IN...' :
                   breathingPhase === 'hold' ? 'HOLD...' : 'BREATHE OUT...'}
                </Text>
                <PrimaryButton
                  label="Stop"
                  onPress={stopBreathing}
                  variant="secondary"
                  style={styles.stopButton}
                />
              </>
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
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.text,
  },
  breathingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  breathingText: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 40,
    color: theme.colors.text,
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
  stopButton: {
    marginTop: 20,
    width: '50%',
  },
});
