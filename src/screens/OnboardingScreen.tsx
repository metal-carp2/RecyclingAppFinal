import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';

function formatPhone(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default function OnboardingScreen() {
  const { theme, saveUser } = useApp();
  const [name, setName] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [error, setError] = useState('');

  const onPhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digits);
  };

  const onContinue = async () => {
    if (!name.trim() || phoneDigits.length !== 10) {
      setError('Please enter a valid name and a 10-digit phone number.');
      return;
    }
    setError('');
    await saveUser({ name: name.trim(), phone: formatPhone(phoneDigits) });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>Recycling App</Text>
          <Text style={[styles.subtitle, { color: theme.text }]}>
            Please provide your name and phone number
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.panelInput, color: theme.text }]}
              placeholder="Enter your name"
              placeholderTextColor={theme.subtext}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.panelInput, color: theme.text }]}
              placeholder="Enter your phone number (e.g., 1234567890)"
              placeholderTextColor={theme.subtext}
              keyboardType="phone-pad"
              value={formatPhone(phoneDigits)}
              onChangeText={onPhoneChange}
            />

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button }]}
              onPress={onContinue}
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 40, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 48 },
  form: { gap: 16 },
  input: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 18,
    fontSize: 17,
    marginBottom: 16,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  error: { color: '#FFD7D7', textAlign: 'center', marginTop: 16, fontWeight: '600' },
});
