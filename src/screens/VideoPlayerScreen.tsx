import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MainStackParamList } from '../navigation/types';
import { theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { VideoView, useVideoPlayer } from 'expo-video';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<MainStackParamList, 'VideoPlayer'>;

const { width, height } = Dimensions.get('window');

export const VideoPlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { title, videoUrl, duration } = route.params;
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.play();
  });
  
  const [showControls, setShowControls] = useState(true);
  const [isSeeking, setIsSeeking] = useState(false);
  const controlsOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(controlsOpacity, {
      toValue: showControls ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showControls]);

  useEffect(() => {
    if (showControls && player.playing) {
      resetControlsTimeout();
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, player.playing]);

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (player.playing && !isSeeking) {
        setShowControls(false);
      }
    }, 3000);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    if (!showControls) {
      resetControlsTimeout();
    }
  };

  const togglePlayPause = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
    resetControlsTimeout();
  };

  const seekForward = () => {
    if (player.duration) {
      player.currentTime = Math.min(player.currentTime + 10, player.duration);
    }
    resetControlsTimeout();
  };

  const seekBackward = () => {
    player.currentTime = Math.max(player.currentTime - 10, 0);
    resetControlsTimeout();
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
  };

  const handleSeekComplete = (value: number) => {
    setIsSeeking(false);
    if (player.duration) {
      player.currentTime = value * player.duration;
    }
    resetControlsTimeout();
  };

  const handleSeekChange = (value: number) => {
    if (player.duration) {
      player.currentTime = value * player.duration;
    }
  };

  const changePlaybackSpeed = () => {
    const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(player.playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    player.playbackRate = nextSpeed;
    resetControlsTimeout();
  };

  const handleVolumeChange = (value: number) => {
    player.volume = value;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = player.currentTime || 0;
  const totalDuration = player.duration || 0;
  const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={toggleControls}>
        <View style={styles.videoContainer}>
          <VideoView
            player={player}
            style={styles.video}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
            contentFit="contain"
          />

          {/* Animated Controls Overlay */}
          <Animated.View 
            style={[
              styles.controlsOverlay,
              { opacity: controlsOpacity }
            ]}
            pointerEvents={showControls ? 'auto' : 'none'}
          >
            {/* Top Gradient with Header */}
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.topGradient}
            >
              <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <View style={styles.iconButton}>
                      <Ionicons name="arrow-back" size={24} color="#fff" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
                    <Text style={styles.headerSubtitle}>{duration}</Text>
                  </View>
                  <View style={{ width: 48 }} />
                </View>
              </SafeAreaView>
            </LinearGradient>

            {/* Center Play/Pause Button */}
            <View style={styles.centerControls}>
              <TouchableOpacity 
                style={styles.seekButton} 
                onPress={seekBackward}
                activeOpacity={0.7}
              >
                <View style={styles.seekButtonInner}>
                  <Ionicons name="play-back" size={32} color="#fff" />
                </View>
                <Text style={styles.seekText}>10</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.playButtonLarge} 
                onPress={togglePlayPause}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#6366f1', '#8b5cf6']}
                  style={styles.playButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons 
                    name={player.playing ? 'pause' : 'play'} 
                    size={40} 
                    color="#fff" 
                    style={player.playing ? {} : { marginLeft: 4 }}
                  />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.seekButton} 
                onPress={seekForward}
                activeOpacity={0.7}
              >
                <View style={styles.seekButtonInner}>
                  <Ionicons name="play-forward" size={32} color="#fff" />
                </View>
                <Text style={styles.seekText}>10</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Gradient with Controls */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.bottomGradient}
            >
              <SafeAreaView edges={['bottom']} style={styles.safeArea}>
                <View style={styles.bottomControls}>
                  {/* Progress Bar */}
                  <View style={styles.progressSection}>
                    <Slider
                      style={styles.slider}
                      minimumValue={0}
                      maximumValue={1}
                      value={progress}
                      onValueChange={handleSeekChange}
                      onSlidingStart={handleSeekStart}
                      onSlidingComplete={handleSeekComplete}
                      minimumTrackTintColor="#6366f1"
                      maximumTrackTintColor="rgba(255,255,255,0.2)"
                      thumbTintColor="#fff"
                    />
                    <View style={styles.timeContainer}>
                      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                      <Text style={styles.timeSeparator}>/</Text>
                      <Text style={styles.timeText}>{formatTime(totalDuration)}</Text>
                    </View>
                  </View>

                  {/* Control Row */}
                  <View style={styles.controlRow}>
                    {/* Volume Control */}
                    <View style={styles.volumeSection}>
                      <TouchableOpacity 
                        style={styles.volumeButton}
                        onPress={() => handleVolumeChange(player.volume === 0 ? 1 : 0)}
                      >
                        <Ionicons 
                          name={player.volume === 0 ? "volume-mute" : player.volume < 0.5 ? "volume-low" : "volume-high"} 
                          size={22} 
                          color="#fff" 
                        />
                      </TouchableOpacity>
                      <Slider
                        style={styles.volumeSlider}
                        minimumValue={0}
                        maximumValue={1}
                        value={player.volume}
                        onValueChange={handleVolumeChange}
                        minimumTrackTintColor="#fff"
                        maximumTrackTintColor="rgba(255,255,255,0.2)"
                        thumbTintColor="#fff"
                      />
                    </View>

                    {/* Speed Control */}
                    <TouchableOpacity 
                      style={styles.speedButton} 
                      onPress={changePlaybackSpeed}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="speedometer-outline" size={18} color="#fff" />
                      <Text style={styles.speedText}>{player.playbackRate}x</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    width: '100%',
  },
  
  // Loading & Buffering
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    fontFamily: theme.typography.fontFamily.medium,
  },
  bufferingIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  
  // Controls Overlay
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  
  // Top Section
  topGradient: {
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: theme.typography.fontFamily.regular,
  },
  
  // Center Controls
  centerControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 60,
  },
  seekButton: {
    alignItems: 'center',
    gap: 6,
  },
  seekButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  seekText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
  },
  playButtonLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Bottom Section
  bottomGradient: {
    paddingBottom: 8,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  progressSection: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: theme.typography.fontFamily.medium,
    letterSpacing: 0.5,
  },
  timeSeparator: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '400',
  },
  
  // Control Row
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  volumeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 200,
    gap: 12,
  },
  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  speedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  speedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: theme.typography.fontFamily.bold,
  },
});
