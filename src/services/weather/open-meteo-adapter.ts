import type { DailyWeather, HourlyWeather, WeatherIconName, WeatherLocation, WeatherSnapshot } from '@/types/weather';

export type OpenMeteoResponse = {
  timezone?: string;
  current: { time: string; temperature_2m: number; apparent_temperature: number; relative_humidity_2m: number; weather_code: number; wind_speed_10m: number };
  hourly: { time: string[]; temperature_2m: number[]; precipitation_probability: number[]; weather_code: number[] };
  daily: { time: string[]; weather_code: number[]; temperature_2m_max: number[]; temperature_2m_min: number[]; precipitation_probability_max: number[] };
};

export function describeWeatherCode(code: number): { condition: string; icon: WeatherIconName } {
  if (code === 0) return { condition: 'Clear sky', icon: 'clear_day' };
  if (code === 1 || code === 2) return { condition: 'Partly cloudy', icon: 'partly_cloudy_day' };
  if (code === 3) return { condition: 'Cloudy', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'Foggy', icon: 'cloud' };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { condition: 'Rain showers', icon: 'rainy' };
  if (code >= 71 && code <= 77) return { condition: 'Snow showers', icon: 'rainy' };
  if (code >= 95) return { condition: 'Thunderstorms', icon: 'rainy' };
  return { condition: 'Cloudy', icon: 'cloud' };
}

function hourLabel(timestamp: string, index: number) {
  if (index === 0) return 'Now';
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric' });
}

function dayLabel(date: string, index: number) {
  if (index === 0) return 'Today';
  return new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: 'short' });
}

export function adaptOpenMeteo(response: OpenMeteoResponse, location: WeatherLocation): WeatherSnapshot {
  const foundIndex = response.hourly.time.findIndex((time) => time >= response.current.time);
  const currentHourIndex = Math.max(0, foundIndex);
  const hourly: HourlyWeather[] = response.hourly.time.slice(currentHourIndex, currentHourIndex + 12).map((time, index) => {
    const sourceIndex = currentHourIndex + index;
    const weather = describeWeatherCode(response.hourly.weather_code[sourceIndex]);
    return {
      time: hourLabel(time, index), timestamp: time, temperature: Math.round(response.hourly.temperature_2m[sourceIndex]),
      precipitationProbability: response.hourly.precipitation_probability[sourceIndex] ?? 0,
      icon: weather.icon, condition: weather.condition,
    };
  });

  const daily: DailyWeather[] = response.daily.time.map((date, index) => {
    const weather = describeWeatherCode(response.daily.weather_code[index]);
    return {
      day: dayLabel(date, index), date, weatherCode: response.daily.weather_code[index], condition: weather.condition,
      temperatureMin: Math.round(response.daily.temperature_2m_min[index]),
      temperatureMax: Math.round(response.daily.temperature_2m_max[index]),
      precipitationProbability: response.daily.precipitation_probability_max[index] ?? 0, icon: weather.icon,
    };
  });

  const currentWeather = describeWeatherCode(response.current.weather_code);
  return {
    location: { ...location, timezone: response.timezone },
    current: {
      observedAt: response.current.time, temperature: Math.round(response.current.temperature_2m),
      apparentTemperature: Math.round(response.current.apparent_temperature), weatherCode: response.current.weather_code,
      condition: currentWeather.condition, icon: currentWeather.icon,
      humidity: Math.round(response.current.relative_humidity_2m), windSpeed: Math.round(response.current.wind_speed_10m),
      precipitationProbability: hourly[0]?.precipitationProbability ?? 0,
    },
    hourly, daily, fetchedAt: new Date().toISOString(),
  };
}
