import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { resolveWeatherLocation } from '@/services/location/location-service';
import { isWeatherCacheFresh, readWeatherCache, writeWeatherCache } from '@/services/weather/weather-cache';
import { fetchWeather } from '@/services/weather/weather-service';
import type { WeatherSnapshot } from '@/types/weather';

type WeatherState = {
  data: WeatherSnapshot | null; error: string | null; isLoading: boolean; isRefreshing: boolean;
  isStale: boolean; permissionDenied: boolean;
};
const initialState: WeatherState = { data: null, error: null, isLoading: true, isRefreshing: false, isStale: false, permissionDenied: false };

export function useWeather() {
  const [state, setState] = useState(initialState);
  const controllerRef = useRef<AbortController | null>(null);

  const load = useCallback(async (forceRefresh = false) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((current) => ({ ...current, error: null, isLoading: !current.data, isRefreshing: Boolean(current.data) }));
    const cached = await readWeatherCache();
    try {
      const { location, permissionDenied } = await resolveWeatherLocation();
      const cacheMatchesLocation = cached
        && Math.abs(cached.location.latitude - location.latitude) < 0.0001
        && Math.abs(cached.location.longitude - location.longitude) < 0.0001;
      if (cached && cacheMatchesLocation && isWeatherCacheFresh(cached) && !forceRefresh) {
        setState({ data: cached, error: null, isLoading: false, isRefreshing: false, isStale: false, permissionDenied });
        return;
      }
      const data = await fetchWeather(location, controller.signal);
      await writeWeatherCache(data);
      setState({ data, error: null, isLoading: false, isRefreshing: false, isStale: false, permissionDenied });
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : 'Unable to update weather.';
      setState((current) => ({ ...current, data: cached ?? current.data, error: message, isLoading: false, isRefreshing: false, isStale: Boolean(cached ?? current.data) }));
    }
  }, []);

  useFocusEffect(useCallback(() => {
    const initialLoad = setTimeout(() => void load(), 0);
    return () => {
      clearTimeout(initialLoad);
      controllerRef.current?.abort();
    };
  }, [load]));

  return { ...state, refresh: () => load(true) };
}
