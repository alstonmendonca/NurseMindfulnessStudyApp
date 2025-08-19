import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { SurveyQuestion } from '../components/SurveyQuestion';
import { PrimaryButton } from '../components/PrimaryButton';
import { useParticipant } from '../contexts/ParticipantContext';
import { useShared } from '../contexts/SharedContext';
import { supabase } from '../utils/supabase';
import { PSS4_QUESTIONS, COPE_QUESTIONS, WHO5_QUESTIONS } from '../constants/surveyQuestions';

type Props = NativeStackScreenProps<MainStackParamList, 'ResearchCheckIn'>;

export const ResearchCheckInScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type } = route.params;
  const { participantId } = useParticipant();
  const { currentShift, requireShift } = useShared();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = type === 'PSS4' ? PSS4_QUESTIONS :
                   type === 'COPE' ? COPE_QUESTIONS :
                   WHO5_QUESTIONS;

  useEffect(() => {
    requireShift();
  }, []);

  const handleResponse = (questionId: string, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const getScore = () => {
    let score = 0;
    for (const question of questions) {
      if (responses[question.id] !== undefined) {
        const value = responses[question.id];
        score += 'reverse' in question && question.reverse ? 4 - value : value;
      }
    }
    return score;
  };

  const isComplete = () => {
    return questions.every(q => responses[q.id] !== undefined);
  };

  const handleSubmit = async () => {
    if (!isComplete() || !participantId || !currentShift) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('research_check_ins')
        .insert({
          participant_id: participantId,
          check_in_type: type,
          responses,
          shift: currentShift,
        });

      if (error) throw error;
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving research check-in:', error);
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {type === 'PSS4' ? 'Stress Assessment' :
             type === 'COPE' ? 'Coping Strategies' :
             'Well-Being Check'}
          </Text>
          <Text style={styles.subtitle}>
            Please answer all questions honestly. Your responses are anonymous.
          </Text>
        </View>

        <View style={styles.questionsContainer}>
          {questions.map(question => (
            <SurveyQuestion
              key={question.id}
              question={question}
              value={responses[question.id] ?? null}
              onChange={(value) => handleResponse(question.id, value)}
            />
          ))}
        </View>

        <PrimaryButton
          label={isSubmitting ? "Saving..." : "Submit"}
          onPress={handleSubmit}
          disabled={!isComplete() || isSubmitting}
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
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  questionsContainer: {
    padding: 20,
  },
  submitButton: {
    margin: 20,
  },
});
