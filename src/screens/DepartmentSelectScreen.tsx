import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { Department } from '../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DepartmentSelect'>;

const departments: Department[] = ['ICU', 'ER', 'Pediatrics', 'In-Patient', 'Out-Patient', 'Other'];

export const DepartmentSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Screen title="Select Your Department" subtitle="Which nursing department do you primarily work in?">
      <ScrollView style={styles.scrollView}>

        {departments.map((department) => (
          <TouchableOpacity
            key={department}
            style={styles.departmentButton}
            onPress={() => navigation.navigate('WhatToExpect', { department })}
          >
            <Text style={styles.departmentText}>{department}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  departmentButton: {
    backgroundColor: '#F3F4F6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  departmentText: {
    fontSize: 18,
    textAlign: 'center',
    color: theme.colors.text,
  },
});
