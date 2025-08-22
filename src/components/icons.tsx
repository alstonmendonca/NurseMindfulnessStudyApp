import React from 'react';
import Svg, { Path, Rect, Circle, Line } from 'react-native-svg';
import { theme } from '../constants/theme';

type IconProps = {
  size?: number;
  color?: string;
};

export const CalmIcon: React.FC<IconProps> = ({ size = 28, color = theme.colors.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3c.9 2.7 2.8 4.6 5.5 5.5C14.8 9.4 12.9 11.3 12 14 11.1 11.3 9.2 9.4 6.5 8.5 9.2 7.6 11.1 5.7 12 3Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M4 16c2.2 1.5 4.9 2.3 8 2.3S17.8 17.5 20 16"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M6.5 13.5C8 14.4 9.9 15 12 15s4-.6 5.5-1.5"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export const JournalIcon: React.FC<IconProps> = ({ size = 28, color = theme.colors.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="5" y="3.5" width="12" height="17" rx="2" stroke={color} strokeWidth={1.5} />
    <Line x1="8" y1="8" x2="14" y2="8" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="8" y1="11.5" x2="14" y2="11.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Line x1="8" y1="15" x2="12" y2="15" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    <Rect x="3" y="6.5" width="2" height="11" rx="1" fill={color} />
  </Svg>
);

export const WriteIcon: React.FC<IconProps> = ({ size = 24, color = theme.colors.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 17.25V21h3.75L18.81 8.94l-3.75-3.75L3 17.25Z" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
    <Path d="M14.44 5.19l3.75 3.75 1.41-1.41a2.65 2.65 0 0 0 0-3.75 2.65 2.65 0 0 0-3.75 0l-1.41 1.41Z" stroke={color} strokeWidth={1.5}/>
  </Svg>
);

export const TagIcon: React.FC<IconProps> = ({ size = 24, color = theme.colors.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M20.59 13.41 12 22l-9-9 8.59-8.59A2 2 0 0 1 13 4h6v6a2 2 0 0 1-.41 1.41Z" stroke={color} strokeWidth={1.5} strokeLinejoin="round"/>
    <Circle cx="16.5" cy="7.5" r="1.5" fill={color} />
  </Svg>
);

export const PromptIcon: React.FC<IconProps> = ({ size = 24, color = theme.colors.text }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="4" y="3.5" width="16" height="17" rx="2" stroke={color} strokeWidth={1.5} />
    <Path d="M7 8h10M7 11.5h10M7 15h6" stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
  </Svg>
);


