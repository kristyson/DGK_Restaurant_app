import Constants from 'expo-constants';

const env = Constants.expoConfig?.extra ?? {};

const PARSE_APP_ID =
  process.env.EXPO_PUBLIC_PARSE_APP_ID ?? env.EXPO_PUBLIC_PARSE_APP_ID ?? '';
const PARSE_REST_KEY =
  process.env.EXPO_PUBLIC_PARSE_REST_KEY ?? env.EXPO_PUBLIC_PARSE_REST_KEY ?? '';
const PARSE_SERVER_URL =
  process.env.EXPO_PUBLIC_PARSE_SERVER_URL ?? env.EXPO_PUBLIC_PARSE_SERVER_URL ?? '';

export const MENU_CLASS =
  process.env.EXPO_PUBLIC_PARSE_MENU_CLASS ?? env.EXPO_PUBLIC_PARSE_MENU_CLASS ?? 'Menu';

export const weatherLocations = {
  "São Paulo": { latitude: -23.5505, longitude: -46.6333 },
  "Rio de Janeiro": { latitude: -22.9068, longitude: -43.1729 },
  "Belo Horizonte": { latitude: -19.9167, longitude: -43.9345 },
  Curitiba: { latitude: -25.4284, longitude: -49.2733 },
  Recife: { latitude: -8.0476, longitude: -34.877 },
} as const;

export type WeatherLocation = keyof typeof weatherLocations;

export async function parseRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: Record<string, unknown> } = {},
): Promise<T> {
  if (!PARSE_SERVER_URL || !PARSE_APP_ID || !PARSE_REST_KEY) {
    throw new Error('Configure as variáveis do Parse no app.');
  }

  const response = await fetch(`${PARSE_SERVER_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'X-Parse-Application-Id': PARSE_APP_ID,
      'X-Parse-REST-API-Key': PARSE_REST_KEY,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error ?? 'Erro ao comunicar com o Parse.');
  }
  return data as T;
}

export type WeatherInfo = {
  temperature: number;
  windspeed: number;
  time: string;
};

export async function loadWeatherForCity(city: WeatherLocation): Promise<WeatherInfo> {
  const location = weatherLocations[city];
  if (!location) {
    throw new Error('Cidade não suportada.');
  }

  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current_weather: 'true',
    timezone: 'auto',
    windspeed_unit: 'kmh',
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Não foi possível buscar o clima.');
  }

  const data = await response.json();
  if (!data?.current_weather) {
    throw new Error('Resposta inválida do serviço de clima.');
  }

  return {
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    time: data.current_weather.time,
  };
}
