import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WeightUnit, WEIGHT_UNITS } from '../data/materials';
import { Theme } from '../theme/theme';

type Props = {
  label: string;
  value: string;
  onChangeValue: (v: string) => void;
  unit: WeightUnit;
  onChangeUnit: (u: WeightUnit) => void;
  theme: Theme;
};

export default function WeightInput({ label, value, onChangeValue, unit, onChangeUnit, theme }: Props) {
  const cycleUnit = () => {
    const idx = WEIGHT_UNITS.indexOf(unit);
    const next = WEIGHT_UNITS[(idx + 1) % WEIGHT_UNITS.length];
    onChangeUnit(next);
  };

  return (
    <View style={styles.row}>
      <TextInput
        style={[styles.input, { backgroundColor: theme.panelInput, color: theme.text }]}
        placeholder={`Weight of ${label}`}
        placeholderTextColor={theme.subtext}
        keyboardType="decimal-pad"
        value={value}
        onChangeText={onChangeValue}
      />
      <TouchableOpacity onPress={cycleUnit} style={styles.unitButton} accessibilityLabel={`Change unit, currently ${unit}`}>
        <Text style={[styles.unitText, { color: theme.text }]}>{unit}</Text>
        <Text style={[styles.unitChevron, { color: theme.text }]}>{'↕'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 17,
  },
  unitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    paddingHorizontal: 4,
  },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  },
  unitChevron: {
    fontSize: 16,
  },
});
