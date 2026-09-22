import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { MATERIALS, MaterialKey, toPounds, WeightUnit } from '../data/materials';
import WeightInput from '../components/WeightInput';

type Props = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

type FieldState = Record<MaterialKey, { value: string; unit: WeightUnit }>;

const initialFields: FieldState = {
  paper: { value: '', unit: 'lbs' },
  aluminum: { value: '', unit: 'lbs' },
  steel: { value: '', unit: 'lbs' },
  plastics: { value: '', unit: 'lbs' },
  compostables: { value: '', unit: 'lbs' },
  glass: { value: '', unit: 'lbs' },
};

export default function RewardsScreen({ navigation, route }: Props) {
  const { theme } = useApp();
  const [fields, setFields] = useState<FieldState>(initialFields);
  const [total, setTotal] = useState<number | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const prefill = route.params?.prefill;
    if (!prefill || prefill.length === 0) return;
    setFields((prev) => {
      const next: FieldState = { ...prev };
      for (const item of prefill) {
        const existingGrams = next[item.material].value ? parseFloat(next[item.material].value) : 0;
        next[item.material] = {
          value: String((isNaN(existingGrams) ? 0 : existingGrams) + item.grams),
          unit: 'g',
        };
      }
      return next;
    });
    setPrefilled(true);
  }, [route.params?.prefill]);

  const updateValue = (key: MaterialKey, value: string) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], value } }));
  };

  const updateUnit = (key: MaterialKey, unit: WeightUnit) => {
    setFields((prev) => ({ ...prev, [key]: { ...prev[key], unit } }));
  };

  const calculate = () => {
    let earnings = 0;
    for (const material of MATERIALS) {
      const field = fields[material.key];
      const numeric = parseFloat(field.value);
      if (!isNaN(numeric) && numeric > 0) {
        const pounds = toPounds(numeric, field.unit);
        earnings += pounds * material.ratePerPound;
      }
    }
    setTotal(earnings);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={[styles.backText, { color: theme.text }]}>{'‹'} Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>Recycling Cash Out Calculator</Text>

          {prefilled && (
            <Text style={[styles.prefillNote, { color: theme.text }]}>
              Filled in from your last scan — feel free to adjust before calculating.
            </Text>
          )}

          {MATERIALS.map((material) => (
            <WeightInput
              key={material.key}
              label={material.label}
              value={fields[material.key].value}
              onChangeValue={(v) => updateValue(material.key, v)}
              unit={fields[material.key].unit}
              onChangeUnit={(u) => updateUnit(material.key, u)}
              theme={theme}
            />
          ))}

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={calculate}>
            <Text style={styles.buttonText}>Calculate Earnings</Text>
          </TouchableOpacity>

          {total !== null && (
            <Text style={[styles.total, { color: theme.text }]}>
              Total Earnings: ${total.toFixed(2)}
            </Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { fontSize: 18, fontWeight: '600' },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '800', marginBottom: 12 },
  prefillNote: { fontSize: 14, fontWeight: '600', marginBottom: 20, opacity: 0.85 },
  button: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  total: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 24 },
});
