import * as Location from 'expo-location';
import { readSelectedLocation } from '@/services/location/location-preference';
import type { WeatherLocation } from '@/types/weather';

export const DEFAULT_LOCATION: WeatherLocation = { name: 'Santa Cruz', latitude: 14.2814, longitude: 121.4161, timezone: 'Asia/Manila' };
export type LocationResult = { location: WeatherLocation; permissionDenied: boolean };

export async function resolveDeviceLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== Location.PermissionStatus.GRANTED) return { location: DEFAULT_LOCATION, permissionDenied: true };

  const lastKnown = await Location.getLastKnownPositionAsync({ maxAge: 10 * 60 * 1000, requiredAccuracy: 5000 });
  const position = lastKnown ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
  const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
  let name = 'Current location';
  try {
    const [address] = await Location.reverseGeocodeAsync(coordinates);
    name = address?.city ?? address?.subregion ?? address?.region ?? name;
  } catch {}
  return { location: { name, ...coordinates }, permissionDenied: false };
}

export async function resolveWeatherLocation(): Promise<LocationResult> {
  const selected = await readSelectedLocation();
  if (selected) return { location: selected, permissionDenied: false };
  return resolveDeviceLocation();
}
