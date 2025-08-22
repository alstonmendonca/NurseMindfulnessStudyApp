import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Shift } from '../types';
import { theme } from '../constants/theme';

interface ShiftSelectorProps {
  selectedShift: Shift | null;
  onSelectShift: (shift: Shift) => void;
}

export const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  selectedShift,
  onSelectShift,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Shift</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            selectedShift === 'day' && styles.selectedButton,
          ]}
          onPress={() => onSelectShift('day')}
        >
          <Text
            style={[
              styles.shiftButtonText,
              selectedShift === 'day' && styles.selectedButtonText,
            ]}
          >
            Day Shift
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.shiftButton,
            selectedShift === 'night' && styles.selectedButton,
          ]}
          onPress={() => onSelectShift('night')}
        >
          <Text
            style={[
              styles.shiftButtonText,
              selectedShift === 'night' && styles.selectedButtonText,
            ]}
          >
            Night Shift
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 10,
    color: theme.colors.text,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: theme.colors.surface,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  shiftButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.mutedText,
  },
  selectedButtonText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.medium,
  },
});
