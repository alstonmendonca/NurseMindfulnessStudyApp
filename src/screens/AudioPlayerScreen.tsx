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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
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
  const sound = useRef<Audio.Sound | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    setupAudioMode();
    loadAudio();
    
    // Listen for app state changes to stop audio when app is terminated
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      // Cleanup on unmount
      if (sound.current) {
        sound.current.stopAsync();
        sound.current.unloadAsync();
      }
      // Notify tracker that audio stopped
      appUsageTracker.setAudioPlaybackState(false);
      subscription.remove();
    };
  }, [currentUrl]);

  // Track playback state changes for app usage tracker
  useEffect(() => {
    appUsageTracker.setAudioPlaybackState(isPlaying);
  }, [isPlaying]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // If app is going from background/inactive to terminated (unlikely to catch but worth trying)
    // Or if user clears app from background, the return cleanup will handle stopping audio
    appStateRef.current = nextAppState;
  };

  const setupAudioMode = async () => {
    try {
      // Configure audio mode to allow background playback
      // Note: Audio will stop when app is force-closed/swiped from recent apps
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        interruptionModeIOS: 2, // DuckOthers
        interruptionModeAndroid: 1, // DuckOthers
      });
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  };

  const loadAudio = async () => {
    try {
      // Unload previous sound if exists
      if (sound.current) {
        await sound.current.unloadAsync();
      }
      
      const { sound: audioSound } = await Audio.Sound.createAsync(
        { uri: currentUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      sound.current = audioSound;
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const playNextTrack = () => {
    if (!playlist || activeTrackIndex >= playlist.length - 1) return;
    
    const nextIndex = activeTrackIndex + 1;
    const nextTrack = playlist[nextIndex];
    
    setActiveTrackIndex(nextIndex);
    setCurrentTitle(nextTrack.title);
    setCurrentThumbnail(nextTrack.thumbnail);
    setCurrentUrl(nextTrack.url);
    setCurrentTime(0);
  };

  const playPreviousTrack = () => {
    if (!playlist || activeTrackIndex <= 0) return;
    
    const prevIndex = activeTrackIndex - 1;
    const prevTrack = playlist[prevIndex];
    
    setActiveTrackIndex(prevIndex);
    setCurrentTitle(prevTrack.title);
    setCurrentThumbnail(prevTrack.thumbnail);
    setCurrentUrl(prevTrack.url);
    setCurrentTime(0);
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setTotalDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const togglePlayPause = async () => {
    if (!sound.current) return;
    
    if (isPlaying) {
      await sound.current.pauseAsync();
    } else {
      await sound.current.playAsync();
    }
  };

  const skipBackward = async () => {
    if (!sound.current) return;
    const newPosition = Math.max(0, currentTime - 15) * 1000;
    await sound.current.setPositionAsync(newPosition);
  };

  const skipForward = async () => {
    if (!sound.current) return;
    const newPosition = Math.min(totalDuration, currentTime + 15) * 1000;
    await sound.current.setPositionAsync(newPosition);
  };

  const onSliderValueChange = async (value: number) => {
    if (!sound.current) return;
    const newPosition = value * totalDuration * 1000;
    await sound.current.setPositionAsync(newPosition);
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
          <Text style={styles.timer}>{formatTime(totalDuration - currentTime)}</Text>

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
              value={totalDuration > 0 ? currentTime / totalDuration : 0}
              onSlidingComplete={onSliderValueChange}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
              thumbTintColor="#FFFFFF"
            />
            <View style={styles.timeLabels}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <Text style={styles.timeText}>-{formatTime(totalDuration - currentTime)}</Text>
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
            <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={40} 
                color="#FFFFFF" 
              />
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
