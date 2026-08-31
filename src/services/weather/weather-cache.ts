import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeatherSnapshot } from '@/types/weather';

const CACHE_KEY = 'weatherai:latest-weather:v1';
export const WEATHER_CACHE_FRESH_MS = 30 * 60 * 1000;

export async function readWeatherCache(): Promise<WeatherSnapshot | null> {
  try {
    const value = await AsyncStorage.getItem(CACHE_KEY);
    if (!value) return null;
    const snapshot = JSON.parse(value) as WeatherSnapshot;
    return snapshot.fetchedAt && snapshot.current && snapshot.location ? snapshot : null;
  } catch { return null; }
}

export async function writeWeatherCache(snapshot: WeatherSnapshot) {
  await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
}

export function isWeatherCacheFresh(snapshot: WeatherSnapshot) {
  return Date.now() - new Date(snapshot.fetchedAt).getTime() < WEATHER_CACHE_FRESH_MS;
}
