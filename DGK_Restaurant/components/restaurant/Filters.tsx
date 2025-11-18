import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FiltersState } from '@/hooks/useRestaurantStore';

import { OptionPicker } from './OptionPicker';
import { layout, palette } from './theme';

type Props = {
  filters: FiltersState;
  updateFilter: <K extends keyof FiltersState>(field: K, value: FiltersState[K]) => void;
  selectableCategories: string[];
};

export function Filters({ filters, updateFilter, selectableCategories }: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.field}>
        <Text style={styles.label}>Filtrar por nome</Text>
        <TextInput
          value={filters.name}
          onChangeText={(text) => updateFilter('name', text)}
          style={styles.input}
          placeholder="Digite o nome"
          placeholderTextColor={palette.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <OptionPicker
          value={filters.category}
          onChange={(value) => updateFilter('category', value)}
          options={[{ label: 'Todas', value: 'TODAS' }, ...selectableCategories.map((c) => ({ label: c, value: c }))]}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Disponibilidade</Text>
        <OptionPicker
          value={filters.availability}
          onChange={(value) => updateFilter('availability', value)}
          options={[
            { label: 'Todos', value: 'TODOS' },
            { label: 'Disponíveis', value: 'DISPONIVEL' },
            { label: 'Indisponíveis', value: 'INDISPONIVEL' },
          ]}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Preço mínimo</Text>
        <TextInput
          value={filters.minPrice}
          onChangeText={(text) => updateFilter('minPrice', text)}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={palette.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Preço máximo</Text>
        <TextInput
          value={filters.maxPrice}
          onChangeText={(text) => updateFilter('maxPrice', text)}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor={palette.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderRadius: layout.radiusLarge,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
    marginBottom: 24,
  },
  field: {
    flexBasis: '45%',
    flexGrow: 1,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
    color: palette.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(66, 61, 49, 0.2)',
    borderRadius: layout.radiusSmall,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    color: palette.textPrimary,
  },
});
