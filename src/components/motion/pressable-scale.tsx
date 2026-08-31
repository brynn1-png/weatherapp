import { useState, type ReactNode } from 'react';
import { Animated, Pressable, type GestureResponderEvent, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  scaleTo?: number;
};

export function PressableScale({ children, style, contentStyle, scaleTo = 0.97, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const [pressedWithoutMotion, setPressedWithoutMotion] = useState(false);
  const reduceMotion = useReducedMotion();

  function handlePressIn(event: GestureResponderEvent) {
    if (reduceMotion) setPressedWithoutMotion(true);
    else Animated.timing(scale, { toValue: scaleTo, duration: 90, useNativeDriver: true }).start();
    onPressIn?.(event);
  }

  function handlePressOut(event: GestureResponderEvent) {
    if (reduceMotion) setPressedWithoutMotion(false);
    else Animated.timing(scale, { toValue: 1, duration: 140, useNativeDriver: true }).start();
    onPressOut?.(event);
  }

  return (
    <Pressable style={style} onPressIn={handlePressIn} onPressOut={handlePressOut} {...rest}>
      <Animated.View style={[contentStyle, { opacity: pressedWithoutMotion ? 0.72 : 1, transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
