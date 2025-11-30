import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getBreathingVideosByCategory, MediaItem } from '../data/mediaContent';
import { BackgroundDoodles } from '../components/BackgroundDoodles';

type Props = NativeStackScreenProps<MainStackParamList, 'Breathing'>;

export const BreathingScreen: React.FC<Props> = ({ navigation }) => {
  const breathingVideosByCategory = getBreathingVideosByCategory();
  const categories = Object.keys(breathingVideosByCategory);

  const handlePlayVideo = (item: MediaItem) => {
    navigation.navigate('VideoPlayer', {
      title: item.title,
      thumbnail: item.thumbnail,
      videoUrl: item.url,
      duration: item.duration,
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
          <Text style={styles.headerTitle}>Breathing</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Breathing Sections by Category */}
        {categories.map((category) => (
          <View key={category} style={styles.section}>
            <Text style={styles.sectionTitle}>{category}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {breathingVideosByCategory[category].map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.card} 
                  onPress={() => handlePlayVideo(item)}
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
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  card: {
    width: 160,
    marginRight: 16,
    borderRadius: 16,
    backgroundColor: '#101340',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: '#1a1f4e',
  },
  playButton: {
    position: 'absolute',
    top: 40,
    left: 70,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(58, 36, 119, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    padding: 12,
  },
  duration: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 18,
  },
});
