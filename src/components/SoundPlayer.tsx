import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';

interface SoundPlayerProps {
  soundName: string;
  soundSource: any; // Will be properly typed when we add the audio files
  isPlaying: boolean;
  onToggle: (soundName: string) => void;
}

export const SoundPlayer: React.FC<SoundPlayerProps> = ({
  soundName,
  soundSource,
  isPlaying,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.playing]}
      onPress={() => onToggle(soundName)}
    >
      <Text style={[styles.text, isPlaying && styles.playingText]}>
        {soundName}
      </Text>
      <View style={[styles.indicator, isPlaying && styles.playingIndicator]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginVertical: 5,
  },
  playing: {
    backgroundColor: '#4A90E2',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  playingText: {
    color: '#fff',
    fontWeight: '600',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  playingIndicator: {
    backgroundColor: '#fff',
  },
});
