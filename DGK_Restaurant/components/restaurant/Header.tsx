import { StyleSheet, Text, View } from 'react-native';

import { layout, palette } from './theme';

type Props = {
  totalItems: number;
  availableItems: number;
};

export function Header({ totalItems, availableItems }: Props) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroContent}>
        <Text style={styles.heroKicker}>DGK RESTAURANTE</Text>
        <Text style={styles.heroTitle}>Gestão de cardápio elegante e eficiente</Text>
        <Text style={styles.heroSubtitle}>
          Controle pratos, unidades e disponibilidade em tempo real. Tudo integrado ao Back4App e
          pronto para ser compartilhado com a equipe.
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Pratos cadastrados</Text>
            <Text style={styles.statValue}>{totalItems}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Disponíveis</Text>
            <Text style={styles.statValue}>{availableItems}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    padding: 32,
    borderRadius: layout.radiusLarge,
    borderWidth: 1,
    borderColor: 'rgba(77, 61, 33, 0.15)',
    backgroundColor: '#fff7ee',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    elevation: 8,
  },
  heroContent: {
    gap: 12,
  },
  heroKicker: {
    letterSpacing: 4,
    fontSize: 12,
    color: palette.accentDark,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  heroSubtitle: {
    color: palette.textMuted,
    fontSize: 16,
    lineHeight: 22,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: layout.radiusMedium,
    borderWidth: 1,
    borderColor: 'rgba(77, 61, 33, 0.12)',
    minWidth: 140,
  },
  statLabel: {
    fontSize: 12,
    letterSpacing: 2,
    color: palette.accentDark,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: palette.textPrimary,
    marginTop: 4,
  },
});
