import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BackgroundDoodles } from '../components/BackgroundDoodles';
import { markCourseAsComplete, isCourseCompleted, unmarkCourseAsComplete } from '../utils/courseCompletionService';

type Props = NativeStackScreenProps<MainStackParamList, 'CourseDetail'>;

export const CourseDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { course } = route.params;
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkCompletionStatus();
  }, []);

  const checkCompletionStatus = async () => {
    const completed = await isCourseCompleted(course.id);
    setIsCompleted(completed);
  };

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      if (isCompleted) {
        // Unmark as complete
        const success = await unmarkCourseAsComplete(course.id);
        if (success) {
          setIsCompleted(false);
          Alert.alert(
            'Unmarked',
            'Course marked as incomplete',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Mark as complete
        const success = await markCourseAsComplete(course.id, course.title);
        if (success) {
          setIsCompleted(true);
          Alert.alert(
            'Congratulations! 🎉',
            'You have completed this course. Keep up the great work!',
            [
              {
                text: 'Continue Learning',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update completion status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundDoodles />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.category}>{course.category}</Text>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.duration}>
              <Ionicons name="time-outline" size={14} color="#94a3b8" /> {course.duration}
            </Text>
          </View>
        </View>

        {/* Course Content */}
        {course.lessons.map((lesson, index) => (
          <View key={index} style={styles.lessonContainer}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            
            {lesson.content.map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}

            {/* Exercise Section */}
            {lesson.exercise && (
              <View style={styles.exerciseContainer}>
                <View style={styles.exerciseHeader}>
                  <Ionicons name="fitness" size={24} color={theme.colors.primary} />
                  <Text style={styles.exerciseTitle}>{lesson.exercise.title}</Text>
                </View>
                
                <View style={styles.exerciseContent}>
                  {lesson.exercise.instructions.map((instruction, iIndex) => (
                    <View key={iIndex} style={styles.instructionRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.instruction}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Completion Button */}
        <TouchableOpacity 
          style={[
            styles.completeButton,
            isCompleted && styles.completedButton,
            isLoading && styles.loadingButton
          ]}
          onPress={handleToggleComplete}
          disabled={isLoading}
        >
          <Text style={styles.completeButtonText}>
            {isLoading ? 'Saving...' : isCompleted ? 'Completed ✓' : 'Mark as Complete'}
          </Text>
          <Ionicons 
            name={isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} 
            size={24} 
            color="#fff" 
          />
        </TouchableOpacity>
        
        {isCompleted && (
          <TouchableOpacity 
            style={styles.unmarkButton}
            onPress={handleToggleComplete}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={18} color="#94a3b8" />
            <Text style={styles.unmarkButtonText}>Reset Completion</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#101340',
  },
  backButton: {
    marginBottom: 16,
  },
  headerInfo: {
    gap: 8,
  },
  category: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily.medium,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E5E7EC',
    lineHeight: 34,
    fontFamily: theme.typography.fontFamily.bold,
  },
  duration: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: theme.typography.fontFamily.regular,
  },
  lessonContainer: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E7EC',
    marginBottom: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  paragraph: {
    fontSize: 16,
    color: '#E5E7EC',
    lineHeight: 26,
    marginBottom: 16,
    fontFamily: theme.typography.fontFamily.regular,
  },
  exerciseContainer: {
    marginTop: 24,
    backgroundColor: '#101340',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E7EC',
    flex: 1,
    fontFamily: theme.typography.fontFamily.bold,
  },
  exerciseContent: {
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 10,
  },
  instruction: {
    flex: 1,
    fontSize: 15,
    color: '#E5E7EC',
    lineHeight: 24,
    fontFamily: theme.typography.fontFamily.regular,
  },
  completeButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completedButton: {
    backgroundColor: '#10b981',
  },
  loadingButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EC',
    fontFamily: theme.typography.fontFamily.medium,
  },
  unmarkButton: {
    marginHorizontal: 20,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
  },
  unmarkButtonText: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: theme.typography.fontFamily.regular,
  },
});
