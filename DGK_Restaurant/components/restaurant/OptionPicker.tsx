import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { layout, palette } from './theme';

type Option = {
  label: string;
  value: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
};

export function OptionPicker({ value, onChange, options, placeholder, disabled }: Props) {
  const [visible, setVisible] = useState(false);
  const selectedLabel = useMemo(
    () => options.find((option) => option.value === value)?.label,
    [options, value],
  );

  return (
    <>
      <Pressable
        style={[styles.input, disabled && styles.disabled]}
        onPress={() => !disabled && setVisible(true)}
        disabled={disabled}>
        <Text style={[styles.valueText, !selectedLabel && styles.placeholder]}>
          {selectedLabel ?? placeholder ?? 'Selecionar'}
        </Text>
      </Pressable>

      <Modal transparent animationType="fade" visible={visible} onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setVisible(false)} />
          <View style={styles.modal}>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.optionRow, option.value === value && styles.optionRowActive]}
                  onPress={() => {
                    onChange(option.value);
                    setVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.optionText,
                      option.value === value && styles.optionTextActive,
                    ]}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: 'rgba(66, 61, 49, 0.2)',
    borderRadius: layout.radiusSmall,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  disabled: {
    opacity: 0.5,
  },
  valueText: {
    color: palette.textPrimary,
  },
  placeholder: {
    color: palette.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: layout.radiusMedium,
    maxHeight: '80%',
    paddingVertical: 12,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  optionRowActive: {
    backgroundColor: 'rgba(181, 138, 83, 0.12)',
  },
  optionText: {
    color: palette.textPrimary,
    fontSize: 16,
  },
  optionTextActive: {
    color: palette.accentDark,
    fontWeight: '600',
  },
});
