import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors, BrandRadius, BrandTypography, Spacing } from '@/constants/theme';
import { AppScreen } from '@/components/app-screen';
import { KaiShortcut } from '@/components/kai/kai-shortcut';
import { searchLocations, type LocationSearchResult } from '@/services/location/geocoding-service';
import { saveSelectedLocation } from '@/services/location/location-preference';
import { resolveDeviceLocation } from '@/services/location/location-service';
import type { WeatherLocation } from '@/types/weather';

export default function LocationScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = setTimeout(async () => {
      requestRef.current?.abort();
      const controller = new AbortController();
      requestRef.current = controller;
      setIsSearching(true);
      setError(null);
      try {
        setResults(await searchLocations(query, controller.signal));
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : 'Unable to search locations.');
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [query]);

  async function chooseLocation(location: WeatherLocation) {
    if (isSelecting) return;
    Keyboard.dismiss();
    setIsSelecting(true);
    setError(null);
    try {
      await saveSelectedLocation(location);
      router.navigate('/');
    } catch {
      setError('Unable to save this location. Please try again.');
      setIsSelecting(false);
    }
  }

  async function handleDeviceLocation() {
    setIsLocating(true);
    setError(null);
    try {
      const result = await resolveDeviceLocation();
      if (result.permissionDenied) {
        setError('Location permission was denied. You can search for a city instead.');
        return;
      }
      await chooseLocation(result.location);
    } catch {
      setError('Unable to determine your location. Check Android location services and try again.');
    } finally {
      setIsLocating(false);
    }
  }

  function updateQuery(value: string) {
    setQuery(value);
    setError(null);
    if (value.trim().length < 2) {
      requestRef.current?.abort();
      setResults([]);
      setIsSearching(false);
    }
  }

  return (
    <AppScreen><SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose a location</Text>
        <Text style={styles.subtitle}>Search worldwide or use your Android device location.</Text>
      </View>

      <View style={styles.searchField}>
        <SymbolView name={{ android: 'search', web: 'search' } as never} size={22} tintColor={BrandColors.textMuted} />
        <TextInput
          value={query}
          onChangeText={updateQuery}
          placeholder="Search city or town"
          placeholderTextColor={BrandColors.textSubtle}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search city or town"
          style={styles.input}
        />
        {isSearching ? <ActivityIndicator color={BrandColors.pinkSoft} /> : query.length > 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Clear location search" hitSlop={8} onPress={() => updateQuery('')} style={styles.clearButton}><SymbolView name={{ android: 'close', web: 'close' } as never} size={20} tintColor={BrandColors.textMuted} /></Pressable> : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Use my current location"
        disabled={isLocating || isSelecting}
        onPress={() => void handleDeviceLocation()}
        style={({ pressed }) => [styles.deviceButton, pressed && styles.pressed, isLocating && styles.disabled]}>
        <View style={styles.deviceIcon}>
          {isLocating
            ? <ActivityIndicator color={BrandColors.text} />
            : <SymbolView name={{ android: 'my_location', web: 'my_location' } as never} size={24} tintColor={BrandColors.text} />}
        </View>
        <View style={styles.deviceCopy}>
          <Text style={styles.deviceTitle}>{isLocating ? 'Finding your location…' : 'Use my current location'}</Text>
          <Text style={styles.deviceSubtitle}>Uses foreground access only</Text>
        </View>
        <SymbolView name={{ android: 'chevron_right', web: 'chevron_right' } as never} size={24} tintColor={BrandColors.iconMuted} />
      </Pressable>

      <KaiShortcut
        mood="thinking"
        title="Not sure which place?"
        subtitle="Ask Kai before choosing a location."
      />

      {error && (
        <View style={styles.errorCard} accessibilityRole="alert">
          <SymbolView name={{ android: 'error', web: 'error' } as never} size={20} tintColor="#FFB77C" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.results}
        ListEmptyComponent={
          query.trim().length >= 2 && !isSearching && !error
            ? <Text style={styles.emptyText}>No matching locations found. Try a nearby city or broader spelling.</Text>
            : <Text style={styles.hintText}>Enter at least two letters to search.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Use weather location ${item.name}, ${item.subtitle}`}
            accessibilityState={{ disabled: isSelecting }}
            disabled={isSelecting}
            onPress={() => void chooseLocation(item)}
            style={({ pressed }) => [styles.resultRow, isSelecting && styles.disabled, pressed && styles.pressed]}>
            <View style={styles.resultIcon}>
              <SymbolView name={{ android: 'location_on', web: 'location_on' } as never} size={23} tintColor={BrandColors.pinkSoft} />
            </View>
            <View style={styles.resultCopy}>
              <Text style={styles.resultName}>{item.name}</Text>
              <Text style={styles.resultSubtitle}>{item.subtitle || 'Location result'}</Text>
            </View>
            <SymbolView name={{ android: 'arrow_forward', web: 'arrow_forward' } as never} size={21} tintColor={BrandColors.iconMuted} />
          </Pressable>
        )}
      />
    </SafeAreaView></AppScreen>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BrandColors.canvas, paddingHorizontal: Spacing.four, paddingBottom: 104 },
  header: { paddingTop: Spacing.four, paddingBottom: Spacing.five },
  title: { color: BrandColors.text, fontFamily: BrandTypography.extrabold, fontSize: 29, lineHeight: 38 },
  subtitle: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 14, lineHeight: 21, marginTop: Spacing.one },
  searchField: { minHeight: 56, borderRadius: BrandRadius.control, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.outline, flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  input: { flex: 1, color: BrandColors.text, fontFamily: BrandTypography.regular, fontSize: 16, paddingVertical: Spacing.three },
  clearButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  deviceButton: { minHeight: 80, marginTop: Spacing.four, borderRadius: BrandRadius.card, backgroundColor: BrandColors.dockPurpleDeep, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  deviceIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: BrandColors.pink, alignItems: 'center', justifyContent: 'center' },
  deviceCopy: { flex: 1 },
  deviceTitle: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 15 },
  deviceSubtitle: { color: '#C8BDE0', fontFamily: BrandTypography.regular, fontSize: 12, marginTop: 2 },
  errorCard: { minHeight: 52, marginTop: Spacing.three, padding: Spacing.three, borderRadius: 18, backgroundColor: '#34231F', flexDirection: 'row', gap: Spacing.two, alignItems: 'center' },
  errorText: { flex: 1, color: '#FFD5C2', fontFamily: BrandTypography.regular, fontSize: 13, lineHeight: 19 },
  results: { flexGrow: 1, paddingTop: Spacing.four, gap: Spacing.two },
  resultRow: { minHeight: 72, borderRadius: BrandRadius.card, backgroundColor: BrandColors.surface, borderWidth: 1, borderColor: BrandColors.outline, flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.four, gap: Spacing.three },
  resultIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FF217B18', alignItems: 'center', justifyContent: 'center' },
  resultCopy: { flex: 1 },
  resultName: { color: BrandColors.text, fontFamily: BrandTypography.bold, fontSize: 15 },
  resultSubtitle: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 12, marginTop: 2 },
  hintText: { color: BrandColors.textSubtle, fontFamily: BrandTypography.regular, fontSize: 13, textAlign: 'center', marginTop: Spacing.six },
  emptyText: { color: BrandColors.textMuted, fontFamily: BrandTypography.regular, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: Spacing.six, paddingHorizontal: Spacing.five },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.6 },
});
