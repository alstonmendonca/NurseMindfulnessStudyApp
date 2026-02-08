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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useKeepAwake } from 'expo-keep-awake';
import { appUsageTracker } from '../utils/appUsageTracker';
import { mediaCache } from '../utils/mediaCache';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<MainStackParamList, 'VideoPlayer'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_WIDTH = SCREEN_WIDTH - 32;
const VIDEO_HEIGHT = VIDEO_WIDTH * (9 / 16);

export const VideoPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  useKeepAwake();
  
  const { title, thumbnail, videoUrl } = route.params;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  
  // Download video file first, then set the resolved URL for playback
  useEffect(() => {
    let cancelled = false;
    const downloadAndResolve = async () => {
      setIsLoading(true);
      setIsDownloading(true);
      setDownloadProgress(0);
      setDownloadError(null);
      setResolvedUrl(null);
      
      try {
        const { url } = await mediaCache.getMediaUrl(videoUrl, (progress) => {
          if (!cancelled) {
            setDownloadProgress(progress);
          }
        });
        if (!cancelled) {
          setResolvedUrl(url);
          setIsDownloading(false);
        }
      } catch (error) {
        console.error('Error downloading video:', error);
        if (!cancelled) {
          setDownloadError('Failed to download video. Please check your connection and try again.');
          setIsDownloading(false);
          setIsLoading(false);
        }
      }
    };
    downloadAndResolve();
    return () => { cancelled = true; };
  }, [videoUrl]);
  
  const player = useVideoPlayer(resolvedUrl ?? '', (player) => {
    player.loop = false;
    if (resolvedUrl) {
      player.play();
    }
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
    if (!resolvedUrl) return;
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  return (
    <View style={styles.container}>
      {/* Blurred background */}
      <ImageBackground
        source={{ uri: thumbnail }}
        style={StyleSheet.absoluteFillObject}
        blurRadius={50}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(5,7,38,0.45)', 'rgba(5,7,38,0.82)', 'rgba(5,7,38,0.96)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* \u2500\u2500 Header \u2500\u2500 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close video player"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerLabel} numberOfLines={1}>Video</Text>

          <View style={styles.headerBtn} />
        </View>

        {/* \u2500\u2500 Body \u2500\u2500 */}
        <View style={styles.body}>
          {/* Video container */}
          <View style={styles.videoWrapper}>
            {isDownloading ? (
              <View style={styles.stateCentered}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.stateLabel}>Downloading video\u2026</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.round(downloadProgress * 100)}%` }]} />
                </View>
                <Text style={styles.progressPct}>{Math.round(downloadProgress * 100)}%</Text>
              </View>
            ) : downloadError ? (
              <View style={styles.stateCentered}>
                <Ionicons name="cloud-offline-outline" size={52} color="rgba(255,255,255,0.5)" />
                <Text style={styles.errorText}>{downloadError}</Text>
                <TouchableOpacity
                  style={styles.retryBtn}
                  onPress={() => {
                    setDownloadError(null);
                    setIsDownloading(true);
                    setDownloadProgress(0);
                    setResolvedUrl(null);
                    const url = videoUrl;
                    mediaCache.getMediaUrl(url, (progress) => {
                      setDownloadProgress(progress);
                    }).then(({ url: localUrl }) => {
                      setResolvedUrl(localUrl);
                      setIsDownloading(false);
                    }).catch(() => {
                      setDownloadError('Failed to download video. Please try again.');
                      setIsDownloading(false);
                      setIsLoading(false);
                    });
                  }}
                >
                  <Text style={styles.retryBtnText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : resolvedUrl ? (
              <VideoView
                player={player}
                style={styles.video}
                contentFit="contain"
                nativeControls={true}
              />
            ) : (
              <View style={styles.stateCentered}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.stateLabel}>Preparing\u2026</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          {/* Simple transport */}
          <View style={styles.transport}>
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playBtn}
              disabled={isLoading || isDownloading || !!downloadError}
              accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#fff" />
              ) : (
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={34}
                  color="#fff"
                  style={!isPlaying ? { marginLeft: 3 } : undefined}
                />
              )}
            </TouchableOpacity>
          </View>
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

  // \u2500\u2500 Header \u2500\u2500
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

  // \u2500\u2500 Body \u2500\u2500
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // \u2500\u2500 Video \u2500\u2500
  videoWrapper: {
    width: VIDEO_WIDTH,
    height: VIDEO_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
    marginBottom: 24,
  },
  video: {
    width: '100%',
    height: '100%',
  },

  // \u2500\u2500 Title \u2500\u2500
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 28,
    paddingHorizontal: 16,
  },

  // \u2500\u2500 Transport \u2500\u2500
  transport: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#7C5CE0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C5CE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },

  // \u2500\u2500 States \u2500\u2500
  stateCentered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  stateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    marginTop: 14,
    marginBottom: 16,
  },
  progressBar: {
    width: '70%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C5CE0',
    borderRadius: 2,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 18,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  retryBtn: {
    paddingHorizontal: 26,
    paddingVertical: 11,
    backgroundColor: '#7C5CE0',
    borderRadius: 22,
  },
  retryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});

