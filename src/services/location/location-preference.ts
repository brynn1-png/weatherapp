import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WeatherLocation } from '@/types/weather';

const SELECTED_LOCATION_KEY = 'weatherai:selected-location:v1';

export async function readSelectedLocation(): Promise<WeatherLocation | null> {
  try {
    const value = await AsyncStorage.getItem(SELECTED_LOCATION_KEY);
    if (!value) return null;
    const location = JSON.parse(value) as WeatherLocation;
    return typeof location.name === 'string' && Number.isFinite(location.latitude) && Number.isFinite(location.longitude)
      ? location
      : null;
  } catch {
    return null;
  }
}

export async function saveSelectedLocation(location: WeatherLocation) {
  await AsyncStorage.setItem(SELECTED_LOCATION_KEY, JSON.stringify(location));
}
