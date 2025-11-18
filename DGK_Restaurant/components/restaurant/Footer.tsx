import { StyleSheet, Text, View } from 'react-native';

import { palette } from './theme';

export function Footer() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>
        As alterações são salvas diretamente no Back4App, permitindo que toda a equipe acompanhe o cardápio em tempo real.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  text: {
    color: palette.textMuted,
    textAlign: 'center',
  },
});
