import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useParticipant } from '../contexts/ParticipantContext';
import { useShared } from '../contexts/SharedContext';
import { ShiftSelector } from '../components/ShiftSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { Shift } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { studyGroup } = useParticipant();
  const { currentShift, setCurrentShift } = useShared();

  const handleDailyCheckIn = () => {
    if (currentShift) {
      navigation.navigate('DailyCheckIn');
    } else {
      // Show an alert or message asking to select shift first
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>How are you today?</Text>
      </View>

      <ShiftSelector
        selectedShift={currentShift}
        onSelectShift={setCurrentShift}
      />

      <View style={styles.content}>
        <PrimaryButton
          label="Quick Check-In"
          onPress={handleDailyCheckIn}
          style={styles.mainButton}
        />

        {studyGroup === 'intervention' && (
          <View style={styles.supportTools}>
            <PrimaryButton
              label="Calm Corner"
              onPress={() => navigation.navigate('CalmCorner' as never)}
              variant="secondary"
              style={styles.supportButton}
            />
            <PrimaryButton
              label="Journal"
              onPress={() => navigation.navigate('Journal' as never)}
              variant="secondary"
              style={styles.supportButton}
            />
          </View>
        )}

        <View style={styles.researchSection}>
          <Text style={styles.sectionTitle}>Research Check-ins</Text>
          <View style={styles.researchButtons}>
            <PrimaryButton
              label="Stress Assessment"
              onPress={() => navigation.navigate('ResearchCheckIn', { type: 'PSS4' })}
              variant="secondary"
              style={styles.researchButton}
            />
            <PrimaryButton
              label="Coping Strategies"
              onPress={() => navigation.navigate('ResearchCheckIn', { type: 'COPE' })}
              variant="secondary"
              style={styles.researchButton}
            />
            <PrimaryButton
              label="Well-Being Check"
              onPress={() => navigation.navigate('ResearchCheckIn', { type: 'WHO5' })}
              variant="secondary"
              style={styles.researchButton}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#4A90E2',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mainButton: {
    marginVertical: 20,
  },
  supportTools: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  supportButton: {
    flex: 0.48, // Just under half to leave space between buttons
  },
  researchSection: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  researchButtons: {
    gap: 10,
  },
  researchButton: {
    marginVertical: 0,
  },
});
