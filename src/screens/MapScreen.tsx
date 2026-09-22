import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { MATERIALS } from '../data/materials';
import {
  directionsUrl,
  fetchNearbyRecyclingCenters,
  LiveRecyclingCenter,
  NearbySearchResult,
} from '../services/recyclingCenters';

type Props = NativeStackScreenProps<RootStackParamList, 'Map'>;

type ScreenState =
  | { phase: 'idle' }
  | { phase: 'locating' }
  | { phase: 'searching' }
  | { phase: 'result'; result: NearbySearchResult };

function materialLabel(key: string): string {
  return MATERIALS.find((m) => m.key === key)?.label ?? key;
}

export default function MapScreen({ navigation }: Props) {
  const { theme } = useApp();
  const [state, setState] = useState<ScreenState>({ phase: 'idle' });

  const findNearby = useCallback(async () => {
    setState({ phase: 'locating' });
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setState({ phase: 'result', result: { status: 'permission_denied' } });
      return;
    }

    let position: Location.LocationObject;
    try {
      position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    } catch {
      setState({
        phase: 'result',
        result: { status: 'error', message: 'Could not determine your location.' },
      });
      return;
    }

    setState({ phase: 'searching' });
    const result = await fetchNearbyRecyclingCenters(
      position.coords.latitude,
      position.coords.longitude
    );
    setState({ phase: 'result', result });
  }, []);

  const renderCenter = ({ item }: { item: LiveRecyclingCenter }) => (
    <View style={[styles.card, { backgroundColor: theme.panel }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.distance, { color: theme.subtext }]}>{item.distanceMiles.toFixed(1)} mi</Text>
      </View>
      <Text style={[styles.materials, { color: theme.text }]}>
        {item.materialsUnknown
          ? 'Materials not listed on OpenStreetMap'
          : item.materials.length > 0
          ? `Accepts: ${item.materials.map(materialLabel).join(', ')}`
          : 'Accepts: not specified for this material set'}
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL(directionsUrl(item))}>
        <Text style={[styles.directions, { color: theme.text }]}>Get Directions {'→'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={[styles.backText, { color: theme.text }]}>{'‹'} Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Nearby Recycling Centers</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Real locations from OpenStreetMap, sorted by distance from you.
      </Text>

      {state.phase === 'idle' && (
        <TouchableOpacity style={[styles.button, { backgroundColor: theme.button }]} onPress={findNearby}>
          <Text style={styles.buttonText}>Find Centers Near Me</Text>
        </TouchableOpacity>
      )}

      {(state.phase === 'locating' || state.phase === 'searching') && (
        <View style={styles.centeredBlock}>
          <ActivityIndicator color={theme.text} size="large" />
          <Text style={[styles.statusText, { color: theme.text }]}>
            {state.phase === 'locating' ? 'Getting your location…' : 'Searching nearby…'}
          </Text>
        </View>
      )}

      {state.phase === 'result' && state.result.status === 'permission_denied' && (
        <View style={styles.centeredBlock}>
          <Text style={[styles.statusText, { color: theme.text }]}>
            Location access was denied, so we can't search near you. You can enable it in your
            device settings and try again.
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.button, marginTop: 16 }]} onPress={findNearby}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {state.phase === 'result' && state.result.status === 'error' && (
        <View style={styles.centeredBlock}>
          <Text style={[styles.statusText, { color: theme.text }]}>{state.result.message}</Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.button, marginTop: 16 }]} onPress={findNearby}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {state.phase === 'result' && state.result.status === 'ok' && state.result.centers.length === 0 && (
        <View style={styles.centeredBlock}>
          <Text style={[styles.statusText, { color: theme.text }]}>
            No recycling points are mapped on OpenStreetMap within about 25 miles of you.
            OpenStreetMap's recycling coverage is crowd-sourced and varies a lot by area — this
            doesn't necessarily mean there's nothing nearby, just that it hasn't been mapped yet.
          </Text>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.button, marginTop: 16 }]} onPress={findNearby}>
            <Text style={styles.buttonText}>Search Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {state.phase === 'result' && state.result.status === 'ok' && state.result.centers.length > 0 && (
        <FlatList
          data={state.result.centers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={renderCenter}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginTop: 6, marginHorizontal: 24 },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 24,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  centeredBlock: { alignItems: 'center', marginTop: 40, marginHorizontal: 32 },
  statusText: { fontSize: 15, fontWeight: '600', textAlign: 'center', lineHeight: 21 },
  list: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  card: { borderRadius: 14, padding: 16, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700', flexShrink: 1, marginRight: 8 },
  distance: { fontSize: 14, fontWeight: '600' },
  materials: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  directions: { fontSize: 14, fontWeight: '700', marginTop: 10, textDecorationLine: 'underline' },
});
