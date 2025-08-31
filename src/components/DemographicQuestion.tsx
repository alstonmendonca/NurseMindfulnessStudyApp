import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { DemographicQuestion } from '../constants/demographicSurvey';
import { PrimaryButton } from './PrimaryButton';
import { theme } from '../constants/theme';

interface DemographicQuestionComponentProps {
  question: DemographicQuestion;
  value: string;
  otherValue?: string;
  onChange: (value: string, otherValue?: string) => void;
}

export const DemographicQuestionComponent: React.FC<DemographicQuestionComponentProps> = ({
  question,
  value,
  otherValue,
  onChange,
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);

  const handleOptionSelect = (option: string) => {
    const isOtherOption = option.toLowerCase().includes('other') || option.toLowerCase().includes('any other');
    
    if (isOtherOption) {
      setShowOtherInput(true);
      onChange(option, otherValue || '');
    } else {
      setShowOtherInput(false);
      onChange(option);
    }
  };

  const handleOtherValueChange = (text: string) => {
    onChange(value, text);
  };

  if (question.type === 'text') {
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question.text}
          {question.required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChange}
          placeholder="Enter your answer"
          placeholderTextColor={theme.colors.mutedText}
        />
      </View>
    );
  }

  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>
        {question.text}
        {question.required && <Text style={styles.required}>*</Text>}
      </Text>
      
      <View style={styles.optionsContainer}>
        {question.options?.map((option, index) => (
          <PrimaryButton
            key={index}
            label={option}
            variant={value === option ? 'primary' : 'secondary'}
            onPress={() => handleOptionSelect(option)}
            style={styles.optionButton}
          />
        ))}
      </View>

      {showOtherInput && (
        <TextInput
          style={styles.otherInput}
          value={otherValue || ''}
          onChangeText={handleOtherValueChange}
          placeholder="Please specify..."
          placeholderTextColor={theme.colors.mutedText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  questionContainer: {
    marginBottom: theme.spacing.xl,
  },
  questionText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  required: {
    color: '#e74c3c',
  },
  optionsContainer: {
    gap: theme.spacing.sm as unknown as number,
  },
  optionButton: {
    marginVertical: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  otherInput: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
});
