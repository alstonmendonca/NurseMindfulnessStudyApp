import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { supabase } from '../utils/supabase';
import { useParticipant } from '../contexts/ParticipantContext';
import { useShared } from '../contexts/SharedContext';

export const GratitudeLog = () => {
  const { participantId } = useParticipant();
  const { currentShift } = useShared();
  const [gratitude, setGratitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gratitude.trim() || !participantId || !currentShift) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          participant_id: participantId,
          content: gratitude.trim(),
          tags: ['gratitude'],
          prompt: 'What are you grateful for today?',
          shift: currentShift, // ✅ added shift here
        });

      if (error) throw error;
      
      setGratitude('');
      // Could show a success message here
    } catch (error) {
      console.error('Error saving gratitude:', error);
      // Could show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
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
