import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { useParticipant } from '../contexts/ParticipantContext';
import { useShared } from '../contexts/SharedContext';
import { useAuth } from '../contexts/AuthContext';
import { ShiftSelector } from '../components/ShiftSelector';
import { PrimaryButton } from '../components/PrimaryButton';
import { ResearchButton } from '../components/ResearchButton';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { CalmIcon, JournalIcon } from '../components/icons';

 type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

 export const HomeScreen: React.FC<Props> = ({ navigation }) => {
   const { studyGroup } = useParticipant();
   const { currentShift, setCurrentShift } = useShared();
   const { logout, participantNumber } = useAuth();
   const [refreshKey, setRefreshKey] = useState(0);

   // Refresh research buttons when screen comes into focus
   useFocusEffect(
     useCallback(() => {
       setRefreshKey(prev => prev + 1);
     }, [])
   );

   const handleDailyCheckIn = () => {
     if (currentShift) {
       navigation.navigate('DailyCheckIn');
     } else {
       // Consider prompting user to select a shift first
     }
   };

   const handleLogout = async () => {
     await logout();
   };

   const FeatureCard = ({ title, icon, onPress }: { title: string; icon: React.ReactNode; onPress: () => void }) => (
     <TouchableOpacity style={styles.featureCard} onPress={onPress}>
       <View style={styles.featureIconWrap}>{icon}</View>
       <Text style={styles.featureCardText}>{title}</Text>
     </TouchableOpacity>
   );

   return (
     <Screen>
       {/* Hero */}
       <View style={styles.hero}>
         <Text style={styles.appTitle}>SHANTHI</Text>
         <Text style={styles.appSubtitle}>How are you today?</Text>
       </View>

       {/* Shift selector */}
       <ShiftSelector selectedShift={currentShift} onSelectShift={setCurrentShift} />

       {/* Primary action */}
       <PrimaryButton
         label="Quick Check-In"
         onPress={handleDailyCheckIn}
         style={styles.mainButton}
       />

       <View style={styles.divider} />

       {/* Features grid */}
       {studyGroup === 'intervention' && (
         <View style={styles.featuresGrid}>
           <FeatureCard
             title="Calm Corner"
             icon={<CalmIcon />}
             onPress={() => navigation.navigate('CalmCorner' as never)}
           />
           <FeatureCard
             title="Journal"
             icon={<JournalIcon />}
             onPress={() => navigation.navigate('Journal' as never)}
           />
         </View>
       )}

       <View style={styles.divider} />

       {/* Research section */}
       <View style={styles.section}>
         <Text style={styles.sectionTitle}>Research</Text>
         <View style={styles.researchButtons}>
           <ResearchButton
             key={`PSS4-${refreshKey}`}
             label="Stress Assessment"
             type="PSS4"
             participantId={participantNumber!}
             onPress={() => navigation.navigate('ResearchCheckIn', { type: 'PSS4' })}
           />
           <ResearchButton
             key={`COPE-${refreshKey}`}
             label="Coping Strategies"
             type="COPE"
             participantId={participantNumber!}
             onPress={() => navigation.navigate('ResearchCheckIn', { type: 'COPE' })}
           />
           <ResearchButton
             key={`WHO5-${refreshKey}`}
             label="Well-Being Check"
             type="WHO5"
             participantId={participantNumber!}
             onPress={() => navigation.navigate('ResearchCheckIn', { type: 'WHO5' })}
           />
         </View>
       </View>

       {/* Floating logout */}
       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
         <Text style={styles.logoutText}>Logout</Text>
       </TouchableOpacity>
     </Screen>
   );
 };

 const styles = StyleSheet.create({
   hero: {
     alignItems: 'center',
     marginBottom: theme.spacing.xl,
   },
   appTitle: {
     fontSize: 32,
     letterSpacing: 3,
     fontFamily: theme.typography.fontFamily.bold,
     color: theme.colors.text,
   },
   appSubtitle: {
     marginTop: theme.spacing.sm,
     fontSize: 16,
     fontFamily: theme.typography.fontFamily.regular,
     color: theme.colors.mutedText,
   },
   mainButton: {
     marginTop: theme.spacing.md,
     marginBottom: theme.spacing.lg,
   },
   divider: {
     height: 1,
     backgroundColor: theme.colors.border,
     marginVertical: theme.spacing.lg,
   },
   featuresGrid: {
     flexDirection: 'row',
     gap: theme.spacing.lg as unknown as number,
     justifyContent: 'space-between',
     marginBottom: theme.spacing.xl,
   },
   featureCard: {
     flex: 1,
     backgroundColor: theme.colors.surface,
     borderWidth: 1,
     borderColor: theme.colors.border,
     borderRadius: theme.radii.lg,
     paddingVertical: theme.spacing.xl,
     alignItems: 'center',
   },
   featureIconWrap: {
     marginBottom: theme.spacing.sm,
   },
   featureCardText: {
     fontSize: 16,
     fontFamily: theme.typography.fontFamily.medium,
     color: theme.colors.text,
   },
   section: {
     marginTop: theme.spacing.lg,
   },
   sectionTitle: {
     fontSize: 18,
     fontFamily: theme.typography.fontFamily.medium,
     color: theme.colors.text,
     marginBottom: theme.spacing.md,
   },
   researchButtons: {
     gap: theme.spacing.sm as unknown as number,
   },
   logoutButton: {
     position: 'absolute',
     bottom: 20,
     right: 20,
     backgroundColor: theme.colors.buttonSecondaryBg,
     paddingVertical: 10,
     paddingHorizontal: 12,
     borderRadius: 20,
     borderWidth: 1,
     borderColor: theme.colors.border,
   },
   logoutText: {
     color: theme.colors.mutedText,
     fontSize: 14,
     fontFamily: theme.typography.fontFamily.regular,
   },
 });
