import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

interface SurveyQuestionProps {
  question: {
    id: string;
    text: string;
    options: string[];
    reverse?: boolean;
  };
  value: number | null;
  onChange: (value: number) => void;
}

export const SurveyQuestion: React.FC<SurveyQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{question.text}</Text>
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <PrimaryButton
            key={option}
            label={option}
            onPress={() => onChange(index)}
            variant={value === index ? "primary" : "secondary"}
            style={styles.optionButton}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: 24,
  },
  questionText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    marginVertical: 4,
  },
});
