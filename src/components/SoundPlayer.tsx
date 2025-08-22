import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

interface SoundPlayerProps {
  soundName: string;
  soundSource: string;
  isPlaying: boolean;
  disabled?: boolean;
  onToggle: (soundName: string) => void;
}

export const SoundPlayer: React.FC<SoundPlayerProps> = ({
  soundName,
  soundSource,
  isPlaying,
  disabled = false,
  onToggle,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container, 
        isPlaying && styles.playing,
        disabled && styles.disabled
      ]}
      onPress={() => !disabled && onToggle(soundName)}
      disabled={disabled}
    >
      <Text style={[
        styles.text, 
        isPlaying && styles.playingText,
        disabled && styles.disabledText
      ]}>
        {soundName}
        {disabled && ' (Coming Soon)'}
      </Text>
      <View style={[
        styles.indicator, 
        isPlaying && styles.playingIndicator,
        disabled && styles.disabledIndicator
      ]} />
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
  disabled: {
    backgroundColor: '#E5E5E5',
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  playingText: {
    color: '#fff',
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
    fontStyle: 'italic',
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
  disabledIndicator: {
    backgroundColor: '#999',
    opacity: 0.5,
  },
});
