import { adaptOpenMeteo, type OpenMeteoResponse } from '@/services/weather/open-meteo-adapter';
import type { WeatherLocation, WeatherSnapshot } from '@/types/weather';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(location: WeatherLocation, signal?: AbortSignal): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto', forecast_days: '7', forecast_hours: '24',
  });
  const response = await fetch(`${FORECAST_URL}?${params}`, { signal });
  if (!response.ok) throw new Error(`Weather service returned ${response.status}.`);
  const payload = (await response.json()) as OpenMeteoResponse;
  if (!payload.current || !payload.hourly || !payload.daily) throw new Error('Weather service returned incomplete data.');
  return adaptOpenMeteo(payload, location);
}
