import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { OptionPicker } from './OptionPicker';
import { layout, palette } from './theme';

type FormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  unit: string;
  available: boolean;
  applyAllUnits: boolean;
};

type Props = {
  editingId: string | null;
  formData: FormData;
  selectableCategories: string[];
  unitOptions: string[];
  updateForm: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
  handleSubmit: () => void;
  handleCancelEdit: () => void;
  isSaving: boolean;
};

export function MenuForm({
  editingId,
  formData,
  selectableCategories,
  unitOptions,
  updateForm,
  handleSubmit,
  handleCancelEdit,
  isSaving,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{editingId ? 'Editar prato' : 'Adicionar novo prato'}</Text>
      <View style={styles.form}>
        <View style={styles.grid}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              value={formData.name}
              onChangeText={(text) => updateForm('name', text)}
              style={styles.input}
              placeholder="Nome do prato"
              placeholderTextColor={palette.textMuted}
            />
          </View>

          <View style={[styles.field, styles.fieldWide]}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => updateForm('description', text)}
              style={[styles.input, styles.textarea]}
              placeholder="Detalhe os ingredientes e apresentação"
              placeholderTextColor={palette.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              value={formData.price}
              onChangeText={(text) => updateForm('price', text)}
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor={palette.textMuted}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Unidade</Text>
            <OptionPicker
              value={formData.unit}
              onChange={(value) => updateForm('unit', value)}
              options={unitOptions.map((unit) => ({ label: unit, value: unit }))}
              disabled={formData.applyAllUnits}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Categoria</Text>
            <OptionPicker
              value={formData.category}
              onChange={(value) => updateForm('category', value)}
              options={selectableCategories.map((category) => ({ label: category, value: category }))}
              placeholder="Selecione uma categoria"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Disponível?</Text>
            <OptionPicker
              value={formData.available ? 'true' : 'false'}
              onChange={(value) => updateForm('available', value === 'true')}
              options={[
                { label: 'Sim', value: 'true' },
                { label: 'Não', value: 'false' },
              ]}
            />
          </View>

          {!editingId && (
            <View style={[styles.checkboxField, styles.fieldWide]}>
              <Switch
                value={formData.applyAllUnits}
                onValueChange={(checked) => updateForm('applyAllUnits', checked)}
                thumbColor={formData.applyAllUnits ? palette.accent : '#f4f3f4'}
                trackColor={{ false: '#d6cec3', true: '#d6aa7c' }}
              />
              <Text style={styles.checkboxLabel}>Adicionar em todas as unidades?</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isSaving && styles.buttonDisabled]}
            disabled={isSaving}
            onPress={handleSubmit}>
            <Text style={styles.primaryButtonText}>
              {editingId ? 'Salvar alterações' : 'Adicionar prato'}
            </Text>
          </TouchableOpacity>

          {editingId && (
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleCancelEdit}>
              <Text style={styles.secondaryButtonText}>Cancelar edição</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: 12,
  },
  form: {
    backgroundColor: palette.surface,
    borderRadius: layout.radiusLarge,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.12)',
    gap: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  field: {
    flexBasis: '45%',
    flexGrow: 1,
  },
  fieldWide: {
    flexBasis: '100%',
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
  textarea: {
    minHeight: 120,
  },
  checkboxField: {
    backgroundColor: 'rgba(66, 61, 49, 0.08)',
    borderRadius: layout.radiusSmall,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    color: palette.textPrimary,
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  primaryButton: {
    backgroundColor: palette.accent,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(66,61,49,0.3)',
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
