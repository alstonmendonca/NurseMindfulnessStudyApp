import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Icon names and their sources
const icons = [
  { name: 'meditation', source: MaterialCommunityIcons },
  { name: 'yoga', source: MaterialCommunityIcons },
  { name: 'heart', source: Ionicons },
  { name: 'flower', source: MaterialCommunityIcons },
  { name: 'spa', source: FontAwesome5 },
  { name: 'weather-sunny', source: MaterialCommunityIcons },
  { name: 'leaf', source: MaterialCommunityIcons },
  { name: 'water', source: Ionicons },
  { name: 'butterfly', source: MaterialCommunityIcons },
  { name: 'moon-waning-crescent', source: MaterialCommunityIcons },
  { name: 'self-improvement', source: MaterialIcons },
  { name: 'star-four-points', source: MaterialCommunityIcons },
  { name: 'wind', source: Feather },
  { name: 'peace', source: MaterialCommunityIcons },
  { name: 'cloud', source: MaterialCommunityIcons },
  { name: 'circle-outline', source: MaterialCommunityIcons },
  { name: 'hexagon-outline', source: MaterialCommunityIcons },
  { name: 'triangle-outline', source: MaterialCommunityIcons },
  { name: 'musical-notes', source: Ionicons },
  { name: 'infinity', source: MaterialCommunityIcons },
];

// Generate 500 doodles with varied positions, sizes, rotations, and opacities
const generateDoodles = () => {
  const doodles = [];
  const numDoodles = 500;
  
  for (let i = 0; i < numDoodles; i++) {
    const icon = icons[i % icons.length];
    const IconComponent = icon.source;
    
    // Randomize position across entire screen with better distribution
    const top = (i * 37) % (height + 400) - 100; // Distribute vertically
    const left = ((i * 67) % (width - 60)) + 10; // Distribute horizontally with margin
    
    // Vary size between 16 and 32
    const size = 16 + ((i * 7) % 17);
    
    // Vary rotation
    const rotation = ((i * 43) % 360) - 180;
    
    // Vary opacity slightly
    const opacity = 0.025 + ((i % 15) * 0.002);
    
    doodles.push(
      <View 
        key={i} 
        style={[
          styles.doodle, 
          { 
            top, 
            left,
            transform: [{ rotate: `${rotation}deg` }]
          }
        ]}
      >
        <IconComponent 
          name={icon.name} 
          size={size} 
          color={`rgba(255, 255, 255, ${opacity})`} 
        />
      </View>
    );
  }
  
  return doodles;
};

export const BackgroundDoodles: React.FC = () => {
  return <>{generateDoodles()}</>;
};

const styles = StyleSheet.create({
  doodle: {
    position: 'absolute',
  },
});
