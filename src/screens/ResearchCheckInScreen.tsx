import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { CheckInType, canTakeCheckIn, scheduleNextCheckIn } from '../utils/researchSchedule';
import { SurveyQuestion } from '../components/SurveyQuestion';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import { useShared } from '../contexts/SharedContext';
import { supabase } from '../utils/supabase';
import { PSS4_QUESTIONS, COPE_QUESTIONS, WHO5_QUESTIONS } from '../constants/surveyQuestions';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';

type Props = NativeStackScreenProps<MainStackParamList, 'ResearchCheckIn'>;

export const ResearchCheckInScreen: React.FC<Props> = ({ navigation, route }) => {
  const { type }: { type: CheckInType } = route.params;
  const { participantNumber } = useAuth();
  const { currentShift, requireShift } = useShared();
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const questions = type === 'PSS4' ? PSS4_QUESTIONS :
                   type === 'COPE' ? COPE_QUESTIONS :
                   WHO5_QUESTIONS;

  useEffect(() => {
    requireShift();
    if (participantNumber) {
      canTakeCheckIn(participantNumber, type).then(available => {
        setIsAvailable(available);
        if (!available) {
          Alert.alert('Not Available', 'This survey is not available yet. Please check back later.');
          navigation.goBack();
        }
      });
    }
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

  const isComplete = () => questions.every(q => responses[q.id] !== undefined);

  const handleSubmit = async () => {
    if (!isComplete() || !participantNumber || !currentShift) return;

    setIsSubmitting(true);
    try {
      // Submit check-in
      const { error } = await supabase
        .from('research_check_ins')
        .insert({
          participant_id: participantNumber,
          check_in_type: type,
          responses,
          shift: currentShift,
        });

      if (error) throw error;
      
      // Schedule next notification
      await scheduleNextCheckIn(participantNumber, type);
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving research check-in:', error);
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestions = questions.length;
  const answeredCount = questions.filter(q => responses[q.id] !== undefined).length;
  const progressRatio = totalQuestions === 0 ? 0 : answeredCount / totalQuestions;

  return (
    <Screen
      title={
            type === 'PSS4' ? 'Stress Assessment' :
             type === 'COPE' ? 'Coping Strategies' :
             'Well-Being Check'
      }
      subtitle="Please answer all questions honestly. Your responses are anonymous."
    >
      <ScrollView style={styles.scrollView}>
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

          <View style={styles.progressWrap}>
            <Text style={styles.progressText}>{answeredCount}/{totalQuestions} completed</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${Math.max(8, progressRatio * 100)}%` }]} />
            </View>
          </View>

          <View style={styles.sectionLast}>
            <PrimaryButton
              label={isSubmitting ? "Saving..." : "Submit"}
              onPress={handleSubmit}
              disabled={!isComplete() || isSubmitting}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </Screen>
    );
  };const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  questionsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  progressWrap: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.mutedText,
    fontFamily: theme.typography.fontFamily.regular,
    marginBottom: theme.spacing.sm,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.text,
  },
  sectionLast: {
    padding: 20,
  },
  submitButton: {
    alignSelf: 'stretch',
    width: '100%',
  },
});
