import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETED_COURSES_KEY = '@shanthi_completed_courses';

export interface CompletedCourse {
  courseId: string;
  completedAt: string;
  title: string;
}

/**
 * Mark a course as completed
 */
export const markCourseAsComplete = async (
  courseId: string,
  title: string
): Promise<boolean> => {
  try {
    const completedCourses = await getCompletedCourses();
    
    // Check if already completed
    if (completedCourses.some(c => c.courseId === courseId)) {
      return true;
    }

    const newCompletion: CompletedCourse = {
      courseId,
      completedAt: new Date().toISOString(),
      title,
    };

    const updated = [...completedCourses, newCompletion];
    await AsyncStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(updated));
    
    return true;
  } catch (error) {
    console.error('Error marking course as complete:', error);
    return false;
  }
};

/**
 * Get all completed courses
 */
export const getCompletedCourses = async (): Promise<CompletedCourse[]> => {
  try {
    const stored = await AsyncStorage.getItem(COMPLETED_COURSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting completed courses:', error);
    return [];
  }
};

/**
 * Check if a specific course is completed
 */
export const isCourseCompleted = async (courseId: string): Promise<boolean> => {
  try {
    const completedCourses = await getCompletedCourses();
    return completedCourses.some(c => c.courseId === courseId);
  } catch (error) {
    console.error('Error checking course completion:', error);
    return false;
  }
};

/**
 * Unmark a course as completed (for testing or user preference)
 */
export const unmarkCourseAsComplete = async (courseId: string): Promise<boolean> => {
  try {
    const completedCourses = await getCompletedCourses();
    const filtered = completedCourses.filter(c => c.courseId !== courseId);
    await AsyncStorage.setItem(COMPLETED_COURSES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error unmarking course:', error);
    return false;
  }
};

/**
 * Clear all completed courses
 */
export const clearAllCompletedCourses = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(COMPLETED_COURSES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing completed courses:', error);
    return false;
  }
};

/**
 * Get completion statistics
 */
export const getCourseCompletionStats = async (totalCourses: number) => {
  try {
    const completedCourses = await getCompletedCourses();
    const completedCount = completedCourses.length;
    const completionPercentage = totalCourses > 0 
      ? Math.round((completedCount / totalCourses) * 100) 
      : 0;

    return {
      completed: completedCount,
      total: totalCourses,
      percentage: completionPercentage,
      remaining: totalCourses - completedCount,
    };
  } catch (error) {
    console.error('Error getting completion stats:', error);
    return {
      completed: 0,
      total: totalCourses,
      percentage: 0,
      remaining: totalCourses,
    };
  }
};
