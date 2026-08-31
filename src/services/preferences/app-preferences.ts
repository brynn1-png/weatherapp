import AsyncStorage from '@react-native-async-storage/async-storage';

export const APP_PREFERENCES_KEY = 'weatherai:settings:v1';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type AppPreferences = {
  temperatureUnit: TemperatureUnit;
  userName: string;
};

export const defaultAppPreferences: AppPreferences = {
  temperatureUnit: 'celsius',
  userName: '',
};

export async function readAppPreferences(): Promise<AppPreferences> {
  const stored = await AsyncStorage.getItem(APP_PREFERENCES_KEY);
  if (!stored) return defaultAppPreferences;

  try {
    const parsed = JSON.parse(stored) as Partial<AppPreferences>;
    return {
      temperatureUnit: parsed.temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
      userName: typeof parsed.userName === 'string' ? parsed.userName.trim().slice(0, 40) : '',
    };
  } catch {
    return defaultAppPreferences;
  }
}

export async function saveAppPreferences(preferences: AppPreferences) {
  await AsyncStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(preferences));
}

export function formatTemperature(celsius: number | undefined, unit: TemperatureUnit) {
  if (celsius === undefined) return '--';
  return unit === 'fahrenheit' ? Math.round((celsius * 9) / 5 + 32) : Math.round(celsius);
}

export function temperatureUnitLabel(unit: TemperatureUnit) {
  return unit === 'fahrenheit' ? '°F' : '°C';
}
