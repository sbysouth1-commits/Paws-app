import React from 'react';
import { View } from 'react-native';
import { CATEGORY_META } from '../theme/colors';

// Round tinted chip with the category's stroke icon (prototype CategoryBadge).
export default function CategoryBadge({ category, size = 34 }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: meta.color + '22',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={size * 0.5} color={meta.color} strokeWidth={2} />
    </View>
  );
}
