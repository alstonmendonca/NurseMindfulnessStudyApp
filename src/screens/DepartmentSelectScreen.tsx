import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import { Department } from '../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'DepartmentSelect'>;

const departments: Department[] = ['ICU', 'ER', 'Pediatrics', 'In-Patient', 'Out-Patient', 'Other'];

export const DepartmentSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Select Your Department</Text>
        <Text style={styles.subtitle}>Which nursing department do you primarily work in?</Text>

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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  departmentButton: {
    backgroundColor: '#F5F5F5',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  departmentText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
