import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useParticipant } from '../contexts/ParticipantContext';
import { useShared } from '../contexts/SharedContext';
import { useAuth } from '../contexts/AuthContext';
import { ShiftSelector } from '../components/ShiftSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResearchButton } from '../components/ResearchButton';
import { Shift } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { studyGroup } = useParticipant();
  const { currentShift, setCurrentShift } = useShared();
  const { logout, participantNumber } = useAuth();

  const handleDailyCheckIn = () => {
    if (currentShift) {
      navigation.navigate('DailyCheckIn');
    } else {
      // Show an alert or message asking to select shift first
    }
  };

  const handleLogout = async () => {
    await logout();
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
            <ResearchButton
              label="Stress Assessment"
              type="PSS4"
              participantId={participantNumber!}
              onPress={() => navigation.navigate('ResearchCheckIn', { type: 'PSS4' })}
              style={styles.researchButton}
            />
            <ResearchButton
              label="Coping Strategies"
              type="COPE"
              participantId={participantNumber!}
              onPress={() => navigation.navigate('ResearchCheckIn', { type: 'COPE' })}
              style={styles.researchButton}
            />
            <ResearchButton
              label="Well-Being Check"
              type="WHO5"
              participantId={participantNumber!}
              onPress={() => navigation.navigate('ResearchCheckIn', { type: 'WHO5' })}
              style={styles.researchButton}
            />
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
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
