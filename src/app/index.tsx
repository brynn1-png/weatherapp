/*
 * DIRECTION: Neon storm — the supplied reference rebuilt for Android, with Kai
 * replacing the generic profile character and factual sample weather kept legible.
 */
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';

import { PressableScale } from '@/components/motion/pressable-scale';
import { NetworkErrorState } from '@/components/weather/network-error-state';
import { WeatherIcon } from '@/components/weather/weather-icon';
import { AppScreen } from '@/components/app-screen';
import { BrandColors, BrandGradients } from '@/constants/theme';
import { getKaiPortrait, getKaiThoughtMood, type KaiPortraitMood } from '@/data/kai-weather';
import { useAppPreferences } from '@/hooks/use-app-preferences';
import { useWeather } from '@/hooks/use-weather';
import { askKai } from '@/services/kai/kai-service';
import { formatTemperature, temperatureUnitLabel } from '@/services/preferences/app-preferences';

const C = {
  bg: BrandColors.canvas,
  surface: BrandColors.surface,
  surface2: BrandColors.surfaceRaised,
  text: BrandColors.text,
  muted: BrandColors.textMuted,
  pink: BrandColors.pink,
  violet: BrandColors.violet,
  orange: BrandColors.orange,
  blue: BrandColors.iconMuted,
};

function Icon({ name, size = 24, color = C.text }: { name: string; size?: number; color?: string }) {
  return <SymbolView name={{ android: name, web: name } as never} size={size} tintColor={color} weight="regular" />;
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const preferences = useAppPreferences();
  const [isKaiBubbleVisible, setIsKaiBubbleVisible] = useState(false);
  const [kaiAdvice, setKaiAdvice] = useState('');
  const [kaiBubbleKind, setKaiBubbleKind] = useState<'advice' | 'chat'>('advice');
  const [kaiBubbleCycle, setKaiBubbleCycle] = useState(0);
  const [isKaiThinking, setIsKaiThinking] = useState(false);
  const reduceMotion = useReducedMotion();
  const requestedKaiAdviceKey = useRef('');
  const kaiPresentationVersion = useRef(0);
  const [kaiBubbleOpacity] = useState(() => new Animated.Value(0));
  const [kaiPortraitProgress] = useState(() => new Animated.Value(1));
  const [displayedKaiMood, setDisplayedKaiMood] = useState<KaiPortraitMood>('neutral');
  const displayedKaiMoodRef = useRef<KaiPortraitMood>('neutral');
  const { data, error, isLoading, isRefreshing, isStale, permissionDenied, refresh } = useWeather();
  const current = data?.current;
  const today = data?.daily[0];
  const hourlyItems = data?.hourly ?? [];
  const currentCondition = current?.icon ?? 'partly_cloudy_day';
  const kaiPortraitMood = isKaiThinking
    ? 'thinking'
    : isKaiBubbleVisible
      ? kaiBubbleKind === 'chat' ? 'happy' : getKaiThoughtMood(currentCondition)
      : 'neutral';
  const kaiForCurrentWeather = getKaiPortrait(displayedKaiMood);
  const kaiAdviceWeatherKey = data
    ? `${data.location.latitude}:${data.location.longitude}:${current?.observedAt ?? current?.temperature}`
    : '';
  const displayDate = current?.observedAt
    ? new Date(current.observedAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
    : 'Updating current weather';
  const statusMessage = error
    ? isStale ? 'Unable to refresh. Showing the last saved forecast.' : 'Unable to load weather. Check your connection and try again.'
    : permissionDenied ? 'Location access is off. Showing live weather for Santa Cruz.' : null;

  useEffect(() => {
    if (displayedKaiMoodRef.current === kaiPortraitMood) return;
    kaiPortraitProgress.stopAnimation();

    if (reduceMotion) {
      kaiPortraitProgress.setValue(1);
      const frame = requestAnimationFrame(() => {
        displayedKaiMoodRef.current = kaiPortraitMood;
        setDisplayedKaiMood(kaiPortraitMood);
      });
      return () => { cancelAnimationFrame(frame); };
    }

    Animated.timing(kaiPortraitProgress, {
      toValue: 0,
      duration: 90,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      displayedKaiMoodRef.current = kaiPortraitMood;
      setDisplayedKaiMood(kaiPortraitMood);
      Animated.timing(kaiPortraitProgress, {
        toValue: 1,
        duration: 170,
        useNativeDriver: true,
      }).start();
    });

    return () => { kaiPortraitProgress.stopAnimation(); };
  }, [kaiPortraitMood, kaiPortraitProgress, reduceMotion]);

  useEffect(() => {
    if (!isKaiBubbleVisible) return;
    kaiBubbleOpacity.stopAnimation();
    if (reduceMotion) {
      kaiBubbleOpacity.setValue(1);
      return;
    }
    kaiBubbleOpacity.setValue(0);
    Animated.timing(kaiBubbleOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    return () => { kaiBubbleOpacity.stopAnimation(); };
  }, [isKaiBubbleVisible, kaiBubbleCycle, kaiBubbleOpacity, reduceMotion]);

  useEffect(() => {
    if (!isKaiBubbleVisible) return;
    const fadeTimer = setTimeout(() => {
      if (reduceMotion) {
        setIsKaiBubbleVisible(false);
        return;
      }
      Animated.timing(kaiBubbleOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setIsKaiBubbleVisible(false);
      });
    }, 5000);
    return () => {
      clearTimeout(fadeTimer);
      kaiBubbleOpacity.stopAnimation();
    };
  }, [isKaiBubbleVisible, kaiBubbleCycle, kaiBubbleOpacity, reduceMotion]);

  function showKaiBubble(message: string, kind: 'advice' | 'chat' = 'advice') {
    setKaiAdvice(message);
    setKaiBubbleKind(kind);
    setIsKaiBubbleVisible(true);
    setKaiBubbleCycle((cycle) => cycle + 1);
  }

  useEffect(() => {
    if (!data || !kaiAdviceWeatherKey || requestedKaiAdviceKey.current === kaiAdviceWeatherKey) return;

    requestedKaiAdviceKey.current = kaiAdviceWeatherKey;
    const presentationVersion = kaiPresentationVersion.current;
    setIsKaiThinking(true);

    void askKai('What is the weather today, and what is your advice?', data.location, [], preferences.userName, 'bubble')
      .then((answer) => {
        if (requestedKaiAdviceKey.current !== kaiAdviceWeatherKey || kaiPresentationVersion.current !== presentationVersion) return;
        showKaiBubble(answer);
      })
      .catch(() => {
        // Home remains quiet when Kai is unavailable; full error recovery lives in chat.
      })
      .finally(() => {
        if (requestedKaiAdviceKey.current === kaiAdviceWeatherKey) setIsKaiThinking(false);
      });
  }, [data, kaiAdviceWeatherKey, preferences.userName]);

  if (error && !data && !isLoading) {
    return (
      <AppScreen style={styles.screen}>
        <LinearGradient colors={[...BrandGradients.page]} style={StyleSheet.absoluteFill} />
        <NetworkErrorState isRetrying={isRefreshing} onRetry={refresh} />
      </AppScreen>
    );
  }

  return (
    <AppScreen style={styles.screen}>
      <LinearGradient colors={[...BrandGradients.page]} style={StyleSheet.absoluteFill} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <PressableScale accessibilityRole="button" accessibilityLabel="Search locations" onPress={() => router.push('/location')} style={styles.search} contentStyle={styles.searchContent}>
              <Icon name="search" size={22} color={C.muted} />
              <Text style={styles.searchText}>Search a city</Text>
            </PressableScale>
          </View>

          {statusMessage && (error ? (
            <PressableScale accessibilityRole="button" accessibilityLabel="Retry loading weather" onPress={refresh} style={styles.statusBanner}>
              <Icon name={error ? 'cloud_off' : 'location_off'} size={20} color={error ? '#FFB77C' : '#D9C7FF'} />
              <Text style={styles.statusText}>{statusMessage}</Text>
              {error && <Text style={styles.retryText}>Retry</Text>}
            </PressableScale>
          ) : (
            <View accessibilityRole="alert" style={styles.statusBanner}>
              <Icon name="location_off" size={20} color="#D9C7FF" />
              <Text style={styles.statusText}>{statusMessage}</Text>
            </View>
          ))}

          <View style={[styles.hero, compact && styles.heroCompact]}>
            <LinearGradient colors={[...BrandGradients.weatherHero]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
            <View style={styles.heroGlow} />
            <View style={styles.heroHeader}>
              <View>
                <Text numberOfLines={1} style={[styles.city, compact && styles.cityCompact]}>{data?.location.name ?? 'WeatherAI'}</Text>
                <Text style={styles.date}>{displayDate}</Text>
              </View>
              <PressableScale accessibilityRole="button" accessibilityLabel="Refresh weather" onPress={refresh} style={styles.refresh}>
                {isLoading || isRefreshing ? <ActivityIndicator color={C.text} /> : <Icon name="refresh" />}
              </PressableScale>
            </View>

            <View style={styles.heroBody}>
              <View>
                <View style={styles.tempRow}>
                  <Text style={[styles.temperature, compact && styles.temperatureCompact]}>{formatTemperature(current?.temperature, preferences.temperatureUnit)}</Text>
                  <Text style={styles.degree}>°</Text>
                </View>
                <Text style={styles.condition}>{current?.condition ?? 'Loading weather…'}</Text>
                <Text style={styles.highLow}>Max: {formatTemperature(today?.temperatureMax, preferences.temperatureUnit)}°   —   Min: {formatTemperature(today?.temperatureMin, preferences.temperatureUnit)}° · {temperatureUnitLabel(preferences.temperatureUnit)}</Text>
              </View>
              <View style={[styles.weatherOrb, compact && styles.weatherOrbCompact]}>
                <View style={styles.heroIconGlow} />
                <WeatherIcon ambient name={currentCondition} size={compact ? 132 : 174} accessibilityLabel={current?.condition ?? 'Weather condition loading'} />
              </View>
            </View>
          </View>

          <View style={styles.pressureCard}>
            <Icon name="water_drop" size={34} color={C.blue} />
            <View>
              <Text style={styles.metricLabel}>Humidity</Text>
              <Text style={styles.metricValue}>{current?.humidity ?? '--'}%</Text>
            </View>
            <View style={styles.metricRule} />
            <View>
              <Text style={styles.metricLabel}>Wind</Text>
              <Text style={styles.metricValue}>{current?.windSpeed ?? '--'} km/h</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today’s outlook</Text>
              <PressableScale accessibilityRole="button" accessibilityLabel="Open full forecast" onPress={() => router.push('/forecast')} style={styles.forecastLink} contentStyle={styles.forecastLinkContent}>
              <Text style={styles.forecastLinkText}>View forecast</Text>
              <Icon name="arrow_forward" size={18} color="#BFAAFF" />
            </PressableScale>
          </View>

          {hourlyItems.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourList}>
            {hourlyItems.slice(0, 8).map((hour, index) => (
              <LinearGradient
                key={hour.time}
                colors={index === 0 ? [...BrandGradients.cardActive] : [...BrandGradients.card]}
                style={[styles.hourCard, index === 0 && styles.hourCardActive]}>
                <View style={styles.hourCardHeader}>
                  <Text style={styles.hourTime}>{index === 0 ? 'Now' : hour.time}</Text>
                  {index === 0 && <View style={styles.currentBadge}><View style={styles.nowDot} /><Text style={styles.currentBadgeText}>Current</Text></View>}
                </View>
                <View style={styles.hourCardTop}>
                  <View style={styles.hourIconWrap}>
                    <View style={[styles.iconGlow, { backgroundColor: hour.icon === 'rainy' ? '#26A9FF33' : '#FFD85B2B' }]} />
                    <WeatherIcon name={hour.icon} size={76} accessibilityLabel={hour.icon.replaceAll('_', ' ')} />
                  </View>
                  <View style={styles.hourReading}>
                    <Text style={styles.hourTemp}>{formatTemperature(hour.temperature, preferences.temperatureUnit)}°</Text>
                  </View>
                </View>
                <View style={styles.hourCardBottom}>
                  <Text numberOfLines={1} style={styles.hourCondition}>{hour.condition ?? (index === 0 ? 'Current conditions' : 'Upcoming')}</Text>
                  <View style={styles.hourRainRow}>
                    <Icon name="water_drop" size={15} color="#77D8FF" />
                    <Text style={styles.hourRain}>{hour.precipitationProbability}%</Text>
                  </View>
                </View>
              </LinearGradient>
            ))}
          </ScrollView> : (
            <View accessibilityRole="alert" style={styles.hourlyEmpty}>
              {isLoading ? <ActivityIndicator color={BrandColors.rain} /> : <Icon name="cloud_off" size={24} color={C.muted} />}
              <View style={styles.hourlyEmptyCopy}>
                <Text style={styles.hourlyEmptyTitle}>{isLoading ? 'Loading today’s forecast' : 'Hourly forecast unavailable'}</Text>
                <Text style={styles.hourlyEmptyText}>{isLoading ? 'WeatherAI is getting factual provider data.' : 'Try refreshing when your connection improves.'}</Text>
              </View>
            </View>
          )}

        </SafeAreaView>
      </ScrollView>
      <View pointerEvents="box-none" style={styles.kaiFloat}>
        {(isKaiThinking || isKaiBubbleVisible) && (
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="Open Ask Kai"
            onPress={() => router.push('/kai')}
            scaleTo={0.98}
            style={[styles.kaiBubbleButton, kaiBubbleKind === 'chat' && styles.kaiChatBubbleButton]}>
            <Animated.View accessibilityLiveRegion="polite" style={[styles.kaiBubble, kaiBubbleKind === 'chat' && styles.kaiChatBubble, { opacity: kaiBubbleOpacity }]}>
              <View style={[styles.kaiBubbleTail, kaiBubbleKind === 'chat' && styles.kaiChatBubbleTail]} />
              <Text numberOfLines={kaiBubbleKind === 'chat' ? 1 : 4} style={[styles.kaiAdviceText, kaiBubbleKind === 'chat' && styles.kaiChatText]}>{isKaiThinking ? 'Reading the latest forecast…' : kaiAdvice}</Text>
              {kaiBubbleKind === 'chat' && <View style={styles.kaiChatArrow}><Icon name="arrow_forward" size={16} color={C.text} /></View>}
            </Animated.View>
          </PressableScale>
        )}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Ask Kai to show the chat invitation"
          onPress={() => {
            kaiPresentationVersion.current += 1;
            setIsKaiThinking(false);
            showKaiBubble('Chat with me', 'chat');
          }}
          scaleTo={0.94}
          style={styles.kaiCharacterButton}>
          <Animated.View style={{ opacity: kaiPortraitProgress.interpolate({ inputRange: [0, 1], outputRange: [0.58, 1] }), transform: [{ scale: kaiPortraitProgress.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }] }}>
            <Image source={kaiForCurrentWeather} style={styles.kaiFloating} contentFit="cover" contentPosition="top" accessibilityLabel={`Kai looks ${displayedKaiMood}`} />
          </Animated.View>
        </PressableScale>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 18, paddingBottom: 112 },
  topBar: { height: 76, flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { flex: 1, height: 52, borderRadius: 26, backgroundColor: '#120C17CC', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 10 },
  searchContent: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchText: { color: C.muted, fontFamily: 'Poppins_400Regular', fontSize: 16 },
  statusBanner: { minHeight: 52, marginBottom: 12, paddingHorizontal: 14, borderRadius: 18, backgroundColor: '#241C35', flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#FFFFFF18' },
  statusText: { flex: 1, color: '#DED6EA', fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 17 },
  retryText: { color: '#FF8BC6', fontFamily: 'Poppins_700Bold', fontSize: 12 },
  hero: { minHeight: 350, borderRadius: 30, overflow: 'hidden', padding: 24, elevation: 12, shadowColor: C.pink, shadowOpacity: 0.32, shadowRadius: 22 },
  heroCompact: { minHeight: 330, paddingHorizontal: 18 },
  heroGlow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: '#FFB35D66', right: -70, bottom: -40 },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  city: { color: C.text, fontFamily: 'Poppins_800ExtraBold', fontSize: 38, lineHeight: 46, letterSpacing: -1 },
  cityCompact: { maxWidth: 210, fontSize: 31, lineHeight: 39 },
  date: { color: '#FFD0DF', fontFamily: 'Poppins_600SemiBold', fontSize: 14, marginTop: 3 },
  refresh: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFFFF22', alignItems: 'center', justifyContent: 'center' },
  heroBody: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  tempRow: { flexDirection: 'row', alignItems: 'flex-start' },
  temperature: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 96, lineHeight: 108, letterSpacing: -4, fontVariant: ['tabular-nums'] },
  temperatureCompact: { fontSize: 76, lineHeight: 90 },
  degree: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 42, lineHeight: 58 },
  condition: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 18 },
  highLow: { color: '#FFE7EF', fontFamily: 'Poppins_600SemiBold', fontSize: 13, marginTop: 10 },
  weatherOrb: { flex: 1, minWidth: 130, height: 190, alignItems: 'center', justifyContent: 'center' },
  weatherOrbCompact: { minWidth: 100 },
  heroIconGlow: { position: 'absolute', width: 148, height: 148, borderRadius: 74, backgroundColor: '#FFD15838' },
  pressureCard: { marginTop: -30, marginLeft: 14, width: '72%', minHeight: 90, borderRadius: 24, backgroundColor: '#17101EEB', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, gap: 12, elevation: 14 },
  metricLabel: { color: C.muted, fontFamily: 'Poppins_600SemiBold', fontSize: 12 },
  metricValue: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 16, marginTop: 2 },
  metricRule: { width: 1, height: 38, backgroundColor: '#FFFFFF22', marginHorizontal: 2 },
  sectionHeader: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#FFFFFF19' },
  sectionTitle: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 20 },
  forecastLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 5, paddingLeft: 12 },
  forecastLinkContent: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  forecastLinkText: { color: '#BFAAFF', fontFamily: 'Poppins_600SemiBold', fontSize: 13 },
  hourList: { gap: 12, paddingVertical: 22, paddingRight: 18 },
  hourCard: { width: 204, minHeight: 158, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 13, borderWidth: 1, borderColor: '#FFFFFF20', elevation: 4 },
  hourCardActive: { borderColor: '#D58BFF88', elevation: 9, shadowColor: '#B337F2', shadowOpacity: 0.4, shadowRadius: 12 },
  hourCardHeader: { minHeight: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  currentBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  currentBadgeText: { color: '#F4DDFC', fontFamily: 'Poppins_600SemiBold', fontSize: 10 },
  hourCardTop: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  hourReading: { flex: 1, alignItems: 'flex-end' },
  hourTime: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 15, fontVariant: ['tabular-nums'] },
  nowDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4C99' },
  hourTemp: { color: C.text, fontFamily: 'Poppins_600SemiBold', fontSize: 38, lineHeight: 46, fontVariant: ['tabular-nums'] },
  hourIconWrap: { width: 92, height: 82, alignItems: 'center', justifyContent: 'center' },
  iconGlow: { position: 'absolute', width: 76, height: 76, borderRadius: 38 },
  hourCardBottom: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hourCondition: { flex: 1, marginRight: 8, color: '#DCE4F5', fontFamily: 'Poppins_500Medium', fontSize: 10 },
  hourRainRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  hourRain: { color: '#9BDFFF', fontFamily: 'Poppins_600SemiBold', fontSize: 11 },
  hourlyEmpty: { minHeight: 104, marginVertical: 18, paddingHorizontal: 18, borderRadius: 22, backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderColor: BrandColors.outline },
  hourlyEmptyCopy: { flex: 1 },
  hourlyEmptyTitle: { color: C.text, fontFamily: 'Poppins_700Bold', fontSize: 14 },
  hourlyEmptyText: { color: C.muted, fontFamily: 'Poppins_400Regular', fontSize: 12, lineHeight: 18, marginTop: 3 },
  kaiFloat: { position: 'absolute', left: 8, bottom: 102, width: 290, height: 204, zIndex: 20 },
  kaiCharacterButton: { position: 'absolute', left: 0, bottom: 0, width: 112, height: 120, zIndex: 2 },
  kaiFloating: { width: 112, height: 120, zIndex: 1 },
  kaiBubbleButton: { position: 'absolute', left: 88, bottom: 110, width: 202, minHeight: 84 },
  kaiBubble: { minHeight: 84, borderTopLeftRadius: 30, borderTopRightRadius: 27, borderBottomRightRadius: 28, borderBottomLeftRadius: 16, paddingVertical: 14, paddingLeft: 28, paddingRight: 14, backgroundColor: '#2A1D3CEE', elevation: 10, shadowColor: '#120A21', shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.34, shadowRadius: 14 },
  kaiBubbleTail: { position: 'absolute', left: 5, bottom: -13, width: 0, height: 0, borderTopWidth: 19, borderRightWidth: 17, borderTopColor: '#2A1D3C', borderRightColor: 'transparent' },
  kaiAdviceText: { color: C.text, fontFamily: 'Poppins_600SemiBold', fontSize: 11, lineHeight: 16 },
  kaiChatBubbleButton: { bottom: 102, width: 170, minHeight: 56 },
  kaiChatBubble: { minHeight: 56, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomRightRadius: 20, borderBottomLeftRadius: 12, paddingVertical: 8, paddingLeft: 18, paddingRight: 8, backgroundColor: BrandColors.dockPurpleDeep, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  kaiChatBubbleTail: { bottom: -10, borderTopWidth: 15, borderRightWidth: 13, borderTopColor: BrandColors.dockPurpleDeep },
  kaiChatText: { flex: 1, fontFamily: 'Poppins_700Bold', fontSize: 13, lineHeight: 18 },
  kaiChatArrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: BrandColors.pink },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.48 },
});
