/**
 * src/hooks/useWeather.ts
 * Reusable hook — fetches live weather from /api/weather
 * Falls back to mock data if API key not configured.
 */
'use client';
import { useState, useEffect, useCallback } from 'react';

export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  condition: string;
  description: string;
  humidity: number;
  wind: number;
  visibility: number;
  icon: string;
  emoji: string;
  sunrise: string;
  sunset: string;
  updatedAt: string;
}

interface UseWeatherResult {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  refetch: () => void;
}

// Cache in module scope — avoids re-fetching same city across components
const cache = new Map<string, { data: WeatherData; isMock: boolean; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function useWeather(city: string = 'Delhi'): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [isMock, setIsMock]   = useState(false);
  const [tick, setTick]       = useState(0);

  const refetch = useCallback(() => {
    cache.delete(city);
    setTick(t => t + 1);
  }, [city]);

  useEffect(() => {
    if (!city) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      // Check cache
      const cached = cache.get(city);
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        if (!cancelled) {
          setWeather(cached.data);
          setIsMock(cached.isMock);
          setLoading(false);
        }
        return;
      }

      try {
        const res  = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
        const json = await res.json();
        if (!cancelled) {
          setWeather(json.data);
          setIsMock(json.mock ?? false);
          cache.set(city, { data: json.data, isMock: json.mock ?? false, ts: Date.now() });
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [city, tick]);

  return { weather, loading, error, isMock, refetch };
}
