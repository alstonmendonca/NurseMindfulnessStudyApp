import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList, MainStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { coursesContent } from '../data/mediaContent';
import { BackgroundDoodles } from '../components/BackgroundDoodles';
import { getCompletedCourses, getCourseCompletionStats } from '../utils/courseCompletionService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Courses'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const CoursesScreen: React.FC<Props> = ({ navigation }) => {
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
  const [completionStats, setCompletionStats] = useState({
    completed: 0,
    total: coursesContent.length,
    percentage: 0,
  });

  useEffect(() => {
    loadCompletionData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCompletionData();
    }, [])
  );

  const loadCompletionData = async () => {
    const completed = await getCompletedCourses();
    setCompletedCourseIds(completed.map(c => c.courseId));
    
    const stats = await getCourseCompletionStats(coursesContent.length);
    setCompletionStats(stats);
  };

  const handleOpenCourse = (item: typeof coursesContent[0]) => {
    navigation.navigate('CourseDetail', {
      course: item,
    });
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundDoodles />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meditation Courses</Text>
          <Text style={styles.headerSubtitle}>Learn mindfulness techniques at your own pace</Text>
          
          {/* Progress Card */}
          {completionStats.completed > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Ionicons name="trophy" size={24} color="#fbbf24" />
                <Text style={styles.progressTitle}>Your Progress</Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  {completionStats.completed} of {completionStats.total} courses completed
                </Text>
                <Text style={styles.progressPercentage}>{completionStats.percentage}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${completionStats.percentage}%` }
                  ]} 
                />
              </View>
            </View>
          )}
        </View>

        {/* Courses Grid */}
        <View style={styles.coursesGrid}>
          {coursesContent.map((item) => {
            const isCompleted = completedCourseIds.includes(item.id);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.courseCard,
                  isCompleted && styles.completedCard
                ]} 
                onPress={() => handleOpenCourse(item)}
              >
                <Image source={{ uri: item.thumbnail }} style={styles.courseThumbnail} />
                
                {/* Completion Badge */}
                {isCompleted && (
                  <View style={styles.completionBadge}>
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  </View>
                )}
                
                <View style={styles.readButton}>
                  <Ionicons name="book-outline" size={24} color="#fff" />
                </View>
                
                <View style={styles.courseInfo}>
                  <View style={styles.courseCategoryRow}>
                    <Text style={styles.courseCategory}>{item.category}</Text>
                    {isCompleted && (
                      <View style={styles.completedLabel}>
                        <Text style={styles.completedLabelText}>Completed</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.courseTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.courseDescription} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.courseFooter}>
                    <Text style={styles.courseDuration}>
                      <Ionicons name="time-outline" size={12} color="#64748b" /> {item.duration}
                    </Text>
                    <View style={styles.courseProgressContainer}>
                      <View style={styles.courseProgressBar}>
                        <View 
                          style={[
                            styles.courseProgressFill, 
                            { width: isCompleted ? '100%' : '0%' },
                            isCompleted && styles.courseProgressFillComplete
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.courseProgressText,
                        isCompleted && styles.courseProgressTextComplete
                      ]}>
                        {isCompleted ? '100%' : 'Not started'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050726',
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E5E7EC',
    marginBottom: 8,
    fontFamily: theme.typography.fontFamily.bold,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: theme.typography.fontFamily.regular,
  },
  progressCard: {
    marginTop: 20,
    backgroundColor: '#101340',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#fbbf24',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E7EC',
    fontFamily: theme.typography.fontFamily.bold,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#94a3b8',
    fontFamily: theme.typography.fontFamily.regular,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fbbf24',
    fontFamily: theme.typography.fontFamily.bold,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4,
  },
  coursesGrid: {
    padding: 20,
    gap: 20,
  },
  courseCard: {
    backgroundColor: '#101340',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#10b981',
  },
  courseThumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#334155',
  },
  completionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 4,
    zIndex: 10,
  },
  readButton: {
    position: 'absolute',
    top: 70,
    left: '50%',
    marginLeft: -25,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(58, 36, 119, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseInfo: {
    padding: 16,
  },
  courseCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  courseCategory: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    fontFamily: theme.typography.fontFamily.medium,
  },
  completedLabel: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  completedLabelText: {
    fontSize: 10,
    color: '#10b981',
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E5E7EC',
    marginBottom: 8,
    fontFamily: theme.typography.fontFamily.bold,
  },
  courseDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  courseDuration: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: theme.typography.fontFamily.regular,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  courseProgressBar: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  courseProgressFill: {
    height: '100%',
    backgroundColor: '#94a3b8',
    borderRadius: 2,
  },
  courseProgressFillComplete: {
    backgroundColor: '#10b981',
  },
  courseProgressText: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: theme.typography.fontFamily.regular,
  },
  courseProgressTextComplete: {
    color: '#10b981',
    fontWeight: '600',
  },
});
