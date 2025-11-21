import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

function readEnv(key: string, fallback = ''): string {
  const value = process.env[key] ?? extra[key];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return fallback;
}

export const API_PROVIDER = (readEnv('EXPO_PUBLIC_API_PROVIDER', 'back4app') as
  | 'back4app'
  | 'supabase');

export const MENU_COLLECTION = readEnv('EXPO_PUBLIC_MENU_COLLECTION', 'Menu');
export const TEAM_COLLECTION = readEnv('EXPO_PUBLIC_TEAM_COLLECTION', 'Team');
export const UNIT_COLLECTION = readEnv('EXPO_PUBLIC_UNIT_COLLECTION', 'Unit');

export const PARSE_APP_ID = readEnv('EXPO_PUBLIC_PARSE_APP_ID');
export const PARSE_REST_KEY = readEnv('EXPO_PUBLIC_PARSE_REST_KEY');
export const PARSE_SERVER_URL = readEnv('EXPO_PUBLIC_PARSE_SERVER_URL');

export const SUPABASE_URL = readEnv('EXPO_PUBLIC_SUPABASE_URL');
export const SUPABASE_API_KEY = readEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY');

export const weatherLocations = {
  'São Paulo': { latitude: -23.5505, longitude: -46.6333 },
  'Rio de Janeiro': { latitude: -22.9068, longitude: -43.1729 },
  'Belo Horizonte': { latitude: -19.9167, longitude: -43.9345 },
  Curitiba: { latitude: -25.4284, longitude: -49.2733 },
  Recife: { latitude: -8.0476, longitude: -34.877 },
} as const;

export type WeatherLocation = keyof typeof weatherLocations;
