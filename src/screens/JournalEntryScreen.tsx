import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, Text } from 'react-native';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { PrimaryButton } from '../components/PrimaryButton';
import { journalTags } from '../constants/journalTags';
import { useShared } from '../contexts/SharedContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

 type Props = NativeStackScreenProps<MainStackParamList, 'JournalEntry'>;

 export const JournalEntryScreen: React.FC<Props> = ({ navigation, route }) => {
   const { prompt } = route.params ?? {};
   const { participantNumber } = useAuth();
   const { currentShift } = useShared();
   const [content, setContent] = useState('');
   const [selectedTags, setSelectedTags] = useState<string[]>([]);
   const [isSaving, setIsSaving] = useState(false);

   const characterCount = content.length;

   const toggleTag = (tag: string) => {
     setSelectedTags(prev =>
       prev.includes(tag)
         ? prev.filter(t => t !== tag)
         : [...prev, tag]
     );
   };

   const handleSave = async () => {
     if (!content.trim() || !participantNumber) return;

     setIsSaving(true);
     try {
       const { error } = await supabase
         .from('journal_entries')
         .insert({
           participant_id: participantNumber,
           content: content.trim(),
           prompt: prompt || '',
           tags: selectedTags,
           shift: currentShift || 'day'
         });

       if (error) throw error;
       navigation.goBack();
     } catch (error) {
       console.error('Error saving journal entry:', error);
     } finally {
       setIsSaving(false);
     }
   };

   return (
     <Screen title={prompt ? 'Journal Entry' : 'Free Write'}>
       <ScrollView style={styles.scrollView}>
         {prompt && (
           <View style={styles.section}>
             <Text style={styles.sectionTitle}>Prompt</Text>
             <Text style={styles.promptText}>{prompt}</Text>
           </View>
         )}

         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Your Entry</Text>
           <TextInput
             style={styles.input}
             value={content}
             onChangeText={setContent}
             placeholder="Start writing here..."
             placeholderTextColor={theme.colors.mutedText}
             multiline
             textAlignVertical="top"
           />
           <View style={styles.metaRow}>
             <Text style={styles.metaText}>{characterCount} characters</Text>
             {selectedTags.length > 0 && (
               <Text style={styles.metaText}>{selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}</Text>
             )}
           </View>
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Tags</Text>
           <View style={styles.tagsContainer}>
             {journalTags.map(tag => (
               <PrimaryButton
                 key={tag}
                 label={tag}
                 onPress={() => toggleTag(tag)}
                 variant={selectedTags.includes(tag) ? 'primary' : 'secondary'}
                 style={styles.tagButton}
               />
             ))}
           </View>
         </View>

         <View style={styles.sectionLast}>
           <PrimaryButton
             label={isSaving ? "Saving..." : "Save Entry"}
             onPress={handleSave}
             disabled={!content.trim() || isSaving}
             style={styles.saveButton}
           />
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
   sectionLast: {
     padding: 20,
   },
   sectionTitle: {
     fontSize: 20,
     fontFamily: theme.typography.fontFamily.bold,
     marginBottom: 15,
     color: theme.colors.text,
   },
   promptText: {
     fontSize: 16,
     lineHeight: 24,
     color: theme.colors.text,
   },
   input: {
     borderWidth: 1,
     borderColor: theme.colors.border,
     borderRadius: theme.radii.lg,
     padding: theme.spacing.lg,
     minHeight: 220,
     fontSize: 16,
     lineHeight: 24,
     color: theme.colors.text,
     backgroundColor: theme.colors.surface,
   },
   metaRow: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     marginTop: theme.spacing.sm,
   },
   metaText: {
     fontSize: 12,
     color: theme.colors.mutedText,
     fontFamily: theme.typography.fontFamily.regular,
   },
   tagsContainer: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     gap: theme.spacing.sm as unknown as number,
   },
   tagButton: {
     paddingHorizontal: 14,
     paddingVertical: 8,
   },
   saveButton: {
     alignSelf: 'stretch',
     width: '100%',
   },
 });
