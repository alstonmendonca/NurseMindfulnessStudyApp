import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { appUsageTracker } from '../utils/appUsageTracker';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';

interface UsageStatsProps {
  days?: number; // Number of days to look back (default: 30)
}

export const UsageStats: React.FC<UsageStatsProps> = ({ days = 30 }) => {
  const { participantNumber } = useAuth();
  const [stats, setStats] = useState<{
    totalSessions: number;
    totalMinutes: number;
    averageSessionMinutes: number;
    sessionsPerDay: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!participantNumber) return;
      
      setLoading(true);
      try {
        const usageStats = await appUsageTracker.getUsageStats(participantNumber, days);
        setStats(usageStats);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [participantNumber, days]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading usage statistics...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unable to load usage statistics</Text>
      </View>
    );
  }

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Usage (Last {days} days)</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(stats.totalMinutes)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(stats.averageSessionMinutes)}</Text>
          <Text style={styles.statLabel}>Avg Session</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.sessionsPerDay}</Text>
          <Text style={styles.statLabel}>Sessions/Day</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.md,
    ...theme.shadows.md,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.error,
    textAlign: 'center',
  },
});
