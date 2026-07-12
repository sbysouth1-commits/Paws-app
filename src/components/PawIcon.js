import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

// Brand paw print: solid rounded pad + 4 toes, drawn with plain Views so we
// don't need an SVG dependency. Matches the prototype's PawIcon.
export default function PawIcon({ size = 32, color = colors.purple }) {
  const toe = size * 0.24;
  const pad = { width: size * 0.62, height: size * 0.5 };
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={[
          styles.abs,
          {
            width: toe,
            height: toe * 1.2,
            borderRadius: toe,
            backgroundColor: color,
            left: size * 0.06,
            top: size * 0.18,
            transform: [{ rotate: '-20deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            width: toe,
            height: toe * 1.25,
            borderRadius: toe,
            backgroundColor: color,
            left: size * 0.28,
            top: size * 0.02,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            width: toe,
            height: toe * 1.25,
            borderRadius: toe,
            backgroundColor: color,
            right: size * 0.28,
            top: size * 0.02,
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            width: toe,
            height: toe * 1.2,
            borderRadius: toe,
            backgroundColor: color,
            right: size * 0.06,
            top: size * 0.18,
            transform: [{ rotate: '20deg' }],
          },
        ]}
      />
      <View
        style={[
          styles.abs,
          {
            width: pad.width,
            height: pad.height,
            backgroundColor: color,
            left: (size - pad.width) / 2,
            bottom: size * 0.04,
            borderTopLeftRadius: pad.width * 0.5,
            borderTopRightRadius: pad.width * 0.5,
            borderBottomLeftRadius: pad.width * 0.42,
            borderBottomRightRadius: pad.width * 0.42,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
});
