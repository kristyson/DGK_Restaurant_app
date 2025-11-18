import { StyleSheet, Text, View } from 'react-native';

import { WeatherInfo } from '@/lib/parseApi';

import { OptionPicker } from './OptionPicker';
import { layout, palette } from './theme';

type Props = {
  weatherCity: string;
  setWeatherCity: (city: string) => void;
  locationOptions: string[];
  weatherInfo: WeatherInfo | null;
  weatherMessage: string;
};

export function WeatherSection({
  weatherCity,
  setWeatherCity,
  locationOptions,
  weatherInfo,
  weatherMessage,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Condições do tempo</Text>
      <View style={styles.panel}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Escolha uma cidade</Text>
          <OptionPicker
            value={weatherCity}
            onChange={setWeatherCity}
            options={locationOptions.map((city) => ({ label: city, value: city }))}
          />
        </View>

        {weatherInfo && (
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherSummary}>
              Clima em {weatherCity}: {weatherInfo.temperature}°C, vento {weatherInfo.windspeed} km/h.
            </Text>
            <Text style={styles.weatherTime}>
              Última atualização: {new Date(weatherInfo.time).toLocaleString()}
            </Text>
          </View>
        )}

        {!!weatherMessage && <Text style={styles.feedback}>{weatherMessage}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 12,
  },
  panel: {
    backgroundColor: palette.surface,
    borderRadius: layout.radiusLarge,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    color: palette.textMuted,
    marginBottom: 6,
  },
  weatherInfo: {
    gap: 4,
  },
  weatherSummary: {
    fontWeight: '600',
    color: palette.textPrimary,
  },
  weatherTime: {
    color: palette.textMuted,
    fontSize: 14,
  },
  feedback: {
    color: palette.accentDark,
    fontWeight: '500',
    marginTop: 6,
  },
});
