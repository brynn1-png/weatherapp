export type WeatherIconName = 'clear_day' | 'partly_cloudy_day' | 'rainy' | 'cloud' | 'clear_night';

export type WeatherLocation = { name: string; latitude: number; longitude: number; timezone?: string };
export type CurrentWeather = {
  observedAt: string; temperature: number; apparentTemperature: number; weatherCode: number;
  condition: string; icon: WeatherIconName; humidity: number; windSpeed: number; precipitationProbability: number;
};
export type HourlyWeather = {
  time: string; timestamp?: string; temperature: number; precipitationProbability: number;
  icon: WeatherIconName; condition?: string;
};
export type DailyWeather = {
  day: string; date?: string; condition: string; weatherCode?: number; temperatureMin: number;
  temperatureMax: number; precipitationProbability: number; icon: WeatherIconName;
};
export type WeatherSnapshot = {
  location: WeatherLocation; current: CurrentWeather; hourly: HourlyWeather[]; daily: DailyWeather[]; fetchedAt: string;
};
