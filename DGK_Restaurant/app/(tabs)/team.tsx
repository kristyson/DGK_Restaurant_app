import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { OptionPicker } from '@/components/restaurant/OptionPicker';
import { layout, palette } from '@/components/restaurant/theme';
import { useRestaurantStore } from '@/hooks/useRestaurantStore';

export default function TeamScreen() {
  const teamMembers = useRestaurantStore((state) => state.teamMembers);
  const units = useRestaurantStore((state) => state.units);
  const loadTeam = useRestaurantStore((state) => state.loadTeam);
  const loadUnits = useRestaurantStore((state) => state.loadUnits);
  const isLoadingTeam = useRestaurantStore((state) => state.isLoadingTeam);

  const [selectedUnit, setSelectedUnit] = useState('TODOS');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    void loadUnits();
    void loadTeam();
  }, [loadTeam, loadUnits]);

  const unitOptions = useMemo(() => ['TODOS', ...units.map((unit) => unit.name ?? '').filter(Boolean)], [units]);

  const filteredTeam = useMemo(() => {
    return teamMembers.filter((member) => {
      if (selectedUnit === 'TODOS') return true;
      const unitName = units.find((unit) => unit.id === member.unitId)?.name ?? member.unitId;
      return unitName === selectedUnit;
    });
  }, [selectedUnit, teamMembers, units]);

  const selectedMember = teamMembers.find((member) => member.id === selectedMemberId);

  function handleSendMessage() {
    if (!selectedMember) {
      Alert.alert('Selecione alguém da equipe para enviar uma mensagem.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Escreva uma mensagem antes de enviar.');
      return;
    }
    Alert.alert('Mensagem enviada', `Sua mensagem para ${selectedMember.name} foi registrada.`);
    setMessage('');
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Equipe DGK</Text>
      <Text style={styles.lead}>Acompanhe quem cuida de cada unidade e envie atualizações rápidas para o time.</Text>

      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Filtrar por unidade</Text>
        <OptionPicker
          value={selectedUnit}
          onChange={setSelectedUnit}
          options={unitOptions.map((unit) => ({ label: unit || 'Sem nome', value: unit }))}
        />
      </View>

      {filteredTeam.map((member) => {
        const unitName = units.find((unit) => unit.id === member.unitId)?.name ?? 'Sem unidade vinculada';
        return (
          <Pressable
            key={member.id}
            style={[styles.memberCard, selectedMemberId === member.id && styles.memberCardActive]}
            onPress={() => setSelectedMemberId(member.id)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{member.name}</Text>
              {!!member.role && <Text style={styles.memberRole}>{member.role}</Text>}
              <Text style={styles.memberUnit}>{unitName}</Text>
              {!!member.bio && <Text style={styles.memberBio}>{member.bio}</Text>}
            </View>
            <Text style={styles.selectHint}>{selectedMemberId === member.id ? 'Selecionado' : 'Tocar para selecionar'}</Text>
          </Pressable>
        );
      })}

      {filteredTeam.length === 0 && !isLoadingTeam && (
        <Text style={styles.emptyState}>Nenhum integrante cadastrado para o filtro atual.</Text>
      )}

      {isLoadingTeam && <Text style={styles.loading}>Carregando equipe...</Text>}

      <View style={styles.messageCard}>
        <Text style={styles.sectionTitle}>Enviar atualização rápida</Text>
        <Text style={styles.sectionSubtitle}>
          Escolha alguém da equipe acima, escreva sua orientação e enviaremos uma notificação interna.
        </Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Escreva sua mensagem"
          placeholderTextColor={palette.textMuted}
          style={styles.messageInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Enviar mensagem</Text>
        </Pressable>
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
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  lead: {
    color: palette.textMuted,
    marginBottom: 8,
  },
  filterCard: {
    backgroundColor: palette.surface,
    borderRadius: layout.radiusLarge,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
  },
  filterLabel: {
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 1,
    color: palette.textMuted,
    marginBottom: 8,
  },
  memberCard: {
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
    borderRadius: layout.radiusMedium,
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  memberCardActive: {
    borderColor: palette.accent,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.textPrimary,
  },
  memberRole: {
    color: palette.accentDark,
    fontWeight: '500',
  },
  memberUnit: {
    color: palette.textMuted,
  },
  memberBio: {
    marginTop: 6,
    color: palette.textPrimary,
  },
  selectHint: {
    color: palette.accentDark,
    fontSize: 12,
    textAlign: 'right',
  },
  emptyState: {
    color: palette.textMuted,
    fontStyle: 'italic',
  },
  loading: {
    color: palette.textMuted,
  },
  messageCard: {
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
  messageInput: {
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.2)',
    borderRadius: layout.radiusMedium,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    color: palette.textPrimary,
  },
  sendButton: {
    alignSelf: 'flex-start',
    backgroundColor: palette.accent,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
