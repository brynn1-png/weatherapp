import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandColors, BrandGradients, BrandTypography } from '@/constants/theme';

const tabIcons: Record<string, string> = {
  index: 'home',
  forecast: 'calendar_month',
  location: 'location_on',
  settings: 'settings',
};

type FloatingDockProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

function DockItem({
  focused,
  label,
  name,
  onLongPress,
  onPress,
}: {
  focused: boolean;
  label: string;
  name: string;
  onLongPress: () => void;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.dockItem, pressed && styles.pressed]}>
      <View style={styles.iconPlate}>
        <SymbolView
          name={{ android: tabIcons[name], web: tabIcons[name] } as never}
          size={23}
          tintColor={focused ? BrandColors.text : BrandColors.iconMuted}
          weight={focused ? 'medium' : 'regular'}
        />
      </View>
      <Text numberOfLines={1} style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

function FloatingDock({ descriptors, navigation, state }: FloatingDockProps) {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const dockFrameWidth = Math.min(screenWidth - 32, 380);
  const routes = state.routes.filter((route) => route.name !== 'kai');
  const kaiFocused = state.routes[state.index]?.name === 'kai';
  const focusedRoute = state.routes[state.index]?.name;
  const focusedDockIndex = routes.findIndex((route) => route.name === focusedRoute);
  const [dockWidth, setDockWidth] = useState(0);
  const indicatorPosition = useSharedValue(0);
  const indicatorOpacity = useSharedValue(kaiFocused ? 0 : 1);
  const kaiProgress = useSharedValue(kaiFocused ? 1 : 0);

  function indicatorTarget(index: number, width: number) {
    const slotWidth = (width - 16 - 62) / 4;
    const centerOffset = index >= 2 ? 62 : 0;
    return 8 + slotWidth * (index + 0.5) + centerOffset - 9;
  }

  function handleDockLayout(event: LayoutChangeEvent) {
    const width = event.nativeEvent.layout.width;
    setDockWidth(width);
    if (focusedDockIndex >= 0) indicatorPosition.value = indicatorTarget(focusedDockIndex, width);
  }

  useEffect(() => {
    kaiProgress.value = withTiming(kaiFocused ? 1 : 0, {
      duration: kaiFocused ? 280 : 190,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      reduceMotion: ReduceMotion.System,
    });
  }, [kaiFocused, kaiProgress]);

  useEffect(() => {
    if (!dockWidth) return;
    indicatorOpacity.value = withTiming(kaiFocused ? 0 : 1, {
      duration: 150,
      reduceMotion: ReduceMotion.System,
    });
    if (focusedDockIndex >= 0) {
      indicatorPosition.value = withTiming(indicatorTarget(focusedDockIndex, dockWidth), {
        duration: 220,
        easing: Easing.bezier(0.2, 0, 0, 1),
        reduceMotion: ReduceMotion.System,
      });
    }
  }, [dockWidth, focusedDockIndex, indicatorOpacity, indicatorPosition, kaiFocused]);

  const indicatorMotion = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ translateX: indicatorPosition.value }],
  }));

  const kaiMotion = useAnimatedStyle(() => ({
    transform: [{ scale: 0.985 + 0.015 * kaiProgress.value }],
  }));

  const renderRoute = (route: (typeof routes)[number]) => {
    const options = descriptors[route.key].options;
    const label = typeof options.title === 'string' ? options.title : route.name;
    const focused = state.routes[state.index]?.key === route.key;

    return (
      <DockItem
        key={route.key}
        name={route.name}
        label={label}
        focused={focused}
        onPress={() => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        }}
        onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
      />
    );
  };

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.dockArea,
        {
          bottom: Math.max(insets.bottom, 10),
          left: (screenWidth - dockFrameWidth) / 2,
          width: dockFrameWidth,
        },
      ]}>
      <LinearGradient
        colors={[...BrandGradients.dock]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        onLayout={handleDockLayout}
        style={styles.dock}>
        <Animated.View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.movingIndicator, indicatorMotion]} />
        {routes.slice(0, 2).map(renderRoute)}
        <View style={styles.centerSpace} />
        {routes.slice(2).map(renderRoute)}
      </LinearGradient>

      <View style={styles.notchShadow} />
      <View pointerEvents="none" style={[styles.centerGlow, kaiFocused && styles.centerGlowActive]} />
      <Animated.View style={[styles.centerButtonWrap, kaiFocused && styles.centerButtonWrapActive, kaiMotion]}>
        <Pressable
          accessibilityRole="tab"
          accessibilityLabel="Ask Kai"
          accessibilityState={{ selected: kaiFocused }}
          onPress={() => navigation.navigate('kai')}
          style={({ pressed }) => [styles.centerButtonPressable, pressed && styles.pressed]}>
          <LinearGradient
            colors={[...BrandGradients.action]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.centerButton, kaiFocused && styles.centerButtonActive]}>
            <View style={styles.centerIconCorrection}>
              <SymbolView
                name={{ android: 'chat', web: 'chat' } as never}
                size={31}
                tintColor={BrandColors.text}
                weight="regular"
              />
            </View>
          </LinearGradient>
        </Pressable>
      </Animated.View>
      <Text pointerEvents="none" numberOfLines={1} style={[styles.centerLabel, kaiFocused && styles.labelActive]}>Kai</Text>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <FloatingDock {...props} />}
      screenOptions={{
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: 180 } },
        headerShown: false,
        sceneStyle: { backgroundColor: BrandColors.canvas },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="forecast" options={{ title: 'Forecast' }} />
      <Tabs.Screen name="location" options={{ title: 'Location' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
      <Tabs.Screen name="kai" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  dockArea: {
    position: 'absolute',
    height: 86,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dock: {
    width: '100%',
    height: 68,
    borderRadius: 30,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFAAFF24',
    elevation: 16,
    shadowColor: '#160E36',
    shadowOpacity: 0.55,
    shadowRadius: 20,
  },
  dockItem: {
    flex: 1,
    minWidth: 52,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  iconPlate: {
    width: 42,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { color: BrandColors.iconMuted, fontFamily: BrandTypography.semibold, fontSize: 11, lineHeight: 15 },
  labelActive: { color: BrandColors.text },
  movingIndicator: { position: 'absolute', left: 0, bottom: 6, width: 18, height: 3, borderRadius: 2, backgroundColor: BrandColors.pinkSoft },
  centerSpace: { width: 62 },
  notchShadow: {
    position: 'absolute',
    top: 0,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#211548',
    elevation: 17,
  },
  centerGlow: {
    position: 'absolute',
    top: -2,
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FF47A32E',
    elevation: 18,
  },
  centerGlowActive: { backgroundColor: '#FF47A34A' },
  centerButtonWrap: { position: 'absolute', top: 4, width: 60, height: 60, borderRadius: 30 },
  centerButtonWrapActive: { elevation: 24, shadowColor: '#FF8AC2', shadowOpacity: 0.72, shadowRadius: 18 },
  centerButtonPressable: { width: 60, height: 60, borderRadius: 30 },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 20,
    shadowColor: '#FF47A3',
    shadowOpacity: 0.62,
    shadowRadius: 15,
  },
  centerButtonActive: { borderWidth: 2, borderColor: BrandColors.text },
  centerLabel: { position: 'absolute', bottom: 3, color: BrandColors.iconMuted, fontFamily: BrandTypography.semibold, fontSize: 11, lineHeight: 15 },
  centerIconCorrection: { transform: [{ translateX: 2 }] },
  pressed: { opacity: 0.72 },
});
