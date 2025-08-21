import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import { useShared } from '../contexts/SharedContext';
import { supabase } from '../utils/supabase';

type Props = NativeStackScreenProps<MainStackParamList, 'DailyCheckIn'>;

const moodLabels = [
  'Very Unhappy',
  'Unhappy',
  'Neutral',
  'Happy',
  'Very Happy',
];

const stressLabels = [
  'Not at all',
  'A little',
  'Moderate',
  'Quite a bit',
  'Extremely',
];

const feelingTags = [
  'Exhausted',
  'Worried',
  'Calm',
  'Focused',
  'Frustrated',
  'Satisfied',
  'Overwhelmed',
  'Motivated',
];

export const DailyCheckInScreen: React.FC<Props> = ({ navigation }) => {
  const { participantNumber } = useAuth();
  const { currentShift } = useShared();
  const [moodScore, setMoodScore] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [note, setNote] = useState('');

  const handleSubmit = async () => {
  if (!participantNumber || moodScore === null || stressLevel === null) return;

    try {
      const { error } = await supabase.from('mood_checks').insert({
        participant_id: participantNumber,
        mood_score: moodScore + 1, // Convert 0-4 to 1-5
        stress_level: stressLevel + 1,
        feelings: selectedFeelings,
        note: note.trim() || null,
        shift: currentShift || 'day',
      });

      if (error) throw error;
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving check-in:', error);
      // Show error message to user
    }
  };

  const toggleFeeling = (feeling: string) => {
    setSelectedFeelings(prev =>
      prev.includes(feeling)
        ? prev.filter(f => f !== feeling)
        : [...prev, feeling]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How's your mood?</Text>
          <View style={styles.scaleContainer}>
            {moodLabels.map((label, index) => (
              <PrimaryButton
                key={label}
                label={label}
                variant={moodScore === index ? 'primary' : 'secondary'}
                onPress={() => setMoodScore(index)}
                style={styles.scaleButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stress Level</Text>
          <View style={styles.scaleContainer}>
            {stressLabels.map((label, index) => (
              <PrimaryButton
                key={label}
                label={label}
                variant={stressLevel === index ? 'primary' : 'secondary'}
                onPress={() => setStressLevel(index)}
                style={styles.scaleButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How are you feeling?</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.tagsContainer}>
            {feelingTags.map(feeling => (
              <PrimaryButton
                key={feeling}
                label={feeling}
                variant={selectedFeelings.includes(feeling) ? 'primary' : 'secondary'}
                onPress={() => toggleFeeling(feeling)}
                style={styles.tagButton}
              />
            ))}
          </View>
        </View>

        <PrimaryButton
          label="Submit"
          onPress={handleSubmit}
          disabled={moodScore === null || stressLevel === null}
          style={styles.submitButton}
        />
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
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  scaleContainer: {
    gap: 10,
  },
  scaleButton: {
    marginVertical: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  submitButton: {
    marginVertical: 20,
  },
});
