import type { WeatherLocation } from '@/types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

type GeocodingResponse = {
  results?: {
    id: number; name: string; latitude: number; longitude: number;
    country?: string; admin1?: string; timezone?: string;
  }[];
};

export type LocationSearchResult = WeatherLocation & {
  id: number;
  subtitle: string;
};

export async function searchLocations(query: string, signal?: AbortSignal): Promise<LocationSearchResult[]> {
  const params = new URLSearchParams({ name: query.trim(), count: '8', language: 'en', format: 'json' });
  const response = await fetch(`${GEOCODING_URL}?${params}`, { signal });
  if (!response.ok) throw new Error(`Location search returned ${response.status}.`);
  const payload = (await response.json()) as GeocodingResponse;
  return (payload.results ?? []).map((result) => ({
    id: result.id,
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
    subtitle: [result.admin1, result.country].filter(Boolean).join(', '),
  }));
}
