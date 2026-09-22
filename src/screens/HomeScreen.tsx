import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const NAV_ITEMS: { label: string; route: keyof RootStackParamList; icon: string }[] = [
  { label: 'Scanner', route: 'Scanner', icon: '≣' },
  { label: 'Map', route: 'Map', icon: '▢' },
  { label: 'Rewards', route: 'Rewards', icon: '♦' },
  { label: 'Settings', route: 'Settings', icon: '⚙' },
];

export default function HomeScreen({ navigation }: Props) {
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Save the planet</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>Make the earth clean again.</Text>

        <View style={styles.navList}>
          {NAV_ITEMS.map((item) => (
            <View key={item.route} style={styles.navRow}>
              <Text style={[styles.navIcon, { color: theme.text }]}>{item.icon}</Text>
              <TouchableOpacity
                style={[styles.navButton, { backgroundColor: theme.button }]}
                onPress={() => navigation.navigate(item.route as never)}
              >
                <Text style={styles.navButtonText}>{item.label}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },
  title: { fontSize: 40, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 17, fontWeight: '600', textAlign: 'center', marginBottom: 56 },
  navList: { gap: 24 },
  navRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  navIcon: { fontSize: 26, width: 40 },
  navButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  navButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
});
