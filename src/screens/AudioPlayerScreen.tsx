import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import {
  createAudioPlayer,
  AudioPlayer,
  AudioStatus,
  setAudioModeAsync,
} from 'expo-audio';
import Slider from '@react-native-community/slider';
import { appUsageTracker } from '../utils/appUsageTracker';
import { mediaCache } from '../utils/mediaCache';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<MainStackParamList, 'AudioPlayer'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ART_SIZE = Math.min(SCREEN_WIDTH - 80, 340);

export const AudioPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const { title, thumbnail, audioUrl, duration, playlist, currentIndex } = route.params;
  
  const [activeTrackIndex, setActiveTrackIndex] = useState(currentIndex || 0);
  const [currentThumbnail, setCurrentThumbnail] = useState(thumbnail);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [currentUrl, setCurrentUrl] = useState(audioUrl);

  // Download state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Playback UI state - driven by polling the player directly
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Seek state
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Settings
  const [volume, setVolume] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);

  // Refs
  const playerRef = useRef<AudioPlayer | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const isSeekingRef = useRef(false);

  // ── Create player once on mount, release on unmount ──
  useEffect(() => {
    mountedRef.current = true;

    // Configure audio mode
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    }).catch(e => console.log('Audio mode error:', e));

    // Create a player with no source and 100ms update interval
    const player = createAudioPlayer(null, 100);
    playerRef.current = player;

    // Listen for native status updates (this is the EVENT-based approach)
    const subscription = player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (!mountedRef.current) return;
      setIsLoaded(status.isLoaded);
      setIsPlaying(status.playing);
      setIsBuffering(status.isBuffering);
      setTotalDuration(status.duration || 0);
      if (!isSeekingRef.current) {
        setCurrentTime(status.currentTime || 0);
      }
      if (status.didJustFinish) {
        handleTrackFinished();
      }
    });

    return () => {
      mountedRef.current = false;
      stopPolling();
      subscription.remove();
      try {
        player.release();
      } catch (e) {
        console.log('Player release error:', e);
      }
      playerRef.current = null;
      appUsageTracker.setAudioPlaybackState(false);
    };
  }, []);

  // ── Polling as fallback for Android ──
  const startPolling = useCallback(() => {
    stopPolling();
    pollingRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player || !mountedRef.current) return;
      try {
        // Read directly from the player object
        const ct = player.currentTime || 0;
        const dur = player.duration || 0;
        const playing = player.playing || false;
        const loaded = player.isLoaded || false;

        setCurrentTime(prev => {
          // Only update if significantly different (avoid jitter)
          if (Math.abs(prev - ct) > 0.05) return ct;
          // If playing, increment manually for smoothness
          if (playing) return prev + 0.1;
          return prev;
        });
        setTotalDuration(dur);
        setIsPlaying(playing);
        setIsLoaded(loaded);
      } catch (e) {
        // Player may have been released
      }
    }, 100);
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // ── Download and load audio ──
  useEffect(() => {
    let cancelled = false;
    const player = playerRef.current;
    if (!player) return;

    const loadAudio = async () => {
      setIsDownloading(true);
      setDownloadProgress(0);
      setLoadError(null);
      setIsLoaded(false);
      setIsPlaying(false);
      setCurrentTime(0);
      setTotalDuration(0);

      // Stop current playback
      try { player.pause(); } catch (e) { /* ignore */ }

      try {
        const { url } = await mediaCache.getMediaUrl(currentUrl, (progress) => {
          if (!cancelled) setDownloadProgress(progress);
        });

        if (cancelled) return;

        console.log('Audio downloaded:', url);
        setIsDownloading(false);

        // Load the audio into the player
        player.replace({ uri: url });

        // Start polling immediately after replace
        startPolling();

        // Wait a moment for the player to load, then auto-play
        setTimeout(() => {
          if (cancelled || !mountedRef.current) return;
          try {
            player.play();
            setIsPlaying(true);
            appUsageTracker.setAudioPlaybackState(true);
          } catch (e) {
            console.log('Auto-play error:', e);
          }
        }, 300);

      } catch (error) {
        console.error('Error downloading audio:', error);
        if (!cancelled) {
          setLoadError('Failed to download audio. Please check your connection and try again.');
          setIsDownloading(false);
        }
      }
    };

    loadAudio();
    return () => { cancelled = true; };
  }, [currentUrl, startPolling]);

  // ── Track usage ──
  useEffect(() => {
    appUsageTracker.setAudioPlaybackState(isPlaying);
  }, [isPlaying]);

  // ── Volume & Loop ──
  useEffect(() => {
    const player = playerRef.current;
    if (player && isLoaded) {
      player.volume = volume;
      player.loop = isLooping;
    }
  }, [volume, isLooping, isLoaded]);

  // ── Track finished handler ──
  const handleTrackFinished = useCallback(() => {
    const player = playerRef.current;
    if (!player || !mountedRef.current) return;

    setIsPlaying(false);
    appUsageTracker.setAudioPlaybackState(false);

    // expo-audio doesn't auto-reset position
    player.seekTo(0).catch(() => {});
    setCurrentTime(0);

    if (!isLooping && playlist && activeTrackIndex < playlist.length - 1) {
      // Play next track
      const nextIndex = activeTrackIndex + 1;
      const nextTrack = playlist[nextIndex];
      setActiveTrackIndex(nextIndex);
      setCurrentTitle(nextTrack.title);
      setCurrentThumbnail(nextTrack.thumbnail);
      setCurrentUrl(nextTrack.url);
    }
  }, [isLooping, playlist, activeTrackIndex]);

  // ── Controls ──
  const togglePlayPause = () => {
    const player = playerRef.current;
    if (!player || !isLoaded) return;

    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const skipBackward = () => {
    const player = playerRef.current;
    if (!player || !isLoaded) return;
    const newTime = Math.max(0, currentTime - 15);
    setCurrentTime(newTime);
    player.seekTo(newTime).catch(() => {});
  };

  const skipForward = () => {
    const player = playerRef.current;
    if (!player || !isLoaded) return;
    const newTime = Math.min(totalDuration, currentTime + 15);
    setCurrentTime(newTime);
    player.seekTo(newTime).catch(() => {});
  };

  const playNextTrack = () => {
    if (!playlist || activeTrackIndex >= playlist.length - 1) return;
    const nextIndex = activeTrackIndex + 1;
    const nextTrack = playlist[nextIndex];
    setActiveTrackIndex(nextIndex);
    setCurrentTitle(nextTrack.title);
    setCurrentThumbnail(nextTrack.thumbnail);
    setCurrentUrl(nextTrack.url);
  };

  const playPreviousTrack = () => {
    if (!playlist || activeTrackIndex <= 0) return;
    const prevIndex = activeTrackIndex - 1;
    const prevTrack = playlist[prevIndex];
    setActiveTrackIndex(prevIndex);
    setCurrentTitle(prevTrack.title);
    setCurrentThumbnail(prevTrack.thumbnail);
    setCurrentUrl(prevTrack.url);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    isSeekingRef.current = true;
    setSeekValue(totalDuration > 0 ? currentTime / totalDuration : 0);
  };

  const handleSeekChange = (value: number) => {
    setSeekValue(value);
  };

  const handleSeekEnd = (value: number) => {
    const player = playerRef.current;
    if (!player || !isLoaded) {
      setIsSeeking(false);
      return;
    }
    const newPosition = value * totalDuration;
    setCurrentTime(newPosition);
    player.seekTo(newPosition).catch(() => {});
    setIsSeeking(false);
    isSeekingRef.current = false;
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  };

  // ── Helpers ──
  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTime = isSeeking ? seekValue * totalDuration : currentTime;
  const sliderValue = isSeeking ? seekValue : (totalDuration > 0 ? currentTime / totalDuration : 0);
  const showLoading = !isLoaded || isBuffering;
  const hasPrev = playlist && activeTrackIndex > 0;
  const hasNext = playlist && activeTrackIndex < (playlist?.length || 0) - 1;

  return (
    <View style={styles.container}>
      {/* Blurred background artwork */}
      <ImageBackground
        source={{ uri: currentThumbnail }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={50}
        resizeMode="cover"
      />
      {/* Dark gradient overlay for readability */}
      <LinearGradient
        colors={['rgba(5,7,38,0.55)', 'rgba(5,7,38,0.85)', 'rgba(5,7,38,0.95)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              const player = playerRef.current;
              if (player) { try { player.pause(); } catch (e) { /* ignore */ } }
              navigation.goBack();
            }}
            style={styles.headerBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close audio player"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerLabel} numberOfLines={1}>Now Playing</Text>

          <TouchableOpacity
            style={styles.headerBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="More options"
            accessibilityRole="button"
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>
          {/* Download / Error state */}
          {isDownloading ? (
            <View style={styles.centeredState}>
              <View style={styles.artShadow}>
                <ImageBackground
                  source={{ uri: currentThumbnail }}
                  style={styles.albumArt}
                  imageStyle={styles.albumArtImage}
                />
              </View>
              <View style={styles.downloadOverlay}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.downloadLabel}>Downloading...</Text>
                <View style={styles.downloadBar}>
                  <View style={[styles.downloadBarFill, { width: `${Math.round(downloadProgress * 100)}%` }]} />
                </View>
                <Text style={styles.downloadPct}>{Math.round(downloadProgress * 100)}%</Text>
              </View>
            </View>
          ) : loadError ? (
            <View style={styles.centeredState}>
              <Ionicons name="cloud-offline-outline" size={56} color="rgba(255,255,255,0.5)" />
              <Text style={styles.errorText}>{loadError}</Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => { setLoadError(null); setCurrentUrl(audioUrl); }}
              >
                <Text style={styles.retryBtnText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Album art with shadow */}
              <View style={styles.artShadow}>
                <Image
                  source={{ uri: currentThumbnail }}
                  style={styles.albumArt}
                  borderRadius={16}
                />
              </View>

              {/* Track info */}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={2}>{currentTitle}</Text>
                {playlist && playlist.length > 1 && (
                  <Text style={styles.trackSubtitle}>
                    Track {activeTrackIndex + 1} of {playlist.length}
                  </Text>
                )}
              </View>

              {/* Slider + times */}
              <View style={styles.sliderSection}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1}
                  value={sliderValue}
                  onSlidingStart={handleSeekStart}
                  onValueChange={handleSeekChange}
                  onSlidingComplete={handleSeekEnd}
                  minimumTrackTintColor="#7C5CE0"
                  maximumTrackTintColor="rgba(255,255,255,0.18)"
                  thumbTintColor="#fff"
                  accessibilityLabel="Playback position"
                />
                <View style={styles.timeRow}>
                  <Text style={styles.timeText}>{formatTime(displayTime)}</Text>
                  <Text style={styles.timeText}>-{formatTime(totalDuration - displayTime)}</Text>
                </View>
              </View>

              {/* Main transport controls */}
              <View style={styles.transport}>
                <TouchableOpacity
                  onPress={playPreviousTrack}
                  disabled={!hasPrev}
                  style={[styles.transportBtn, !hasPrev && styles.transportBtnDisabled]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Previous track"
                >
                  <Ionicons name="play-skip-back" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={skipBackward}
                  disabled={showLoading}
                  style={[styles.transportBtn, showLoading && styles.transportBtnDisabled]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Rewind 15 seconds"
                >
                  <Ionicons name="play-back" size={26} color="#fff" />
                  <Text style={styles.skipLabel}>15</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={togglePlayPause}
                  style={styles.playBtn}
                  disabled={showLoading || isDownloading || !!loadError}
                  accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                >
                  {showLoading ? (
                    <ActivityIndicator size="large" color="#fff" />
                  ) : (
                    <Ionicons
                      name={isPlaying ? 'pause' : 'play'}
                      size={36}
                      color="#fff"
                      style={!isPlaying ? { marginLeft: 4 } : undefined}
                    />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={skipForward}
                  disabled={showLoading}
                  style={[styles.transportBtn, showLoading && styles.transportBtnDisabled]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Forward 15 seconds"
                >
                  <Ionicons name="play-forward" size={26} color="#fff" />
                  <Text style={styles.skipLabel}>15</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={playNextTrack}
                  disabled={!hasNext}
                  style={[styles.transportBtn, !hasNext && styles.transportBtnDisabled]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel="Next track"
                >
                  <Ionicons name="play-skip-forward" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Secondary controls row */}
              <View style={styles.secondaryRow}>
                <TouchableOpacity
                  onPress={() => setIsLooping(!isLooping)}
                  style={[styles.secondaryBtn, isLooping && styles.secondaryBtnActive]}
                  accessibilityLabel={isLooping ? 'Disable loop' : 'Enable loop'}
                >
                  <Ionicons
                    name="repeat"
                    size={20}
                    color={isLooping ? '#7C5CE0' : 'rgba(255,255,255,0.5)'}
                  />
                </TouchableOpacity>

                {/* Volume */}
                <View style={styles.volumeRow}>
                  <Ionicons
                    name={volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-low' : 'volume-high'}
                    size={18}
                    color="rgba(255,255,255,0.5)"
                  />
                  <Slider
                    style={styles.volumeSlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={volume}
                    onValueChange={handleVolumeChange}
                    minimumTrackTintColor="rgba(255,255,255,0.6)"
                    maximumTrackTintColor="rgba(255,255,255,0.12)"
                    thumbTintColor="#fff"
                    accessibilityLabel="Volume"
                  />
                  <Ionicons name="volume-high" size={18} color="rgba(255,255,255,0.5)" />
                </View>

                <View style={styles.secondaryBtn} />
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050726',
  },
  safeArea: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // ── Body ──
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 24,
  },

  // ── Album Art ──
  artShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    marginBottom: 28,
  },
  albumArt: {
    width: ART_SIZE,
    height: ART_SIZE,
    borderRadius: 16,
  },
  albumArtImage: {
    borderRadius: 16,
  },

  // ── Track Info ──
  trackInfo: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  trackSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
    fontWeight: '500',
  },

  // ── Slider ──
  sliderSection: {
    width: '100%',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.45)',
    fontVariant: ['tabular-nums'],
  },

  // ── Transport ──
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
    marginBottom: 20,
    marginTop: 8,
  },
  transportBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transportBtnDisabled: {
    opacity: 0.25,
  },
  skipLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    marginTop: -2,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#7C5CE0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C5CE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
    marginHorizontal: 8,
  },

  // ── Secondary row ──
  secondaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  secondaryBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnActive: {
    backgroundColor: 'rgba(124,92,224,0.15)',
  },
  volumeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 32,
    marginHorizontal: 6,
  },

  // ── Download / Error states ──
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  downloadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(5,7,38,0.6)',
    borderRadius: 16,
    width: ART_SIZE,
    height: ART_SIZE,
  },
  downloadLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 14,
    marginBottom: 16,
  },
  downloadBar: {
    width: '65%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  downloadBarFill: {
    height: '100%',
    backgroundColor: '#7C5CE0',
    borderRadius: 2,
  },
  downloadPct: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    backgroundColor: '#7C5CE0',
    borderRadius: 24,
  },
  retryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
