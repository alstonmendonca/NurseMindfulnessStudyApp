import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../navigation/types';
import Checkbox from '../components/Checkbox';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Consent'>;

export const ConsentScreen: React.FC<Props> = ({ navigation }) => {
  const [consents, setConsents] = useState({
    participation: false,
    dataCollection: false,
    anonymity: false,
    withdrawal: false,
  });

  const allConsentsChecked = Object.values(consents).every(value => value);

  const toggleConsent = (key: keyof typeof consents) => {
    setConsents(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleContinue = () => {
    if (allConsentsChecked) {
      navigation.navigate('DepartmentSelect');
    }
  };

  return (
    <Screen title="Research Consent">
      <ScrollView style={styles.scrollView}>
        
        <View style={styles.consentItem}>
          <Checkbox
            checked={consents.participation}
            onPress={() => toggleConsent('participation')}
            label="I voluntarily agree to participate in this research study."
          />
        </View>

        <View style={styles.consentItem}>
          <Checkbox
            checked={consents.dataCollection}
            onPress={() => toggleConsent('dataCollection')}
            label="I understand that my responses will be used for research purposes."
          />
        </View>

        <View style={styles.consentItem}>
          <Checkbox
            checked={consents.anonymity}
            onPress={() => toggleConsent('anonymity')}
            label="I understand that my data will be kept anonymous and confidential."
          />
        </View>

        <View style={styles.consentItem}>
          <Checkbox
            checked={consents.withdrawal}
            onPress={() => toggleConsent('withdrawal')}
            label="I understand that I can withdraw from the study at any time."
          />
        </View>

        <Text style={styles.info}>
          This study aims to understand and support nurses' mental health through regular check-ins and optional support tools.
          Your participation helps advance our understanding of healthcare workers' well-being.
        </Text>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !allConsentsChecked && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!allConsentsChecked}
      >
        <Text style={styles.buttonText}>I Agree</Text>
      </TouchableOpacity>
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
  consentItem: {
    marginBottom: 15,
  },
  info: {
    fontSize: 14,
    color: theme.colors.mutedText,
    marginTop: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.button,
    paddingVertical: 15,
    margin: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.button,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
