import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { layout, palette } from './theme';

type MenuItem = {
  objectId: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  unit?: string;
  available?: boolean;
};

type Props = {
  sortedItems: MenuItem[];
  totalAvailable: number;
  isLoadingMenu: boolean;
  statusMessage: string;
  refreshMenu: () => void;
  handleEdit: (item: MenuItem) => void;
  handleToggleAvailability: (item: MenuItem) => void;
  handleDelete: (item: MenuItem) => void;
  toggleSort: (key: 'name' | 'price' | 'unit') => void;
  renderSortIndicator: (key: string) => string | null;
};

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return '—';
  try {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  } catch {
    return `R$ ${value.toFixed(2)}`;
  }
}

export function MenuTable({
  sortedItems,
  totalAvailable,
  isLoadingMenu,
  statusMessage,
  refreshMenu,
  handleEdit,
  handleToggleAvailability,
  handleDelete,
  toggleSort,
  renderSortIndicator,
}: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.title}>Cardápio cadastrado</Text>
          <Text style={styles.subtitle}>
            Total de pratos exibidos: {sortedItems.length} | Disponíveis: {totalAvailable}
          </Text>
        </View>
        <Pressable
          style={[styles.button, styles.primaryButton, isLoadingMenu && styles.buttonDisabled]}
          onPress={refreshMenu}
          disabled={isLoadingMenu}>
          <Text style={styles.primaryButtonText}>Atualizar lista</Text>
        </Pressable>
      </View>

      {!!statusMessage && <Text style={styles.feedback}>{statusMessage}</Text>}
      {isLoadingMenu && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={palette.accentDark} />
          <Text style={styles.subtitle}>Carregando itens...</Text>
        </View>
      )}

      {!isLoadingMenu && sortedItems.length === 0 && <Text>Nenhum prato encontrado.</Text>}

      {!isLoadingMenu && sortedItems.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <View style={[styles.cell, styles.headerCell]}>
                <Pressable onPress={() => toggleSort('name')}>
                  <Text style={styles.headerText}>Nome{renderSortIndicator('name')}</Text>
                </Pressable>
              </View>
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>Descrição</Text>
              </View>
              <View style={[styles.cell, styles.headerCell]}>
                <Pressable onPress={() => toggleSort('price')}>
                  <Text style={styles.headerText}>Preço{renderSortIndicator('price')}</Text>
                </Pressable>
              </View>
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>Categoria</Text>
              </View>
              <View style={[styles.cell, styles.headerCell]}>
                <Pressable onPress={() => toggleSort('unit')}>
                  <Text style={styles.headerText}>Unidade{renderSortIndicator('unit')}</Text>
                </Pressable>
              </View>
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>Disponível</Text>
              </View>
              <View style={[styles.cell, styles.headerCell]}>
                <Text style={styles.headerText}>Ações</Text>
              </View>
            </View>

            {sortedItems.map((item) => (
              <View key={item.objectId} style={styles.row}>
                <View style={styles.cell}>
                  <Text style={styles.cellText}>{item.name}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.cellText}>{item.description || '—'}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.cellText}>{formatCurrency(item.price)}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.cellText}>{item.category || '—'}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.cellText}>{item.unit || '—'}</Text>
                </View>
                <View style={styles.cell}>
                  <Text style={styles.cellText}>{item.available !== false ? 'Sim' : 'Não'}</Text>
                </View>
                <View style={[styles.cell, styles.actionsCell]}>
                  <Pressable style={styles.actionButton} onPress={() => handleEdit(item)}>
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleToggleAvailability(item)}>
                    <Text style={styles.actionText}>Alternar</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleDelete(item)}>
                    <Text style={styles.actionText}>Excluir</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  subtitle: {
    color: palette.textMuted,
  },
  button: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: palette.accent,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  feedback: {
    color: palette.accentDark,
    fontWeight: '500',
    marginBottom: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
    borderRadius: layout.radiusLarge,
    backgroundColor: palette.surface,
    minWidth: 720,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(66,61,49,0.12)',
  },
  headerRow: {
    backgroundColor: 'rgba(66,61,49,0.08)',
  },
  cell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  headerCell: {
    justifyContent: 'center',
  },
  headerText: {
    color: palette.textPrimary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cellText: {
    color: palette.textPrimary,
  },
  actionsCell: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.2)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    color: palette.accentDark,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
