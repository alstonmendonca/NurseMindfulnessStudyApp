import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  AppState,
  AppStateStatus,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useKeepAwake } from 'expo-keep-awake';
import { appUsageTracker } from '../utils/appUsageTracker';
import { mediaCache } from '../utils/mediaCache';

type Props = NativeStackScreenProps<MainStackParamList, 'VideoPlayer'>;

const { width } = Dimensions.get('window');

export const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  useKeepAwake();
  
  const { title, thumbnail, videoUrl } = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [resolvedUrl, setResolvedUrl] = useState<string>(videoUrl);
  
  // Resolve URL from cache or use remote URL
  useEffect(() => {
    const resolveUrl = async () => {
      setIsLoading(true);
      const { url } = await mediaCache.getMediaUrl(videoUrl);
      setResolvedUrl(url);
    };
    resolveUrl();
  }, [videoUrl]);
  
  const player = useVideoPlayer(resolvedUrl, (player) => {
    player.loop = false;
    player.play();
  });

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // Reset state when player changes
    setIsLoading(true);

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Event listeners for player state
    const playingSubscription = player.addListener('playingChange', ({ isPlaying }) => {
      setIsPlaying(isPlaying);
      appUsageTracker.setAudioPlaybackState(isPlaying);
    });

    const statusSubscription = player.addListener('statusChange', ({ status, error }) => {
      if (status === 'loading') {
        setIsLoading(true);
      } else if (status === 'readyToPlay') {
        setIsLoading(false);
      } else if (status === 'error') {
        setIsLoading(false);
        console.log('Video player error:', error);
      }
    });

    // Initial sync
    setIsPlaying(player.playing);
    if (player.status === 'readyToPlay') {
        setIsLoading(false);
    }

    return () => {
      playingSubscription.remove();
      statusSubscription.remove();
      try {
        player.pause();
      } catch (e) {
        // Ignore
      }
      // Notify tracker that playback stopped
      appUsageTracker.setAudioPlaybackState(false);
      subscription.remove();
    };
  }, [player]); 

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    appStateRef.current = nextAppState;
    if (nextAppState === 'background' || nextAppState === 'inactive') {
       if (player.playing) {
         player.pause();
       }
    }
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <ImageBackground
      source={{ uri: thumbnail }}
      style={styles.container}
      blurRadius={20}
    >
      <SafeAreaView style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <View style={styles.closeIconContainer}>
              <Ionicons name="close" size={24} color="#000" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Video Container - Replaces Album Art */}
          <View style={styles.videoContainer}>
            <VideoView
              player={player}
              style={styles.video}
              contentFit="contain"
              nativeControls={true}
            />
          </View>

          {/* Title */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity>
              <Ionicons name="videocam-outline" size={28} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="large" color="#FFFFFF" />
              ) : (
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={40} 
                  color="#FFFFFF" 
                />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity>
              <Ionicons name="repeat-outline" size={28} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* More Options */}
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  closeButton: {
    width: 44,
  },
  closeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  videoContainer: {
    marginTop: 40,
    marginBottom: 24,
    width: width - 48,
    height: (width - 48) * (9/16), // 16:9 aspect ratio
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  timer: {
    fontSize: 72,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    marginBottom: 16,
  },
});

