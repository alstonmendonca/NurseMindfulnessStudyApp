import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TabParamList, MainStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { appUsageTracker } from '../utils/appUsageTracker';
import { setupAllNotifications } from '../utils/notifications';
import { DailyActivitiesService, DailyActivity } from '../utils/dailyActivitiesService';
import { AffirmationsService, Affirmation } from '../utils/affirmationsService';
import { BackgroundDoodles } from '../components/BackgroundDoodles';
import { useFocusEffect } from '@react-navigation/native';
import { WeeklySummaryService, WeeklySummary } from '../utils/weeklySummaryService';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<MainStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { participantNumber } = useAuth();
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newActivityText, setNewActivityText] = useState('');
  const [todaysAffirmation, setTodaysAffirmation] = useState<Affirmation>({ 
    quote: "Just do it.", 
    author: "Nike" 
  });
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);

  useEffect(() => {
    const init = async () => {
      if (participantNumber) {
        await appUsageTracker.initializeTracking(participantNumber);
      }
      await setupAllNotifications();
      
      // Load today's affirmation
      const affirmation = await AffirmationsService.getTodaysAffirmation();
      setTodaysAffirmation(affirmation);

      // Initialize and check weekly summary
      await WeeklySummaryService.initializeIfNeeded();
      if (participantNumber) {
        const shouldShow = await WeeklySummaryService.shouldShowWeeklySummary();
        if (shouldShow) {
          const summary = await WeeklySummaryService.getWeeklySummary(participantNumber);
          setWeeklySummary(summary);
          setShowWeeklySummary(true);
        }
      }
    };
    init();
  }, [participantNumber]);

  // Load activities whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadActivities();
    }, [])
  );

  const loadActivities = async () => {
    const loadedActivities = await DailyActivitiesService.getActivities();
    setActivities(loadedActivities);
  };

  const handleAddActivity = async () => {
    console.log('handleAddActivity called with:', newActivityText);
    
    const trimmedText = newActivityText.trim();
    
    if (!trimmedText) {
      Alert.alert('Error', 'Please enter an activity');
      return;
    }

    try {
      console.log('Adding activity to local storage...');
      const updatedActivities = await DailyActivitiesService.addActivity(trimmedText);
      console.log('Activity added successfully! Updated activities:', updatedActivities);
      
      // Update state immediately
      setActivities(updatedActivities);
      setNewActivityText('');
      setShowAddModal(false);
      
      // Show success feedback
      console.log('Modal closed, activity should now be visible');
    } catch (error) {
      console.error('Error adding activity:', error);
      Alert.alert('Error', 'Failed to add activity. Please try again.');
    }
  };

  const handleToggleActivity = async (id: string) => {
    try {
      console.log('Toggling activity in HomeScreen:', id);
      const updatedActivities = await DailyActivitiesService.toggleActivity(id);
      console.log('Activity toggled, updating UI');
      setActivities(updatedActivities);
    } catch (error) {
      console.error('Error toggling activity in HomeScreen:', error);
      Alert.alert('Error', 'Failed to update activity. Please try again.');
    }
  };

  const handleDeleteActivity = async (id: string) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedActivities = await DailyActivitiesService.deleteActivity(id);
            setActivities(updatedActivities);
          },
        },
      ]
    );
  };

  const SUGGESTED_ROUTINES = [
    '🧘 5-min morning meditation',
    '🫁 Box breathing before shift',
    '📝 Gratitude journaling',
    '💧 Hydration reminder',
    '🦋 Butterfly hug for stress',
    '🚶 Stretch break mid-shift',
  ];

  const handleAddSuggestion = async (text: string) => {
    try {
      const updatedActivities = await DailyActivitiesService.addActivity(text);
      setActivities(updatedActivities);
    } catch (error) {
      console.error('Error adding suggested activity:', error);
      Alert.alert('Error', 'Failed to add activity. Please try again.');
    }
  };

  const handleDismissWeeklySummary = async () => {
    setShowWeeklySummary(false);
    await WeeklySummaryService.markAsShown();
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDoodles />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.quote}>"{todaysAffirmation.quote}"</Text>
          <Text style={styles.title}>- {todaysAffirmation.author}</Text>
        </View>

        <View style={styles.grid}>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: 'rgba(195, 107, 50, 0.6)' }]}
            onPress={() => navigation.navigate('Meditate')}
          >
            <Text style={styles.cardText}>Meditate</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: 'rgba(58, 36, 119, 0.6)' }]}
            onPress={() => navigation.navigate('Mindfulness')}
          >
            <Text style={styles.cardText}>Mindfulness</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: 'rgba(194, 90, 153, 0.6)' }]}
            onPress={() => navigation.navigate('Move')}
          >
            <Text style={styles.cardText}>Move</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: 'rgba(25, 96, 204, 0.6)' }]}
            onPress={() => navigation.navigate('Breathing')}
          >
            <Text style={styles.cardText}>Breathing</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.routine}>
          <View style={styles.header}>
            <View>
              <Text style={styles.routineTitle}>My Routine</Text>
              {activities.length > 0 && (
                <Text style={styles.routineSubtitle}>
                  {activities.filter(a => a.completed).length} of {activities.length} completed
                </Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => {
                console.log('Add button pressed, opening modal');
                setShowAddModal(true);
              }}
              style={styles.addIconButton}
              activeOpacity={0.6}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="add-circle" size={28} color="#3A2477" />
            </TouchableOpacity>
          </View>
          
          {activities.map((activity) => (
            <View key={activity.id} style={styles.item}>
              <TouchableOpacity 
                style={styles.itemContent}
                onPress={() => handleToggleActivity(activity.id)}
              >
                <Text style={[
                  styles.itemText,
                  activity.completed && styles.itemTextCompleted
                ]}>
                  {activity.text}
                </Text>
              </TouchableOpacity>
              <View style={styles.itemActions}>
                <TouchableOpacity onPress={() => handleToggleActivity(activity.id)}>
                  <Ionicons 
                    name={activity.completed ? "checkmark-circle" : "ellipse-outline"} 
                    size={24} 
                    color={activity.completed ? "#10b981" : "#6b7280"} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteActivity(activity.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {activities.length === 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.emptyText}>
                Get started with a suggested routine:
              </Text>
              <View style={styles.suggestionsGrid}>
                {SUGGESTED_ROUTINES.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => handleAddSuggestion(suggestion)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <Ionicons name="add-circle-outline" size={16} color="#3A2477" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Activity Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowAddModal(false);
          setNewActivityText('');
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add New Activity</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter activity..."
                    placeholderTextColor="#9ca3af"
                    value={newActivityText}
                    onChangeText={setNewActivityText}
                    autoFocus
                    maxLength={100}
                    returnKeyType="done"
                    onSubmitEditing={handleAddActivity}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setShowAddModal(false);
                        setNewActivityText('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.addButton]}
                      onPress={handleAddActivity}
                    >
                      <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
      </Modal>

      {/* Weekly Summary Modal */}
      <Modal
        visible={showWeeklySummary}
        transparent
        animationType="fade"
        onRequestClose={handleDismissWeeklySummary}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.weeklySummaryModal}>
            <Text style={styles.weeklySummaryEmoji}>🎉</Text>
            <Text style={styles.weeklySummaryTitle}>Your Week in Review</Text>
            {weeklySummary && (
              <>
                <Text style={styles.weeklySummaryDateRange}>
                  {weeklySummary.weekStartDate} – {weeklySummary.weekEndDate}
                </Text>
                <View style={styles.summaryStatsGrid}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>{weeklySummary.sessionsThisWeek}</Text>
                    <Text style={styles.summaryStatLabel}>Sessions</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>{weeklySummary.minutesThisWeek}m</Text>
                    <Text style={styles.summaryStatLabel}>Mindful Minutes</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>{weeklySummary.coursesCompletedThisWeek}</Text>
                    <Text style={styles.summaryStatLabel}>Courses Done</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatNumber}>{weeklySummary.currentStreak}🔥</Text>
                    <Text style={styles.summaryStatLabel}>Day Streak</Text>
                  </View>
                </View>
                <Text style={styles.weeklySummaryMessage}>
                  {weeklySummary.sessionsThisWeek > 0
                    ? 'Great work this week! Every moment of mindfulness counts. Keep it up! 💪'
                    : 'A new week, a fresh start. Even one minute of mindfulness makes a difference. 🌱'}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={styles.weeklySummaryButton}
              onPress={handleDismissWeeklySummary}
            >
              <Text style={styles.weeklySummaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050726', paddingTop: 20, paddingBottom: 20 },
  content: { padding: 20, paddingBottom: 100 },
  banner: { backgroundColor: 'rgba(16, 19, 64, 0.6)', borderRadius: 20, padding: 24, marginBottom: 20 },
  quote: { fontSize: 18, fontStyle: 'italic', color: '#E5E7EC', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '600', color: '#E5E7EC' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  card: { 
    width: '48%', 
    height: 100, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardPattern1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardPattern1b: {
    position: 'absolute',
    bottom: 15,
    left: -15,
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    transform: [{ rotate: '20deg' }],
  },
  cardPattern1c: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 3,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '-15deg' }],
  },
  cardPattern2: {
    position: 'absolute',
    bottom: -15,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '45deg' }],
  },
  cardPattern2b: {
    position: 'absolute',
    top: -15,
    right: 20,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardPattern2c: {
    position: 'absolute',
    top: 30,
    right: -5,
    width: 35,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    transform: [{ rotate: '60deg' }],
  },
  cardPattern3: {
    position: 'absolute',
    top: -10,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardPattern3b: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '30deg' }],
  },
  cardPattern3c: {
    position: 'absolute',
    top: 25,
    left: 5,
    width: 55,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    transform: [{ rotate: '-10deg' }],
  },
  cardPattern4: {
    position: 'absolute',
    bottom: 10,
    right: -20,
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ rotate: '30deg' }],
  },
  cardPattern4b: {
    position: 'absolute',
    top: -10,
    left: -5,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.11)',
  },
  cardPattern4c: {
    position: 'absolute',
    bottom: 25,
    left: 15,
    width: 3,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    transform: [{ rotate: '25deg' }],
  },
  cardText: { fontSize: 20, fontWeight: '600', color: '#E5E7EC' },
  routine: { marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  routineTitle: { fontSize: 24, fontWeight: '700', color: '#E5E7EC' },
  routineSubtitle: { fontSize: 14, color: '#9ca3af', marginTop: 4 },
  addIconButton: {
    padding: 2,
  },
  item: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#101340' 
  },
  itemContent: {
    flex: 1,
    marginRight: 8,
  },
  itemText: { fontSize: 16, color: '#E5E7EC' },
  itemTextCompleted: { 
    textDecorationLine: 'line-through', 
    color: '#6b7280' 
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 12,
  },
  suggestionsContainer: {
    paddingVertical: 8,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(58, 36, 119, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(58, 36, 119, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderStyle: 'dashed',
  },
  suggestionText: {
    fontSize: 13,
    color: '#E5E7EC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#101340',
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxWidth: 600,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E5E7EC',
    marginBottom: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  input: {
    backgroundColor: '#050726',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#E5E7EC',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#374151',
  },
  cancelButtonText: {
    color: '#E5E7EC',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#3A2477',
  },
  addButtonText: {
    color: '#E5E7EC',
    fontSize: 16,
    fontWeight: '600',
  },
  weeklySummaryModal: {
    backgroundColor: '#101340',
    borderRadius: 24,
    padding: 28,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  weeklySummaryEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  weeklySummaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E5E7EC',
    marginBottom: 4,
    textAlign: 'center',
  },
  weeklySummaryDateRange: {
    fontSize: 13,
    color: '#9ca3af',
    marginBottom: 20,
  },
  summaryStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    width: '100%',
  },
  summaryStatItem: {
    width: '45%',
    backgroundColor: 'rgba(58, 36, 119, 0.25)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  summaryStatNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E5E7EC',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  weeklySummaryMessage: {
    fontSize: 14,
    color: '#E5E7EC',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  weeklySummaryButton: {
    backgroundColor: '#3A2477',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  weeklySummaryButtonText: {
    color: '#E5E7EC',
    fontSize: 16,
    fontWeight: '700',
  },
});
