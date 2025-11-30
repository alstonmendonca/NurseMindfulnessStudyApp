import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getMindfulnessByCategory, MediaItem } from '../data/mediaContent';
import { BackgroundDoodles } from '../components/BackgroundDoodles';

type Props = NativeStackScreenProps<MainStackParamList, 'Mindfulness'>;

export const MindfulnessScreen: React.FC<Props> = ({ navigation }) => {
  const mindfulnessByCategory = getMindfulnessByCategory();
  const categories = Object.keys(mindfulnessByCategory);

  const handlePlayAudio = (item: MediaItem, playlist: MediaItem[]) => {
    navigation.navigate('AudioPlayer', {
      title: item.title,
      thumbnail: item.thumbnail,
      audioUrl: item.url,
      duration: item.duration,
      playlist: playlist,
      currentIndex: playlist.findIndex(track => track.id === item.id),
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <BackgroundDoodles />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mindfulness</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Mindfulness Sections by Category */}
        {categories.map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {mindfulnessByCategory[category].map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.card} 
                  onPress={() => handlePlayAudio(item, mindfulnessByCategory[category])}
                >
                  <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                  <View style={styles.playButton}>
                    <Ionicons name="play" size={20} color="#fff" />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.duration}>{item.duration}</Text>
                    <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050726',
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E5E7EC',
    fontFamily: theme.typography.fontFamily.bold,
  },
  section: {
    marginTop: 24,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E5E7EC',
    marginBottom: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  horizontalScroll: {
    paddingRight: 16,
  },
  card: {
    width: 220,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 140,
    backgroundColor: '#101340',
  },
  playButton: {
    position: 'absolute',
    top: 50,
    left: 90,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 231, 236, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 12,
    backgroundColor: 'transparent',
  },
  duration: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.regular,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E7EC',
    fontFamily: theme.typography.fontFamily.medium,
  },
});
