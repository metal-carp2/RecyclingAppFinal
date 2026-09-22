import React from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { theme, isDarkMode, setDarkMode, user, logout } = useApp();

  const onLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.dark ? '#000000' : theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={[styles.backText, { color: theme.text }]}>{'‹'} Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>ACCOUNT SETTINGS</Text>
      <View style={[styles.card, { backgroundColor: theme.panel }]}>
        <Text style={[styles.cardRowText, { color: theme.text }]}>{user?.phone ?? 'Not set'}</Text>
        <View style={[styles.divider, { backgroundColor: theme.panelInput }]} />
        <TouchableOpacity onPress={onLogout}>
          <Text style={[styles.cardRowText, { color: theme.danger }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.subtext }]}>APPEARANCE</Text>
      <View style={[styles.card, styles.appearanceRow, { backgroundColor: theme.panel }]}>
        <Text style={[styles.cardRowText, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={setDarkMode} trackColor={{ true: '#34C759' }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', textAlign: 'center', marginVertical: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 18,
  },
  cardRowText: {
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 16,
  },
  divider: { height: 1, opacity: 0.6 },
  appearanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
