const API_BASE = 'https://api.weatherstack.com';
const ACCESS_KEY = '4fe80686e0a419e7fda68e256d8c849f';

export type Units = 'm' | 's' | 'f';

export interface CurrentWeatherRequest {
  query: string;
  units?: Units;
}

export interface HistoricalWeatherRequest {
  query: string;
  date: string; // YYYY-MM-DD
  units?: Units;
}

export interface MarineWeatherRequest {
  query: string; // "lat,lon"
  units?: Units;
}

async function fetchFromWeatherstack<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`);
  url.searchParams.set('access_key', ACCESS_KEY);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Network error: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.info || 'Weatherstack API error');
  }

  return data as T;
}

export function getCurrentWeather(req: CurrentWeatherRequest) {
  return fetchFromWeatherstack('/current', {
    query: req.query,
    units: req.units ?? 'm'
  });
}

export function getHistoricalWeather(req: HistoricalWeatherRequest) {
  return fetchFromWeatherstack('/historical', {
    query: req.query,
    historical_date: req.date,
    units: req.units ?? 'm'
  });
}

export function getMarineWeather(req: MarineWeatherRequest) {
  return fetchFromWeatherstack('/marine', {
    query: req.query,
    units: req.units ?? 'm'
  });
}

