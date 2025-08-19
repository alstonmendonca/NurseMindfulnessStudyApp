import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';

interface JournalPromptCardProps {
  prompt: string;
  onSelect: () => void;
}

export const JournalPromptCard: React.FC<JournalPromptCardProps> = ({
  prompt,
  onSelect,
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onSelect}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  prompt: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  arrow: {
    marginLeft: 10,
  },
  arrowText: {
    fontSize: 20,
    color: '#4A90E2',
  },
});
