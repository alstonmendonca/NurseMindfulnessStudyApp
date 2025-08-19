import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Shift } from '../types';

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
    padding: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    padding: 4,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#fff',
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
    color: '#666',
  },
  selectedButtonText: {
    color: '#000',
    fontWeight: '600',
  },
});
