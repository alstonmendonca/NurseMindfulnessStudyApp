import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { DemographicQuestionComponent } from '../components/DemographicQuestion';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { theme } from '../constants/theme';
import { DEMOGRAPHIC_QUESTIONS, DemographicSurveyData } from '../constants/demographicSurvey';
import { supabase } from '../utils/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<MainStackParamList, 'DemographicSurvey'>;

export const DemographicSurveyScreen: React.FC<Props> = ({ navigation }) => {
  const { participantNumber, setDemographicSurveyCompleted } = useAuth();
  const [responses, setResponses] = useState<Partial<DemographicSurveyData>>({});
  const [otherResponses, setOtherResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExistingSurvey, setIsCheckingExistingSurvey] = useState(true);

  // Check if survey already exists when component loads
  useEffect(() => {
    const checkExistingSurvey = async () => {
      if (!participantNumber) return;

      try {
        const { data, error } = await supabase
          .from('demographic_surveys')
          .select('id')
          .eq('participant_id', participantNumber)
          .single();

        if (!error && data) {
          // Survey already exists for this participant number
          Alert.alert(
            'Survey Already Completed',
            'You have already completed the demographic survey for this participant number. Redirecting to home...',
            [{ 
              text: 'OK', 
              onPress: () => {
                setDemographicSurveyCompleted(true);
              }
            }]
          );
          return;
        }
      } catch (error) {
        console.error('Error checking existing survey:', error);
      } finally {
        setIsCheckingExistingSurvey(false);
      }
    };

    checkExistingSurvey();
  }, [participantNumber]);

  const handleResponse = (questionId: string, value: string, otherValue?: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));

    if (otherValue !== undefined) {
      setOtherResponses(prev => ({
        ...prev,
        [`${questionId}Other`]: otherValue,
      }));
    }
  };

  const getResponseValue = (questionId: string): string => {
    return responses[questionId as keyof DemographicSurveyData] || '';
  };

  const getOtherValue = (questionId: string): string => {
    return otherResponses[`${questionId}Other`] || '';
  };

  const isComplete = (): boolean => {
    return DEMOGRAPHIC_QUESTIONS.filter(q => q.required).every(question => {
      const value = getResponseValue(question.id);
      if (!value) return false;

      // Check if "other" option is selected but no text provided
      const isOtherOption = value.toLowerCase().includes('other') || value.toLowerCase().includes('any other');
      if (isOtherOption && question.type === 'other') {
        const otherValue = getOtherValue(question.id);
        return otherValue.trim().length > 0;
      }

      return true;
    });
  };

  const handleSubmit = async () => {
    if (!isComplete() || !participantNumber) return;

    setIsSubmitting(true);
    try {
      // Double-check if survey already exists before submitting
      const { data: existingSurvey, error: checkError } = await supabase
        .from('demographic_surveys')
        .select('id')
        .eq('participant_id', participantNumber)
        .single();

      if (!checkError && existingSurvey) {
        Alert.alert(
          'Survey Already Exists',
          'A demographic survey has already been completed for this participant number.',
          [{ text: 'OK', onPress: () => setDemographicSurveyCompleted(true) }]
        );
        return;
      }

      // Prepare data for submission
      const surveyData = {
        participant_id: participantNumber,
        sample_code: responses.sampleCode,
        age_group: responses.ageGroup,
        gender: responses.gender,
        marital_status: responses.maritalStatus,
        educational_qualification: responses.educationalQualification,
        educational_other: otherResponses.educationalQualificationOther,
        designation: responses.designation,
        income_level: responses.incomeLevel,
        years_experience: responses.yearsExperience,
        working_unit: responses.workingUnit,
        working_unit_other: otherResponses.workingUnitOther,
        work_shift: responses.workShift,
        hours_per_day: responses.hoursPerDay,
        night_shifts_per_month: responses.nightShiftsPerMonth,
        night_shifts_other: otherResponses.nightShiftsPerMonthOther,
        place_of_residence: responses.placeOfResidence,
        residence_other: otherResponses.placeOfResidenceOther,
        contact_number: responses.contactNumber,
      };

      // Submit to database
      const { error: surveyError } = await supabase
        .from('demographic_surveys')
        .insert(surveyData);

      if (surveyError) throw surveyError;

      // Update participant record to mark survey as completed
      await setDemographicSurveyCompleted(true);

      Alert.alert(
        'Survey Completed',
        'Thank you for completing the demographic survey!',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving demographic survey:', error);
      Alert.alert('Error', 'Failed to save your responses. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalQuestions = DEMOGRAPHIC_QUESTIONS.filter(q => q.required).length;
  const answeredCount = DEMOGRAPHIC_QUESTIONS.filter(q => q.required && getResponseValue(q.id)).length;
  const progressRatio = totalQuestions === 0 ? 0 : answeredCount / totalQuestions;

  // Show loading while checking for existing survey
  if (isCheckingExistingSurvey) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconContainer}>
            <MaterialIcons name="assignment" size={48} color={theme.colors.textOnPrimary} />
          </View>
          <Text style={styles.loadingTitle}>Checking Survey Status</Text>
          <Text style={styles.loadingSubtitle}>Verifying survey completion status...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.gradientStart, theme.colors.gradientMiddle, theme.colors.gradientEnd]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            style={styles.headerIconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialIcons name="assignment" size={32} color={theme.colors.textOnPrimary} />
          </LinearGradient>
        </View>
        <Text style={styles.title}>Demographic Survey</Text>
        <View style={styles.subtitleContainer}>
          <Ionicons name="shield-checkmark" size={16} color={theme.colors.textOnPrimary} style={styles.privacyIcon} />
          <Text style={styles.subtitle}>
            Dear Participants, please complete this one-time survey. Your responses will be kept confidential.
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.questionsContainer}>
            {DEMOGRAPHIC_QUESTIONS.map(question => (
              <View key={question.id} style={styles.questionCard}>
                <DemographicQuestionComponent
                  question={question}
                  value={getResponseValue(question.id)}
                  otherValue={getOtherValue(question.id)}
                  onChange={(value, otherValue) => handleResponse(question.id, value, otherValue)}
                />
              </View>
            ))}
          </View>

          <View style={styles.progressWrap}>
            <Text style={styles.progressText}>{answeredCount}/{totalQuestions} completed</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${Math.max(8, progressRatio * 100)}%` }]} />
            </View>
          </View>

          <View style={styles.submitSection}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.primaryDark]}
              style={styles.submitButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <PrimaryButton
                label={isSubmitting ? "Saving..." : "Submit Survey"}
                onPress={handleSubmit}
                disabled={!isComplete() || isSubmitting}
                style={styles.submitButton}
              />
            </LinearGradient>
            
            <View style={styles.footerInfo}>
              <Ionicons name="information-circle-outline" size={16} color={theme.colors.textOnPrimary} />
              <Text style={styles.footerText}>
                This survey helps us understand our participants better and improve the study experience.
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingIconContainer: {
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  loadingTitle: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Header styles
  header: {
    paddingTop: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  headerIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  privacyIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textOnPrimary,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
    flex: 1,
  },
  
  // Content styles
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    ...theme.shadows.lg,
  },
  scrollView: {
    flex: 1,
  },
  questionsContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  questionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  
  // Progress styles
  progressWrap: {
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.md,
    ...theme.shadows.sm,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.sm,
  },
  
  // Submit section styles
  submitSection: {
    padding: theme.spacing.lg,
  },
  submitButtonGradient: {
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  submitButton: {
    backgroundColor: 'transparent',
    alignSelf: 'stretch',
    width: '100%',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    opacity: 0.7,
  },
  footerText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
});
