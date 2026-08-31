import { useEffect, type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

export function MotionAppear({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: reduceMotion ? 0 : 190, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  }, [progress, reduceMotion]);

  const motion = useAnimatedStyle(() => ({
    opacity: 0.72 + 0.28 * progress.value,
    transform: [{ translateY: 4 * (1 - progress.value) }],
  }));

  return <Animated.View style={[style, motion]}>{children}</Animated.View>;
}
