import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '@/components/motion/pressable-scale';
import { KaiShortcut } from '@/components/kai/kai-shortcut';
import { NetworkErrorState } from '@/components/weather/network-error-state';
import { WeatherIcon } from '@/components/weather/weather-icon';
import { AppScreen } from '@/components/app-screen';
import { BrandColors, BrandGradients, BrandRadius, BrandTypography, Spacing } from '@/constants/theme';
import { useAppPreferences } from '@/hooks/use-app-preferences';
import { useWeather } from '@/hooks/use-weather';
import { formatTemperature, temperatureUnitLabel } from '@/services/preferences/app-preferences';

function Icon({ name, size = 22, color = BrandColors.text }: { name: string; size?: number; color?: string }) {
  return <SymbolView name={{ android: name, web: name } as never} size={size} tintColor={color} weight="regular" />;
}

export default function ForecastScreen() {
  const preferences = useAppPreferences();
  const { data, error, isLoading, isRefreshing, isStale, refresh } = useWeather();
  const highestRain = data ? Math.max(...data.daily.map((day) => day.precipitationProbability)) : 0;

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
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Forecast</Text>
              <Text style={styles.subtitle}>{data ? `${data.location.name} · Next 7 days` : 'Your weather outlook'}</Text>
            </View>
            <PressableScale accessibilityRole="button" accessibilityLabel="Refresh forecast" onPress={refresh} style={styles.refresh}>
              {isLoading || isRefreshing ? <ActivityIndicator color={BrandColors.text} /> : <Icon name="refresh" />}
            </PressableScale>
          </View>

          {error && <Pressable accessibilityRole="button" onPress={refresh} style={styles.alert}><Icon name="cloud_off" size={20} color="#FFB77C" /><Text style={styles.alertText}>{isStale ? 'Showing the last saved forecast.' : 'Forecast unavailable. Check your connection.'}</Text><Text style={styles.retry}>Retry</Text></Pressable>}

          {isLoading && !data ? <View style={styles.loading}><ActivityIndicator color={BrandColors.pinkSoft} size="large" /><Text style={styles.loadingText}>Reading the sky…</Text></View> : data ? <>
            <View style={styles.summary}>
              <LinearGradient colors={['#51348D', '#222D45']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
              <View style={styles.summaryCopy}><Text style={styles.summaryDay}>Today · {temperatureUnitLabel(preferences.temperatureUnit)}</Text><Text style={styles.summaryCondition}>{data.daily[0]?.condition}</Text><View style={styles.summaryTemps}><Text style={styles.summaryHigh}>{formatTemperature(data.daily[0]?.temperatureMax, preferences.temperatureUnit)}°</Text><Text style={styles.summaryLow}>Low {formatTemperature(data.daily[0]?.temperatureMin, preferences.temperatureUnit)}°</Text></View></View>
              <View style={styles.summaryArt}><View style={styles.summaryGlow} /><WeatherIcon ambient name={data.daily[0]?.icon ?? 'cloud'} size={142} accessibilityLabel={data.daily[0]?.condition} /></View>
            </View>
            <View style={styles.insightRow}><Icon name="water_drop" color={BrandColors.rain} /><Text style={styles.insightText}>Highest rain chance this week</Text><Text style={styles.insightValue}>{highestRain}%</Text></View>
            <KaiShortcut
              mood={highestRain >= 60 ? 'alert' : 'focused'}
              title="Ask Kai about this forecast"
              subtitle={highestRain >= 60 ? 'Plan around the wetter parts of your week.' : 'Get a simple plan for the days ahead.'}
            />

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Next 12 hours</Text><Text style={styles.sectionMeta}>Local time</Text></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hourlyList}>
              {data.hourly.map((hour, index) => <View key={`${hour.timestamp}-${index}`} style={[styles.hour, index === 0 && styles.hourActive]}><Text style={styles.hourTime}>{hour.time}</Text><WeatherIcon name={hour.icon} size={62} accessibilityLabel={hour.condition} /><Text style={styles.hourTemp}>{formatTemperature(hour.temperature, preferences.temperatureUnit)}°</Text><View style={styles.rainRow}><Icon name="water_drop" size={14} color={BrandColors.rain} /><Text style={styles.rainText}>{hour.precipitationProbability}%</Text></View></View>)}
            </ScrollView>

            <Text style={styles.sectionTitle}>7-day outlook</Text>
            <View style={styles.dailyList}>{data.daily.map((day, index) => <View key={day.date ?? day.day} style={[styles.dayRow, index === 0 && styles.dayRowActive]}><View style={styles.dayNameWrap}><Text style={styles.dayName}>{day.day}</Text><Text style={styles.dayCondition} numberOfLines={1}>{day.condition}</Text></View><WeatherIcon name={day.icon} size={58} accessibilityLabel={day.condition} /><View style={styles.dayRain}><Icon name="water_drop" size={14} color={BrandColors.rain} /><Text style={styles.dayRainText}>{day.precipitationProbability}%</Text></View><Text style={styles.dayHigh}>{formatTemperature(day.temperatureMax, preferences.temperatureUnit)}°</Text><Text style={styles.dayLow}>{formatTemperature(day.temperatureMin, preferences.temperatureUnit)}°</Text></View>)}</View>
            <Text style={styles.source}>LIVE FORECAST · OPEN-METEO{isStale ? ' · SAVED' : ''}</Text>
          </> : null}
        </SafeAreaView>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BrandColors.canvas }, scroll: { paddingHorizontal: 18, paddingBottom: 116 },
  header: { minHeight: 92, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, headerCopy: { flex: 1 },
  title: { color: BrandColors.text, fontFamily: BrandTypography.extrabold, fontSize: 32, lineHeight: 40, letterSpacing: -0.7 }, subtitle: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 13, marginTop: 2 },
  refresh: { width: 48, height: 48, borderRadius: 24, backgroundColor: BrandColors.pressed, alignItems: 'center', justifyContent: 'center' },
  alert: { minHeight: 54, borderRadius: 18, paddingHorizontal: 14, marginBottom: Spacing.four, backgroundColor: '#2D2023', flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, alertText: { flex: 1, color: '#F5D8CC', fontFamily: BrandTypography.regular, fontSize: 12, lineHeight: 17 }, retry: { color: '#FFB77C', fontFamily: BrandTypography.bold, fontSize: 12 },
  loading: { minHeight: 480, alignItems: 'center', justifyContent: 'center', gap: Spacing.three }, loadingText: { color: BrandColors.textMuted, fontFamily: BrandTypography.semibold, fontSize: 14 },
  summary: { height: 226, borderRadius: BrandRadius.hero, padding: Spacing.five, flexDirection: 'row', overflow: 'hidden', elevation: 8 }, summaryCopy: { flex: 1, zIndex: 1, justifyContent: 'center' }, summaryDay: { color: '#D9CCF5', fontFamily: BrandTypography.semibold, fontSize: 14 }, summaryCondition: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 22, lineHeight: 29, marginTop: Spacing.two }, summaryTemps: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.three, marginTop: Spacing.three }, summaryHigh: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 54, lineHeight: 62, letterSpacing: -2, fontVariant: ['tabular-nums'] }, summaryLow: { color: '#D4D5E1', fontFamily: BrandTypography.semibold, fontSize: 13 }, summaryArt: { width: 150, alignItems: 'center', justifyContent: 'center' }, summaryGlow: { position: 'absolute', width: 132, height: 132, borderRadius: 66, backgroundColor: '#77D8FF20' },
  insightRow: { minHeight: 62, marginTop: Spacing.three, borderRadius: 20, backgroundColor: '#121B29', flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, gap: Spacing.two }, insightText: { flex: 1, color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 13 }, insightValue: { color: BrandColors.rain, fontFamily: BrandTypography.bold, fontSize: 18, fontVariant: ['tabular-nums'] },
  sectionHeader: { marginTop: Spacing.six, marginBottom: Spacing.four, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }, sectionTitle: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 20, lineHeight: 28 }, sectionMeta: { color: BrandColors.textSubtle, fontFamily: BrandTypography.semibold, fontSize: 11 }, hourlyList: { gap: Spacing.three, paddingRight: 18, paddingBottom: Spacing.six },
  hour: { width: 112, minHeight: 178, borderRadius: BrandRadius.card, backgroundColor: BrandColors.surfaceRaised, alignItems: 'center', paddingVertical: Spacing.four, borderWidth: 1, borderColor: BrandColors.outline }, hourActive: { backgroundColor: '#583D89', borderColor: '#D28CFF88', elevation: 7 }, hourTime: { color: '#DDE2EF', fontFamily: BrandTypography.semibold, fontSize: 12 }, hourTemp: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 25, marginTop: 2, fontVariant: ['tabular-nums'] }, rainRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 }, rainText: { color: BrandColors.rain, fontFamily: BrandTypography.semibold, fontSize: 11 },
  dailyList: { marginTop: Spacing.four, borderRadius: BrandRadius.card, backgroundColor: BrandColors.surface, overflow: 'hidden' }, dayRow: { minHeight: 76, paddingHorizontal: Spacing.four, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: BrandColors.divider }, dayRowActive: { backgroundColor: '#FFFFFF08' }, dayNameWrap: { flex: 1, minWidth: 92 }, dayName: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 14 }, dayCondition: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 11, marginTop: 2 }, dayRain: { width: 50, flexDirection: 'row', alignItems: 'center', gap: 1 }, dayRainText: { color: BrandColors.rain, fontFamily: BrandTypography.semibold, fontSize: 10 }, dayHigh: { width: 42, color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 17, textAlign: 'right', fontVariant: ['tabular-nums'] }, dayLow: { width: 38, color: BrandColors.textMuted, fontFamily: BrandTypography.semibold, fontSize: 15, textAlign: 'right', fontVariant: ['tabular-nums'] }, source: { color: BrandColors.textSubtle, fontFamily: BrandTypography.extrabold, fontSize: 9, letterSpacing: 1.1, textAlign: 'center', marginTop: Spacing.four }, pressed: { opacity: 0.72 },
});
