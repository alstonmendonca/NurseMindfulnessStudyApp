import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Text, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import { useShared } from '../contexts/SharedContext';
import { supabase } from '../utils/supabase';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';

 type Props = NativeStackScreenProps<MainStackParamList, 'DailyCheckIn'>;

 const moodLabels = [
   'Very Unhappy',
   'Unhappy',
   'Neutral',
   'Happy',
   'Very Happy',
 ];

 const stressLabels = [
   'Not at all',
   'A little',
   'Moderate',
   'Quite a bit',
   'Extremely',
 ];

 const feelingTags = [
   'Exhausted',
   'Worried',
   'Calm',
   'Focused',
   'Frustrated',
   'Satisfied',
   'Overwhelmed',
   'Motivated',
 ];

 export const DailyCheckInScreen: React.FC<Props> = ({ navigation }) => {
   const { participantNumber } = useAuth();
   const { currentShift } = useShared();
   const [moodScore, setMoodScore] = useState<number | null>(null);
   const [stressLevel, setStressLevel] = useState<number | null>(null);
   const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
   const [note, setNote] = useState('');

   const handleSubmit = async () => {
   if (!participantNumber || moodScore === null || stressLevel === null) return;

     try {
       const { error } = await supabase.from('mood_checks').insert({
         participant_id: participantNumber,
         mood_score: moodScore + 1, // Convert 0-4 to 1-5
         stress_level: stressLevel + 1,
         feelings: selectedFeelings,
         note: note.trim() || null,
         shift: currentShift || 'day',
       });

       if (error) throw error;
       
       navigation.goBack();
     } catch (error) {
       console.error('Error saving check-in:', error);
       // Show error message to user
     }
   };

   const toggleFeeling = (feeling: string) => {
     setSelectedFeelings(prev =>
       prev.includes(feeling)
         ? prev.filter(f => f !== feeling)
         : [...prev, feeling]
     );
   };

   const SectionCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
     <View style={styles.card}>
       <Text style={styles.cardTitle}>{title}</Text>
       {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
       <View style={styles.cardBody}>{children}</View>
     </View>
   );

   const totalSections = 3;
   const completedSections = (moodScore !== null ? 1 : 0) + (stressLevel !== null ? 1 : 0) + (selectedFeelings.length > 0 ? 1 : 0);
   const progressRatio = completedSections / totalSections;

   return (
     <Screen title="Daily Check-In">
       <ScrollView style={styles.scrollView}>
         <SectionCard title="Mood">
           <View style={styles.scaleContainer}>
             {moodLabels.map((label, index) => (
               <PrimaryButton
                 key={label}
                 label={label}
                 variant={moodScore === index ? 'primary' : 'secondary'}
                 onPress={() => setMoodScore(index)}
                 style={styles.scaleButton}
               />
             ))}
           </View>
         </SectionCard>

         <SectionCard title="Stress">
           <View style={styles.scaleContainer}>
             {stressLabels.map((label, index) => (
               <PrimaryButton
                 key={label}
                 label={label}
                 variant={stressLevel === index ? 'primary' : 'secondary'}
                 onPress={() => setStressLevel(index)}
                 style={styles.scaleButton}
               />
             ))}
           </View>
         </SectionCard>

         <SectionCard title="Feelings" subtitle="Select all that apply">
           <View style={styles.tagsContainer}>
             {feelingTags.map(feeling => (
               <PrimaryButton
                 key={feeling}
                 label={feeling}
                 variant={selectedFeelings.includes(feeling) ? 'primary' : 'secondary'}
                 onPress={() => toggleFeeling(feeling)}
                 style={styles.tagButton}
               />
             ))}
           </View>
         </SectionCard>

         <View style={styles.progressWrap}>
           <Text style={styles.progressText}>{completedSections}/{totalSections} completed</Text>
           <View style={styles.progressBarBackground}>
             <View style={[styles.progressBarFill, { width: `${Math.max(8, progressRatio * 100)}%` }]} />
           </View>
         </View>

         <PrimaryButton
           label="Submit"
           onPress={handleSubmit}
           disabled={moodScore === null || stressLevel === null}
           style={styles.submitButton}
         />
       </ScrollView>
     </Screen>
   );
 };

 const styles = StyleSheet.create({
   scrollView: {
     flex: 1,
     padding: theme.spacing.xl,
   },
   card: {
     backgroundColor: theme.colors.surface,
     borderWidth: 1,
     borderColor: theme.colors.border,
     borderRadius: theme.radii.lg,
     paddingVertical: theme.spacing.lg,
     paddingHorizontal: theme.spacing.lg,
     marginBottom: theme.spacing.lg,
   },
   cardTitle: {
     fontSize: 18,
     fontFamily: theme.typography.fontFamily.medium,
     color: theme.colors.text,
   },
   cardSubtitle: {
     marginTop: theme.spacing.xs,
     fontSize: 14,
     fontFamily: theme.typography.fontFamily.regular,
     color: theme.colors.mutedText,
   },
   cardBody: {
     marginTop: theme.spacing.md,
   },
   scaleContainer: {
     gap: theme.spacing.sm as unknown as number,
   },
   scaleButton: {
     marginVertical: 2,
   },
   tagsContainer: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: theme.spacing.sm as unknown as number,
   },
   tagButton: {
     paddingHorizontal: 15,
     paddingVertical: 8,
   },
   progressWrap: {
     marginTop: theme.spacing.xl,
     marginBottom: theme.spacing.md,
   },
   progressText: {
     fontSize: 14,
     color: theme.colors.mutedText,
     fontFamily: theme.typography.fontFamily.regular,
     marginBottom: theme.spacing.sm,
   },
   progressBarBackground: {
     height: 8,
     backgroundColor: '#F3F4F6',
     borderRadius: 8,
     borderWidth: 1,
     borderColor: theme.colors.border,
     overflow: 'hidden',
   },
   progressBarFill: {
     height: '100%',
     backgroundColor: theme.colors.text,
   },
   submitButton: {
     marginVertical: theme.spacing.xl,
   },
 });
