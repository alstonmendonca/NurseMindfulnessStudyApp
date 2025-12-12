import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TabParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { AchievementsService, UsageStats, Achievement } from '../utils/achievementsService';
import { useFocusEffect } from '@react-navigation/native';
import { BackgroundDoodles } from '../components/BackgroundDoodles';

type Props = NativeStackScreenProps<TabParamList, 'Achievements'>;

export const AchievementsScreen: React.FC<Props> = ({ navigation }) => {
  const { participantNumber, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats>({
    totalDays: 0,
    totalSessions: 0,
    totalMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Load data whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAchievementsData();
    }, [participantNumber])
  );

  const loadAchievementsData = async () => {
    if (!participantNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [usageStats, achievementsList] = await Promise.all([
        AchievementsService.getUsageStats(participantNumber),
        AchievementsService.getAchievements(participantNumber),
      ]);

      setStats(usageStats);
      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error loading achievements data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const renderAchievement = (achievement: Achievement) => {
    const opacity = achievement.unlocked ? 1 : 0.3;
    
    return (
      <View key={achievement.id} style={styles.achievementContainer}>
        <View style={[styles.achievementCircle, { opacity }]}>
          <Text style={styles.achievementIcon}>{achievement.icon}</Text>
          {achievement.unlocked && (
            <View style={styles.progressRing}>
              <View style={styles.progressRingInner} />
            </View>
          )}
        </View>
        <View style={styles.starsContainer}>
          {[1, 2, 3].map((star) => (
            <Ionicons
              key={star}
              name="star"
              size={16}
              color={star <= achievement.stars ? '#fbbf24' : '#4a5568'}
            />
          ))}
        </View>
        <Text style={styles.achievementTitle}>{achievement.title}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A2477" />
          <Text style={styles.loadingText}>Loading achievements...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <BackgroundDoodles />
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={26} color="#E5E7EC" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsHeaderText}>
              Time updates every time you open the app
            </Text>
            <View style={styles.iconContainer}>
              <Ionicons name="man" size={24} color="#E5E7EC" />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalDays}</Text>
              <Text style={styles.statLabel}>days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalMinutes}m</Text>
              <Text style={styles.statLabel}>total</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsGrid}>
          {achievements.map(renderAchievement)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050726',
    paddingTop: 50,
  },
  logoutButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: 'rgba(16, 19, 64, 0.8)',
    borderRadius: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9ca3af',
    fontFamily: theme.typography.fontFamily.regular,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  statsCard: {
    backgroundColor: 'rgba(16, 19, 64, 0.6)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  statsHeaderText: {
    fontSize: 14,
    color: '#E5E7EC',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E5E7EC',
    fontFamily: theme.typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  achievementContainer: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 32,
  },
  achievementCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  achievementIcon: {
    fontSize: 36,
  },
  progressRing: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#8b5cf6',
    top: -4,
    left: -4,
  },
  progressRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 44,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.regular,
  },
});
