import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ checked, onPress, label }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <View style={styles.checkmark} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#4A90E2',
  },
  checkmark: {
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  label: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
});

export default Checkbox;
