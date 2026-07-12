import React from 'react';
import Svg, { Ellipse } from 'react-native-svg';
import { colors } from '../theme/colors';

// Brand paw print — same geometry as the prototype's PawIcon SVG.
export default function PawIcon({ size = 20, color = colors.ink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Ellipse cx="12" cy="16" rx="5.6" ry="5.2" />
      <Ellipse cx="4.8" cy="9.6" rx="2.1" ry="2.6" transform="rotate(-20 4.8 9.6)" />
      <Ellipse cx="8.8" cy="5.6" rx="2.2" ry="2.9" transform="rotate(-8 8.8 5.6)" />
      <Ellipse cx="15.2" cy="5.6" rx="2.2" ry="2.9" transform="rotate(8 15.2 5.6)" />
      <Ellipse cx="19.2" cy="9.6" rx="2.1" ry="2.6" transform="rotate(20 19.2 9.6)" />
    </Svg>
  );
}
