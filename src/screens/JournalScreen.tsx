import React, { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { JournalPromptCard } from '../components/JournalPromptCard';
import { journalPrompts } from '../constants/journalPrompts';
import { useParticipant } from '../contexts/ParticipantContext';

 type Props = NativeStackScreenProps<MainStackParamList, 'Journal'>;

 export const JournalScreen: React.FC<Props> = ({ navigation }) => {
   const { studyGroup } = useParticipant();

   useEffect(() => {
     // Redirect if not in intervention group
     if (studyGroup !== 'intervention') {
       navigation.replace('Home');
     }
   }, [studyGroup, navigation]);

   if (studyGroup !== 'intervention') {
     return null;
   }

   const todaysPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

   const navigateToEntry = (prompt?: string) => {
     navigation.navigate('JournalEntry', { prompt });
   };

   return (
     <Screen title="Journal">
       <ScrollView style={styles.scrollView}>
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Today's Prompt</Text>
           <JournalPromptCard
             prompt={todaysPrompt}
             onSelect={() => navigateToEntry(todaysPrompt)}
           />
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Start Writing</Text>
           <PrimaryButton
             label="Free Write"
             onPress={() => navigateToEntry()}
             style={styles.freeWriteButton}
           />
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionTitle}>More Prompts</Text>
           <View style={styles.promptsList}>
             {journalPrompts.map((prompt, index) => (
               <JournalPromptCard
                 key={index}
                 prompt={prompt}
                 onSelect={() => navigateToEntry(prompt)}
               />
             ))}
           </View>
         </View>
       </ScrollView>
     </Screen>
   );
 };

 const styles = StyleSheet.create({
   scrollView: {
     flex: 1,
   },
   section: {
     padding: 20,
     borderBottomWidth: 1,
     borderBottomColor: theme.colors.border,
   },
   sectionTitle: {
     fontSize: 20,
     fontFamily: theme.typography.fontFamily.bold,
     marginBottom: 20,
     color: theme.colors.text,
   },
   freeWriteButton: {
     marginTop: 4,
     alignSelf: 'stretch',
     width: '100%',
   },
   promptsList: {
     gap: 10,
   },
 });
