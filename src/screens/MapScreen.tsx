import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { RECYCLING_CENTERS } from '../data/recyclingCenters';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

export default function MapScreen({ navigation }: Props) {
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={[styles.backText, { color: theme.text }]}>{'‹'} Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Nearby Recycling Centers</Text>

      <FlatList
        data={RECYCLING_CENTERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.panel }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
              <Text style={[styles.distance, { color: theme.subtext }]}>{item.distanceMiles} mi</Text>
            </View>
            <Text style={[styles.address, { color: theme.subtext }]}>{item.address}</Text>
            <Text style={[styles.materials, { color: theme.text }]}>
              Accepts: {item.acceptedMaterials.join(', ')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginVertical: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  card: { borderRadius: 14, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  distance: { fontSize: 14, fontWeight: '600' },
  address: { fontSize: 14, marginTop: 4 },
  materials: { fontSize: 14, fontWeight: '600', marginTop: 8 },
});
