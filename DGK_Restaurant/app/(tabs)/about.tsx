import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { layout, palette } from '@/components/restaurant/theme';
import { useRestaurantStore } from '@/hooks/useRestaurantStore';

export default function AboutScreen() {
  const units = useRestaurantStore((state) => state.units);
  const isLoadingUnits = useRestaurantStore((state) => state.isLoadingUnits);
  const loadUnits = useRestaurantStore((state) => state.loadUnits);
  const menuItems = useRestaurantStore((state) => state.menuItems);

  useEffect(() => {
    void loadUnits();
  }, [loadUnits]);

  const menuCountByUnit = useMemo(() => {
    return menuItems.reduce<Record<string, number>>((acc, item) => {
      if (!item.unit) return acc;
      acc[item.unit] = (acc[item.unit] ?? 0) + 1;
      return acc;
    }, {});
  }, [menuItems]);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sobre o DGK Restaurante</Text>
      <Text style={styles.lead}>
        Cuidamos de todas as operações do cardápio digital utilizando Expo Router e um fluxo completo de CRUD integrado ao
        Back4App ou Supabase. Cada unidade tem acesso ao mesmo painel em tempo real, garantindo que o time comercial,
        cozinha e comunicação estejam alinhados.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Unidades em operação</Text>
        <Text style={styles.sectionSubtitle}>
          Os dados são carregados diretamente do seu banco e relacionam quantos pratos ativos existem em cada casa.
        </Text>
        <Pressable style={styles.refreshButton} onPress={() => loadUnits(true)} disabled={isLoadingUnits}>
          <Text style={styles.refreshButtonText}>{isLoadingUnits ? 'Atualizando...' : 'Recarregar unidades'}</Text>
        </Pressable>

        {units.length === 0 && !isLoadingUnits && (
          <Text style={styles.emptyState}>Cadastre unidades no painel para começar a monitorá-las por aqui.</Text>
        )}

        {units.map((unit) => (
          <View key={unit.id} style={styles.unitCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.unitName}>{unit.name}</Text>
              {unit.city && <Text style={styles.unitMeta}>{unit.city}</Text>}
              {unit.address && <Text style={styles.unitMeta}>{unit.address}</Text>}
              {unit.phone && <Text style={styles.unitMeta}>{unit.phone}</Text>}
              {unit.description && <Text style={styles.unitDescription}>{unit.description}</Text>}
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statLabel}>Pratos</Text>
              <Text style={styles.statValue}>{menuCountByUnit[unit.name ?? ''] ?? 0}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: 24,
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  lead: {
    fontSize: 16,
    color: palette.textMuted,
    lineHeight: 22,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: layout.radiusLarge,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  sectionSubtitle: {
    color: palette.textMuted,
  },
  refreshButton: {
    alignSelf: 'flex-start',
    backgroundColor: palette.accent,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyState: {
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  unitCard: {
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
    borderRadius: layout.radiusMedium,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unitName: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  unitMeta: {
    color: palette.textMuted,
  },
  unitDescription: {
    marginTop: 4,
    color: palette.textPrimary,
  },
  statBadge: {
    backgroundColor: 'rgba(181, 138, 83, 0.1)',
    borderRadius: layout.radiusMedium,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: 1,
    color: palette.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.accentDark,
  },
});
