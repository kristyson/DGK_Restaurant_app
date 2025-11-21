import { WeatherLocation, weatherLocations } from './config';

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
