import React from 'react';
import { StyleSheet, View, SafeAreaView, ScrollView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { JournalPromptCard } from '../components/JournalPromptCard';
import { journalPrompts } from '../constants/journalPrompts';

type Props = NativeStackScreenProps<MainStackParamList, 'Journal'>;

export const JournalScreen: React.FC<Props> = ({ navigation }) => {
  const todaysPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

  const navigateToEntry = (prompt?: string) => {
    navigation.navigate('JournalEntry', { prompt });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Prompt</Text>
          <JournalPromptCard
            prompt={todaysPrompt}
            onSelect={() => navigateToEntry(todaysPrompt)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Start Writing</Text>
          <PrimaryButton
            label="Free Write"
            onPress={() => navigateToEntry()}
            style={styles.freeWriteButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>More Prompts</Text>
          {journalPrompts.map((prompt, index) => (
            <JournalPromptCard
              key={index}
              prompt={prompt}
              onSelect={() => navigateToEntry(prompt)}
            />
          ))}
        </View>
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
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  freeWriteButton: {
    marginVertical: 10,
  },
});
