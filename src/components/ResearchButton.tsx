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

  useEffect(() => {
    const checkAvailability = async () => {
      const days = await getNextCheckInDays(participantId, type);
      setDaysRemaining(days);
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
        disabled={isDisabled}
      />
      {isDisabled && daysRemaining !== null && (
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
});
