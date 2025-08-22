import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';
import { CheckInType, getNextCheckInDays } from '../utils/researchSchedule';

interface ResearchButtonProps {
  label: string;
  type: CheckInType;
  participantId: number;
  onPress: () => void;
  style?: any;
}

export const ResearchButton: React.FC<ResearchButtonProps> = ({
  label,
  type,
  participantId,
  onPress,
  style
}) => {
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setIsLoading(true);
        const days = await getNextCheckInDays(participantId, type);
        setDaysRemaining(days);
      } catch (error) {
        console.error('Error checking availability:', error);
        setDaysRemaining(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAvailability();
  }, [participantId, type]);

  const isDisabled = daysRemaining !== 0;

  return (
    <View style={[styles.container, style]}>
      <PrimaryButton
        label={label}
        onPress={onPress}
        variant="secondary"
        disabled={isDisabled || isLoading}
        style={[
          isDisabled && styles.disabledButton
        ]}
      />
      {!isLoading && isDisabled && daysRemaining !== null && daysRemaining > 0 && (
        <Text style={styles.availableText}>
          Available in {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  availableText: {
    fontSize: 12,
    color: theme.colors.mutedText,
    textAlign: 'center',
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    opacity: 0.6,
  },
});
