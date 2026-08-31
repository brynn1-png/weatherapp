import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import type { WeatherIconName } from '@/types/weather';

type WeatherIconProps = {
  name: WeatherIconName;
  size?: number;
  color?: string;
  accessibilityLabel?: string;
  ambient?: boolean;
};

const threeDimensionalIcons: Partial<Record<WeatherIconName, ImageSource>> = {
  partly_cloudy_day: require('@/assets/weather/weather-3d-partly-cloudy-v1.png'),
  cloud: require('@/assets/weather/weather-3d-cloudy-v1.png'),
};

const symbolNames: Partial<Record<WeatherIconName, string>> = {
  clear_day: 'sunny',
  clear_night: 'clear_night',
  rainy: 'rainy',
};

export function WeatherIcon({ name, size = 32, color = '#1976F3', accessibilityLabel, ambient = false }: WeatherIconProps) {
  const source = threeDimensionalIcons[name];
  const reduceMotion = useReducedMotion();
  const drift = useSharedValue(0);

  useEffect(() => {
    if (!ambient || reduceMotion) {
      drift.value = 0;
      return;
    }
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
  }, [ambient, drift, reduceMotion]);

  const ambientStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -3 * drift.value }, { translateX: 2 * drift.value }],
  }));

  if (!source) {
    return (
      <SymbolView
        name={{ android: symbolNames[name] ?? name, web: symbolNames[name] ?? name } as never}
        size={size}
        tintColor={color}
        weight="regular"
        accessibilityLabel={accessibilityLabel}
      />
    );
  }

  return (
    <Animated.View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[{ width: size, height: size }, ambientStyle]}>
      <Image source={source} style={styles.image} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%' },
});
