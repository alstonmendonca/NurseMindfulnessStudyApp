import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, ImageBackground, Dimensions, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { theme } from '../constants/theme';
import { Screen } from '../components/Screen';
import { Audio, Video, ResizeMode } from 'expo-av';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

interface AudioItem {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'audio';
  category: string;
}

interface VideoItem {
  id: string;
  name: string;
  description: string;
  url: string;
  type: 'video';
  duration: string;
}

type MediaItem = AudioItem | VideoItem;

// Helper function to render icon based on category and type
const renderIcon = (item: any, size: number = 24, color: string = theme.colors.text) => {
  // For now, use simple category-based icons
  if (item.category === 'nature') {
    if (item.name.includes('Ocean')) return <Ionicons name="water" size={size} color={color} />;
    if (item.name.includes('Rain')) return <Ionicons name="rainy" size={size} color={color} />;
    if (item.name.includes('Thunder')) return <Ionicons name="flash" size={size} color={color} />;
    return <Ionicons name="leaf" size={size} color={color} />;
  }
  if (item.category === 'ambient' || item.name.includes('Noise')) {
    return <MaterialIcons name="graphic-eq" size={size} color={color} />;
  }
  if (item.category === 'meditation' || item.name.includes('Meditation')) {
    return <MaterialIcons name="self-improvement" size={size} color={color} />;
  }
  if (item.type === 'video') {
    return <Ionicons name="play-circle" size={size} color={color} />;
  }
  return <Ionicons name="musical-notes" size={size} color={color} />;
};

// Enhanced media items with real Google Drive URLs
const mediaItems: MediaItem[] = [
  // Nature Sounds
  {
    id: 'ocean',
    name: 'Ocean Sounds',
    description: 'Gentle waves for deep relaxation and peaceful sleep',
    url: 'https://drive.google.com/uc?export=download&id=1eiuIUXssfNrLqxF4bjXPoD8nPgEhS1bf',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'heavy-rain-1',
    name: 'Heavy Rain v1',
    description: 'Intense rainfall for deep focus and relaxation',
    url: 'https://drive.google.com/uc?export=download&id=1aYU4sLnpWM0MMSli4dU2oeIKo8JgOdOh',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'heavy-rain-2',
    name: 'Heavy Rain v2',
    description: 'Alternative heavy rain sounds for variety',
    url: 'https://drive.google.com/uc?export=download&id=1md6XBXJ31J9zuYF9HylHkIN07sqQy7P4',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'light-rain',
    name: 'Light Rain',
    description: 'Gentle rainfall for peaceful moments',
    url: 'https://drive.google.com/uc?export=download&id=1aSnZXU2V_ZfNZpMtLdZrwyZdLYZj02u3',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'nature-rain',
    name: 'Nature + Rain',
    description: 'Combined nature sounds with gentle rain',
    url: 'https://drive.google.com/uc?export=download&id=1KPdEXVUkQkwzbxieviwANtR-uYE_pNJA',
    type: 'audio',
    category: 'nature',
  },
  {
    id: 'rain-thunder',
    name: 'Rain + Thunder',
    description: 'Dramatic storms for powerful relaxation',
    url: 'https://drive.google.com/uc?export=download&id=18HqgeTiuBoLF8mMr9MxdQBkdmW_iLMgP',
    type: 'audio',
    category: 'nature',
  },
  
  // Ambient Sounds
  {
    id: 'fire',
    name: 'Crackling Fire',
    description: 'Warm and cozy fireplace sounds',
    url: 'https://drive.google.com/uc?export=download&id=1lZrazuSfSLddfvbNAmccbHni4GkJUsmj',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-1',
    name: 'Brown Noise v1',
    description: 'Deep focus and concentration sound',
    url: 'https://drive.google.com/uc?export=download&id=1ihAWYMsPJtNdLM4xwlXlb4uUFPUdd0ON',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-2',
    name: 'Brown Noise v2',
    description: 'Alternative brown noise for variety',
    url: 'https://drive.google.com/uc?export=download&id=1Zy170rZyvhvHJryYEIMRx7igOhRLhE23',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-3',
    name: 'Brown Noise v3',
    description: 'Third variation of calming brown noise',
    url: 'https://drive.google.com/uc?export=download&id=1xRTdhu3KDZpOaDhQOZG5JfEeZFaFXfCV',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'brown-noise-4',
    name: 'Brown Noise v4',
    description: 'Fourth brown noise option for extended listening',
    url: 'https://drive.google.com/uc?export=download&id=1SpjLNGr8mW7XsXQ_Uv4i0BHeTdfPh0cU',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'meditation-1',
    name: 'Meditation Audio v1',
    description: 'Foundational mindfulness meditation audio',
    url: 'https://drive.google.com/uc?export=download&id=1MrEzLQf9cPhwEVZUCkiXDEoOg9DMUmuH',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'meditation-2',
    name: 'Meditation Audio v2',
    description: 'Intermediate meditation for deeper practice',
    url: 'https://drive.google.com/uc?export=download&id=1p2tpFTnMaruPKPqirl2gRCBtQ-f3maDQ',
    type: 'audio',
    category: 'ambient',
  },
  {
    id: 'meditation-3',
    name: 'Meditation Audio v3',
    description: 'Advanced meditation for experienced practitioners',
    url: 'https://drive.google.com/uc?export=download&id=1mU9Yr6aAgWJBAisac6baJgPr0iJZbGu7',
    type: 'audio',
    category: 'ambient',
  },
  
  // Guided Breathing Videos (Only these are videos)
  {
    id: 'breathing-1',
    name: 'Guided Breathing v1',
    description: 'Essential breathing techniques for beginners',
    url: 'https://drive.google.com/uc?export=download&id=1KQ6K--SAVrR1w6sZdOcxTv3xiFboiw2V',
    type: 'video',
    duration: '5 min',
  },
  {
    id: 'breathing-2',
    name: 'Guided Breathing v2',
    description: 'Advanced breathing exercises for deeper calm',
    url: 'https://drive.google.com/uc?export=download&id=11c_hmjSimLnJV7Kh--cfF22sE-kYYcA7',
    type: 'video',
    duration: '8 min',
  },
  {
    id: 'breathing-3',
    name: 'Guided Breathing v3',
    description: 'Complete breathing meditation journey',
    url: 'https://drive.google.com/uc?export=download&id=1g9pVLqHbW92hZIQpX8b3YV7jz6QM7izH',
    type: 'video',
    duration: '10 min',
  }
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { logout } = useAuth();
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMediaId, setCurrentMediaId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'nature' | 'ambient' | 'video'>('nature');
  
  // Audio progress tracking
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  
  // Loading states
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  
  // Media caching

  const [downloadProgress, setDownloadProgress] = useState<Map<string, number>>(new Map());
  const [isDownloading, setIsDownloading] = useState<Set<string>>(new Set());
  
  // Video player state
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [videoStatus, setVideoStatus] = useState<any>({});
  const videoRef = useRef<Video>(null);

  const handleLogout = async () => {
    await logout();
  };

  // Helper function to format time in MM:SS format
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayAudio = async (item: AudioItem) => {
    try {
      // Stop current sound if playing
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(false);
        setAudioPosition(0);
        setAudioDuration(0);
      }

      if (currentMediaId === item.id && isPlaying) {
        // If same audio is playing, stop it
        setCurrentMediaId(null);
        return;
      }

      // Show loading state
      setIsAudioLoading(true);
      setCurrentMediaId(item.id);

      console.log('Loading audio from URL:', item.name);
      
      // Set up audio session for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and load audio directly from URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.url },
        { 
          shouldPlay: false,
          isLooping: true, 
          volume: 0.8,
          progressUpdateIntervalMillis: 500
        }
      );

      // Wait for audio to be fully loaded
      let loadRetries = 0;
      const maxLoadRetries = 30; // 3 seconds max wait
      
      while (loadRetries < maxLoadRetries) {
        const loadStatus = await sound.getStatusAsync();
        if (loadStatus.isLoaded) {
          console.log('Audio fully loaded after', loadRetries * 100, 'ms');
          break;
        }
        
        if (loadStatus.error) {
          throw new Error(`Audio loading error: ${loadStatus.error}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
        loadRetries++;
      }
      
      // Final check to ensure audio is loaded
      const finalLoadStatus = await sound.getStatusAsync();
      if (!finalLoadStatus.isLoaded) {
        throw new Error('Audio failed to load within timeout period');
      }

      // Set up playback status listener
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if (status.error) {
            console.error('Audio playback error:', status.error);
            Alert.alert('Playback Error', 'Unable to play this audio file');
            setIsPlaying(false);
            setCurrentMediaId(null);
            setIsAudioLoading(false);
            setAudioPosition(0);
            setAudioDuration(0);
          }
        } else {
          // Update position and duration
          if (status.positionMillis !== undefined) {
            setAudioPosition(status.positionMillis);
          }
          if (status.durationMillis !== undefined) {
            setAudioDuration(status.durationMillis);
          }
          
          // Update playing state
          setIsPlaying(status.isPlaying || false);
          
          // Handle playback completion
          if (status.didJustFinish && !status.isLooping) {
            setIsPlaying(false);
            setCurrentMediaId(null);
            setAudioPosition(0);
          }
        }
      });
      
      // Start playback
      await sound.playAsync();
      
      setCurrentSound(sound);
      setIsPlaying(true);
      setIsAudioLoading(false);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio. Please check your internet connection and try again.');
      
      // Reset states on error
      setIsPlaying(false);
      setCurrentMediaId(null);
      setIsAudioLoading(false);
      setAudioPosition(0);
      setAudioDuration(0);
      setCurrentSound(null);
    }
  };

  const handlePlayVideo = async (item: VideoItem) => {
    try {
      // Stop any currently playing audio
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
        setCurrentSound(null);
        setIsPlaying(false);
        setCurrentMediaId(null);
        setAudioPosition(0);
        setAudioDuration(0);
      }

      // Set loading state and open modal
      setIsVideoLoading(true);
      setCurrentVideo(item);
      setIsVideoModalVisible(true);
    } catch (error) {
      console.error('Error opening video:', error);
      Alert.alert('Error', 'Failed to open video player');
      setIsVideoLoading(false);
    }
  };

  const closeVideoPlayer = async () => {
    if (videoRef.current) {
      await videoRef.current.stopAsync();
    }
    setIsVideoModalVisible(false);
    setCurrentVideo(null);
    setVideoStatus({});
    setIsVideoLoading(false);
  };

  // Handle video status updates
  const handleVideoStatusUpdate = (status: any) => {
    setVideoStatus(status);
    if (status.isLoaded) {
      setIsVideoLoading(false);
    }
  };

  const handleMediaPress = (item: MediaItem) => {
    if (item.type === 'audio') {
      handlePlayAudio(item as AudioItem);
    } else {
      handlePlayVideo(item as VideoItem);
    }
  };

  const stopCurrentMedia = async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      setCurrentSound(null);
    }
    setIsPlaying(false);
    setCurrentMediaId(null);
    setAudioPosition(0);
    setAudioDuration(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop current sound
      if (currentSound) {
        currentSound.unloadAsync();
      }
      
      setAudioPosition(0);
      setAudioDuration(0);
    };
  }, [currentSound]);

  // Set up progress tracking interval when audio is playing
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (currentSound && isPlaying) {
      progressInterval = setInterval(async () => {
        try {
          const status = await currentSound.getStatusAsync();
          if (status.isLoaded) {
            if (status.positionMillis !== undefined) {
              setAudioPosition(status.positionMillis);
            }
            if (status.durationMillis !== undefined) {
              setAudioDuration(status.durationMillis);
            }
          }
        } catch (error) {
          console.log('Error getting audio status:', error);
        }
      }, 500); // Update every 500ms for smooth progress
    }

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [currentSound, isPlaying]);

  const getFilteredItems = () => {
    if (selectedCategory === 'video') {
      return mediaItems.filter(item => item.type === 'video');
    }
    return mediaItems.filter(item => item.type === 'audio' && (item as AudioItem).category === selectedCategory);
  };

  const getCurrentCategoryInfo = () => {
    switch (selectedCategory) {
      case 'nature':
        return {
          title: 'Nature Sounds',
          subtitle: 'Peaceful sounds to refresh and reawaken your senses',
          tags: ['PEACE', 'CALM', 'RELAXATION']
        };
      case 'ambient':
        return {
          title: 'Ambient Sounds',
          subtitle: 'Background sounds for focus and relaxation',
          tags: ['FOCUS', 'CONCENTRATION', 'AMBIENT']
        };
      case 'video':
        return {
          title: 'Guided Meditation',
          subtitle: 'Video-guided breathing and mindfulness exercises',
          tags: ['BREATHING', 'MEDITATION', 'MINDFULNESS']
        };
    }
  };

  const categoryInfo = getCurrentCategoryInfo();
  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      {/* Header with sign out button */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerWelcome}>SHANTHI</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={16} color={theme.colors.text} />
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Find your moment of peace</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>days</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>12</Text>
                <Text style={styles.statLabel}>sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>45m</Text>
                <Text style={styles.statLabel}>total</Text>
              </View>
            </View>
          </View>
          <View style={styles.welcomeIcon}>
            <MaterialIcons name="self-improvement" size={32} color={theme.colors.primary} />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.categorySelector}>
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'nature' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('nature')}
          >
            <View style={styles.categoryButtonContent}>
              <Ionicons 
                name="leaf" 
                size={18} 
                color={selectedCategory === 'nature' ? theme.colors.textOnPrimary : theme.colors.text} 
              />
              <Text style={[styles.categoryButtonText, selectedCategory === 'nature' && styles.categoryButtonTextActive]}>
                Nature
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'ambient' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('ambient')}
          >
            <View style={styles.categoryButtonContent}>
              <MaterialIcons 
                name="graphic-eq" 
                size={18} 
                color={selectedCategory === 'ambient' ? theme.colors.textOnPrimary : theme.colors.text} 
              />
              <Text style={[styles.categoryButtonText, selectedCategory === 'ambient' && styles.categoryButtonTextActive]}>
                Ambient
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.categoryButton, selectedCategory === 'video' && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory('video')}
          >
            <View style={styles.categoryButtonContent}>
              <Ionicons 
                name="videocam" 
                size={18} 
                color={selectedCategory === 'video' ? theme.colors.textOnPrimary : theme.colors.text} 
              />
              <Text style={[styles.categoryButtonText, selectedCategory === 'video' && styles.categoryButtonTextActive]}>
                Videos
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Content for Videos */}
        {selectedCategory === 'video' && (
          <View style={styles.featuredSection}>
            <Text style={styles.featuredTitle}>Featured Meditation</Text>
            <View style={styles.featuredCard}>
              <View style={styles.featuredCardContent}>
                <View style={styles.featuredVideoThumbnail}>
                  <View style={styles.featuredVideoIcon}>
                    <MaterialIcons name="self-improvement" size={48} color={theme.colors.text} />
                  </View>
                  <View style={styles.playButtonLarge}>
                    <Ionicons name="play" size={24} color={theme.colors.text} />
                  </View>
                </View>
                <View style={styles.featuredInfo}>
                  <Text style={styles.featuredVideoTitle}>Morning Mindfulness</Text>
                  <Text style={styles.featuredVideoDescription}>
                    Start your day with intention and calm awareness
                  </Text>
                  <View style={styles.featuredTags}>
                    <View style={styles.featuredTag}>
                      <Text style={styles.featuredTagText}>15 min</Text>
                    </View>
                    <View style={styles.featuredTag}>
                      <Text style={styles.featuredTagText}>Beginner</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Media List */}
        <View style={styles.mediaContainer}>
          {selectedCategory === 'video' ? (
            // Video Grid Layout - Improved Design
            <View style={styles.videoGrid}>
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.videoCard,
                    (currentMediaId === item.id && isVideoLoading) && styles.videoCardDisabled
                  ]}
                  onPress={() => handleMediaPress(item)}
                  disabled={currentMediaId === item.id && isVideoLoading}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.videoThumbnail,
                    (currentMediaId === item.id && isVideoLoading) && styles.videoThumbnailDisabled
                  ]}>
                    {/* Background gradient effect */}
                    <View style={styles.videoThumbnailGradient} />
                    
                    {/* Main icon */}
                    <View style={styles.videoThumbnailIcon}>
                      {renderIcon(item, 28, theme.colors.primary)}
                    </View>
                    
                    {/* Duration badge */}
                    <View style={styles.videoDurationBadge}>
                      <Text style={styles.videoDurationText}>
                        {(item as VideoItem).duration}
                      </Text>
                    </View>
                    
                    {/* Play button overlay */}
                    <View style={styles.videoPlayButtonOverlay}>
                      <View style={styles.videoPlayButton}>
                        <Ionicons 
                          name="play" 
                          size={18} 
                          color={theme.colors.textOnPrimary} 
                          style={{ marginLeft: 2 }}
                        />
                      </View>
                    </View>
                    
                    {/* Loading overlay */}
                    {currentMediaId === item.id && isVideoLoading && (
                      <View style={styles.videoLoadingOverlay}>
                        <View style={styles.videoLoadingSpinner}>
                          <MaterialIcons name="hourglass-empty" size={20} color={theme.colors.textOnPrimary} />
                        </View>
                        <Text style={styles.videoLoadingText}>Loading...</Text>
                      </View>
                    )}
                  </View>
                  
                  {/* Card content */}
                  <View style={styles.videoCardContent}>
                    <Text style={styles.videoCardTitle} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text style={styles.videoCardDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            // Audio List Layout
            <View style={styles.audioList}>
              {filteredItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.audioItem,
                    currentMediaId === item.id && isPlaying && styles.audioItemActive,
                    (currentMediaId === item.id && isAudioLoading) && styles.audioItemDisabled
                  ]}
                  onPress={() => handleMediaPress(item)}
                  disabled={currentMediaId === item.id && isAudioLoading}
                >
                  <View style={styles.audioItemContent}>
                    <View style={[
                      styles.audioIcon,
                      (currentMediaId === item.id && isAudioLoading) && styles.audioIconDisabled
                    ]}>
                      <View style={styles.audioIconContainer}>
                        {renderIcon(item, 24, (currentMediaId === item.id && isAudioLoading) ? theme.colors.textLight : theme.colors.text)}
                      </View>
                      {currentMediaId === item.id && isPlaying && (
                        <View style={styles.audioPlayingIndicator}>
                          <View style={styles.audioPlayingDot} />
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.audioInfo}>
                      <Text style={styles.audioTitle}>{item.name}</Text>
                      <Text style={styles.audioDescription}>{item.description}</Text>
                      
                      {/* Enhanced Audio Waveform Visualization */}
                      <View style={styles.waveformContainer}>
                        {[4, 12, 8, 16, 6, 20, 14, 10, 18, 7, 15, 9, 13, 17, 5, 19, 11, 8, 14, 6].map((height, i) => (
                          <View
                            key={i}
                            style={[
                              styles.waveformBar,
                              {
                                height: currentMediaId === item.id && isPlaying 
                                  ? height 
                                  : Math.max(4, height * 0.4),
                                backgroundColor: currentMediaId === item.id && isPlaying 
                                  ? theme.colors.primary 
                                  : theme.colors.border
                              }
                            ]}
                          />
                        ))}
                      </View>
                    </View>

                    <View style={styles.audioControls}>
                      <TouchableOpacity 
                        style={[
                          styles.audioPlayButton,
                          (currentMediaId === item.id && isAudioLoading) && styles.audioPlayButtonDisabled
                        ]}
                        onPress={() => handleMediaPress(item)}
                        disabled={currentMediaId === item.id && isAudioLoading}
                      >
                        <View style={styles.audioPlayButtonIcon}>
                          {currentMediaId === item.id && isAudioLoading ? (
                            <MaterialIcons name="hourglass-empty" size={16} color={theme.colors.textLight} />
                          ) : currentMediaId === item.id && isPlaying ? (
                            <Ionicons name="pause" size={16} color={theme.colors.text} />
                          ) : (
                            <Ionicons name="play" size={16} color={theme.colors.text} />
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.audioOptionsButton}>
                        <MaterialIcons name="more-horiz" size={16} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Enhanced Loading indicator for audio */}
                  {currentMediaId === item.id && isAudioLoading && (
                    <View style={styles.audioLoadingContainer}>
                      <View style={styles.audioLoadingBar}>
                        <View style={styles.audioLoadingIndicator} />
                      </View>
                      <Text style={styles.audioLoadingText}>Loading audio...</Text>
                    </View>
                  )}

                  {/* Progress bar for playing audio */}
                  {currentMediaId === item.id && isPlaying && !isAudioLoading && (
                    <View style={styles.audioProgressContainer}>
                      <View style={styles.audioProgressBar}>
                        <View style={[
                          styles.audioProgressFill,
                          {
                            width: audioDuration > 0 
                              ? `${(audioPosition / audioDuration) * 100}%` 
                              : '0%'
                          }
                        ]} />
                      </View>
                      <Text style={styles.audioProgressTime}>
                        {formatTime(audioPosition)} / {audioDuration > 0 ? formatTime(audioDuration) : '--:--'}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Stop button when media is playing */}
        {isPlaying && (
          <View style={styles.controlSection}>
            <TouchableOpacity style={styles.stopButton} onPress={stopCurrentMedia}>
              <View style={styles.stopButtonContent}>
                <Ionicons name="stop" size={16} color={theme.colors.textOnPrimary} />
                <Text style={styles.stopButtonText}>Stop</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={isVideoModalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={closeVideoPlayer}
      >
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalContent}>
            {/* Video Header */}
            <View style={styles.videoHeader}>
              <TouchableOpacity style={styles.videoCloseButton} onPress={closeVideoPlayer}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <View style={styles.videoHeaderInfo}>
                <Text style={styles.videoHeaderTitle}>
                  {currentVideo?.name || 'Guided Meditation'}
                </Text>
                <Text style={styles.videoHeaderDescription}>
                  {currentVideo?.description || 'Mindful breathing exercise'}
                </Text>
              </View>
            </View>

            {/* Video Player */}
            <View style={styles.videoPlayerContainer}>
              {currentVideo && (
                <>
                  <Video
                    ref={videoRef}
                    style={styles.videoPlayer}
                    source={{ uri: currentVideo.url }}
                    useNativeControls
                    resizeMode={ResizeMode.CONTAIN}
                    isLooping={false}
                    onPlaybackStatusUpdate={handleVideoStatusUpdate}
                    shouldPlay={true}
                  />
                  
                  {/* Video Loading Overlay */}
                  {isVideoLoading && (
                    <View style={styles.videoLoadingOverlay}>
                      <View style={styles.videoLoadingContainer}>
                        <View style={styles.videoLoadingIcon}>
                          <MaterialIcons name="hourglass-empty" size={24} color={theme.colors.text} />
                        </View>
                        <Text style={styles.videoLoadingText}>Loading video...</Text>
                        <View style={styles.videoLoadingBar}>
                          <View style={styles.videoLoadingIndicator} />
                        </View>
                      </View>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Video Info */}
            <View style={styles.videoInfoContainer}>
              <View style={styles.videoInfoRow}>
                <Text style={styles.videoInfoLabel}>Duration:</Text>
                <Text style={styles.videoInfoValue}>{currentVideo?.duration}</Text>
              </View>
              <View style={styles.videoInfoRow}>
                <Text style={styles.videoInfoLabel}>Type:</Text>
                <Text style={styles.videoInfoValue}>Guided Meditation</Text>
              </View>
              <Text style={styles.videoInstructions}>
                Find a comfortable position, close your eyes if you'd like, and follow along with the guidance.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerWelcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
  },
  signOutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.md,
  },
  signOutButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  scrollView: {
    flex: 1,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    ...theme.shadows.md,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  welcomeIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categorySelector: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
    ...theme.shadows.md,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  categoryButtonText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  categoryButtonTextActive: {
    color: theme.colors.textOnPrimary,
  },
  
  // Featured Section
  featuredSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.bold,
  },
  featuredCard: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  featuredCardContent: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredVideoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: theme.radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: theme.spacing.md,
    ...theme.shadows.md,
  },
  featuredVideoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  playButtonLarge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredVideoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
  },
  featuredVideoDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.fontFamily.regular,
  },
  featuredTags: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  featuredTag: {
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  featuredTagText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  
  // Media Container
  mediaContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  
  // Video Grid
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  videoCard: {
    width: '48%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 3,
  },
  videoCardDisabled: {
    opacity: 0.7,
  },
  videoThumbnail: {
    width: '100%',
    height: 120,
    backgroundColor: `${theme.colors.primary}08`,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  videoThumbnailDisabled: {
    opacity: 0.6,
  },
  videoThumbnailGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `${theme.colors.primary}10`,
  },
  videoThumbnailIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.radii.lg,
    width: 50,
    height: 50,
    ...theme.shadows.sm,
    elevation: 2,
  },
  videoDurationBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.md,
  },
  videoDurationText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.bold,
  },
  videoPlayButtonOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  videoPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
    elevation: 3,
  },
  videoLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoLoadingSpinner: {
    marginBottom: theme.spacing.xs,
  },
  videoLoadingText: {
    fontSize: 12,
    color: theme.colors.textOnPrimary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  videoCardContent: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  videoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.bold,
    lineHeight: 18,
  },
  videoCardDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.regular,
    lineHeight: 16,
  },
  
  // Audio List
  audioList: {
    gap: theme.spacing.md,
  },
  audioItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  audioItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    ...theme.shadows.lg,
  },
  audioItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  audioIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
    ...theme.shadows.sm,
  },
  audioIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  audioPlayingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  audioInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.medium,
  },
  audioDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontFamily: theme.typography.fontFamily.regular,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 20,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 4,
    backgroundColor: theme.colors.primary,
  },
  audioControls: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  audioPlayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  audioPlayButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioOptionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  
  // Progress and Loading - Enhanced
  audioProgressContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  audioProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  audioProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  audioProgressTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    minWidth: 60,
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Enhanced Loading Indicators
  audioLoadingContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    alignItems: 'center',
  },
  audioLoadingBar: {
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  audioLoadingIndicator: {
    height: '100%',
    width: '100%',
    backgroundColor: theme.colors.secondary,
    borderRadius: 3,
    opacity: 0.8,
  },
  audioLoadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Video Loading with beautiful animation
  videoLoadingContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  videoLoadingIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    ...theme.shadows.md,
  },
  videoLoadingBar: {
    width: 200,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  videoLoadingIndicator: {
    height: '100%',
    width: '70%',
    backgroundColor: theme.colors.secondary,
    borderRadius: 4,
  },
  
  // Control Section
  controlSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.pill,
    ...theme.shadows.md,
  },
  stopButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  stopButtonText: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
  
  // Video Modal - Enhanced
  videoModalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  videoModalContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  videoCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  videoHeaderInfo: {
    flex: 1,
  },
  videoHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: theme.typography.fontFamily.bold,
  },
  videoHeaderDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    fontFamily: theme.typography.fontFamily.regular,
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  videoPlayer: {
    width: '100%',
    height: Math.min(height * 0.4, 300),
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.lg,
  },
  videoInfoContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  videoInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  videoInfoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  videoInfoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  videoInstructions: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Disabled states for loading
  audioItemDisabled: {
    opacity: 0.6,
  },
  audioIconDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.border,
  },
  audioPlayButtonDisabled: {
    opacity: 0.5,
    backgroundColor: theme.colors.border,
  },
});
