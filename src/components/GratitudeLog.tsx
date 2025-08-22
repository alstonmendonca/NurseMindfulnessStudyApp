import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { supabase } from '../utils/supabase';
import { useParticipant } from '../contexts/ParticipantContext';
import { useShared } from '../contexts/SharedContext';
import { NotificationBanner } from './NotificationBanner';

export const GratitudeLog = () => {
  const { participantNumber } = useParticipant();
  const { currentShift, requireShift } = useShared();
  const [gratitude, setGratitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success',
  });

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      visible: true,
      message,
      type,
    });
  };

  const handleSubmit = async () => {
    if (!gratitude.trim() || !participantNumber) return;
    
    // Make sure we have a shift selected
    if (!currentShift) {
      const hasShift = await requireShift();
      if (!hasShift) return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          participant_id: participantNumber,
          content: gratitude.trim(),
          tags: ['gratitude'],
          prompt: 'What are you grateful for today?',
          shift: currentShift,
        });

      if (error) throw error;
      
      setGratitude('');
      showNotification('Your gratitude has been saved', 'success');
    } catch (error) {
      console.error('Error saving gratitude:', error);
      showNotification('Could not save your gratitude. Please try again', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <NotificationBanner
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
        onHide={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
      <Text style={styles.prompt}>What are you grateful for today?</Text>
      <TextInput
        style={styles.input}
        value={gratitude}
        onChangeText={setGratitude}
        placeholder="I'm grateful for..."
        multiline
        numberOfLines={3}
        maxLength={200}
      />
      <PrimaryButton
        label={isSubmitting ? "Saving..." : "Save Gratitude"}
        onPress={handleSubmit}
        disabled={!gratitude.trim() || isSubmitting}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  prompt: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 10,
  },
});
