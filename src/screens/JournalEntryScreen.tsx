import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, TextInput, ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { journalTags } from '../constants/journalTags';
// Removed useParticipant, now using useAuth
import { useShared } from '../contexts/SharedContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

type Props = NativeStackScreenProps<MainStackParamList, 'JournalEntry'>;

export const JournalEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { prompt } = route.params ?? {};
  const { participantNumber } = useAuth();
  const { currentShift } = useShared();
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!content.trim() || !participantNumber) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert({
          participant_id: participantNumber,
          content: content.trim(),
          prompt: prompt || '',
          tags: selectedTags,
          shift: currentShift || 'day'
        });

      if (error) throw error;
      navigation.goBack();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      // Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {prompt && (
          <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{prompt}</Text>
          </View>
        )}

        <TextInput
          style={styles.input}
          value={content}
          onChangeText={setContent}
          placeholder="Start writing here..."
          multiline
          textAlignVertical="top"
        />

        <View style={styles.tagsSection}>
          <Text style={styles.tagsTitle}>Add tags to your entry</Text>
          <View style={styles.tagsContainer}>
            {journalTags.map(tag => (
              <PrimaryButton
                key={tag}
                label={tag}
                onPress={() => toggleTag(tag)}
                variant={selectedTags.includes(tag) ? 'primary' : 'secondary'}
                style={styles.tagButton}
              />
            ))}
          </View>
        </View>

        <PrimaryButton
          label={isSaving ? "Saving..." : "Save Entry"}
          onPress={handleSave}
          disabled={!content.trim() || isSaving}
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  promptContainer: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  promptText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  saveButton: {
    marginBottom: 30,
  },
});
