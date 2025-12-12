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
import { useAudioPlayer, AudioSource, setAudioModeAsync } from 'expo-audio';
import Slider from '@react-native-community/slider';
import { appUsageTracker } from '../utils/appUsageTracker';

type Props = NativeStackScreenProps<MainStackParamList, 'AudioPlayer'>;

const { width } = Dimensions.get('window');

export const AudioPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, thumbnail, audioUrl, duration, playlist, currentIndex } = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState(currentIndex || 0);
  const [currentThumbnail, setCurrentThumbnail] = useState(thumbnail);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentUrl, setCurrentUrl] = useState(audioUrl);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const player = useAudioPlayer(currentUrl);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const positionUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Configure audio mode for playback
    const setupAudio = async () => {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionModeAndroid: 'duckOthers',
          shouldRouteThroughEarpiece: false,
        });
      } catch (e) {
        console.log('Error setting audio mode:', e);
      }
    };
    setupAudio();
  }, []);

  useEffect(() => {
    // Reset state when URL changes
    setIsLoading(true);
    setCurrentTime(0);
    setSeekValue(0);
    setIsSeeking(false);
    
    // Start playing automatically
    try {
      player.play();
    } catch (e) {
      console.log('Error playing audio:', e);
    }
    
    // Listen for app state changes to stop audio when app is terminated
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    // Update position every second
    positionUpdateInterval.current = setInterval(() => {
      try {
        if (player.playing && !isSeeking) {
          setCurrentTime(player.currentTime);
        }
        // Update loading state based on buffering
        if (player.isBuffering !== isLoading) {
           // We can use buffering state to show loading, but let's rely on isLoaded mostly
        }
      } catch (e) {
        // Ignore errors accessing player properties
      }
    }, 100);
    
    return () => {
      // Cleanup on unmount
      if (positionUpdateInterval.current) {
        clearInterval(positionUpdateInterval.current);
      }
      try {
        player.pause();
      } catch (e) {
        // Ignore error if player is already released
      }
      // Notify tracker that audio stopped
      appUsageTracker.setAudioPlaybackState(false);
      subscription.remove();
    };
  }, [currentUrl]);

  // Track playback state changes for app usage tracker and update duration
  useEffect(() => {
    setIsPlaying(player.playing);
    appUsageTracker.setAudioPlaybackState(player.playing);
    
    if (player.duration) {
      setTotalDuration(player.duration);
    }
    
    // Update loading state
    if (player.isLoaded && !player.isBuffering) {
      setIsLoading(false);
    } else if (player.isBuffering) {
      setIsLoading(true);
    }
  }, [player.playing, player.duration, player.isLoaded, player.isBuffering]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // If app is going from background/inactive to terminated (unlikely to catch but worth trying)
    // Or if user clears app from background, the return cleanup will handle stopping audio
    appStateRef.current = nextAppState;
  };

  const playNextTrack = async () => {
    if (!playlist || activeTrackIndex >= playlist.length - 1) return;
    
    const nextIndex = activeTrackIndex + 1;
    const nextTrack = playlist[nextIndex];
    
    setActiveTrackIndex(nextIndex);
    setCurrentTitle(nextTrack.title);
    setCurrentThumbnail(nextTrack.thumbnail);
    setCurrentUrl(nextTrack.url);
    setCurrentTime(0);
  };

  const playPreviousTrack = async () => {
    if (!playlist || activeTrackIndex <= 0) return;
    
    const prevIndex = activeTrackIndex - 1;
    const prevTrack = playlist[prevIndex];
    
    setActiveTrackIndex(prevIndex);
    setCurrentTitle(prevTrack.title);
    setCurrentThumbnail(prevTrack.thumbnail);
    setCurrentUrl(prevTrack.url);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(0, player.currentTime - 15);
    player.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(totalDuration, player.currentTime + 15);
    player.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    setSeekValue(totalDuration > 0 ? currentTime / totalDuration : 0);
  };

  const handleSeekChange = (value: number) => {
    if (!isSeeking) {
      setIsSeeking(true);
    }
    setSeekValue(value);
  };

  const handleSeekEnd = (value: number) => {
    const newPosition = value * totalDuration;
    player.seekTo(newPosition);
    setCurrentTime(newPosition);
    setIsSeeking(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ImageBackground
      source={{ uri: currentThumbnail }}
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
          {/* Album Art */}
          <View style={styles.albumArtContainer}>
            <ImageBackground
              source={{ uri: currentThumbnail }}
              style={styles.albumArt}
              imageStyle={styles.albumArtImage}
            />
          </View>

          {/* Timer */}
          <Text style={styles.timer}>{formatTime(totalDuration - (isSeeking ? seekValue * totalDuration : currentTime))}</Text>

          {/* Title */}
          <View style={styles.infoContainer}>
            <Text style={styles.title} numberOfLines={1}>{currentTitle}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={1}
              value={isSeeking ? seekValue : (totalDuration > 0 ? currentTime / totalDuration : 0)}
              onSlidingStart={handleSeekStart}
              onValueChange={handleSeekChange}
              onSlidingComplete={handleSeekEnd}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor="#FFFFFF"
            />
            <View style={styles.timeLabels}>
              <Text style={styles.timeText}>{formatTime(isSeeking ? seekValue * totalDuration : currentTime)}</Text>
              <Text style={styles.timeText}>-{formatTime(totalDuration - (isSeeking ? seekValue * totalDuration : currentTime))}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity>
              <Ionicons name="musical-notes-outline" size={28} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={playPreviousTrack}
              disabled={!playlist || activeTrackIndex <= 0}
              style={{ opacity: (!playlist || activeTrackIndex <= 0) ? 0.3 : 1 }}
            >
              <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
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
            <TouchableOpacity 
              onPress={playNextTrack}
              disabled={!playlist || activeTrackIndex >= (playlist?.length || 0) - 1}
              style={{ opacity: (!playlist || activeTrackIndex >= (playlist?.length || 0) - 1) ? 0.3 : 1 }}
            >
              <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
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
  spacer: {
    flex: 1,
  },
  shareButton: {
    width: 44,
    alignItems: 'flex-end',
  },
  shareIconContainer: {
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
  albumArtContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  albumArt: {
    width: width - 120,
    height: width - 120,
    maxWidth: 320,
    maxHeight: 320,
  },
  albumArtImage: {
    borderRadius: 20,
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
  bookmarkButton: {
    marginBottom: 24,
  },
  moodContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  moodText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  moodSlider: {
    width: '70%',
    height: 40,
  },
});
