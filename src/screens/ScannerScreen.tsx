import React, { useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Scanner'>;

export default function ScannerScreen({ navigation }: Props) {
  const { theme } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [lastScan, setLastScan] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={[styles.backText, { color: theme.text }]}>{'‹'} Back</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: theme.text }]}>Scanner</Text>
      <Text style={[styles.subtitle, { color: theme.text }]}>
        Point your camera at a recycling symbol or barcode.
      </Text>

      <View style={styles.cameraWrap}>
        {isWeb ? (
          <View style={[styles.cameraPlaceholder, { backgroundColor: theme.panelInput }]}>
            <Text style={[styles.placeholderText, { color: theme.subtext }]}>
              Camera scanning is available on iOS and Android.
            </Text>
          </View>
        ) : !permission ? (
          <View style={[styles.cameraPlaceholder, { backgroundColor: theme.panelInput }]} />
        ) : !permission.granted ? (
          <View style={[styles.cameraPlaceholder, { backgroundColor: theme.panelInput }]}>
            <Text style={[styles.placeholderText, { color: theme.subtext }]}>
              Camera access is needed to scan items.
            </Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.button, marginTop: 16 }]}
              onPress={requestPermission}
            >
              <Text style={styles.buttonText}>Grant Camera Access</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
            onBarcodeScanned={(result) => setLastScan(result.data)}
          />
        )}
      </View>

      {lastScan && (
        <Text style={[styles.scanResult, { color: theme.text }]}>Last scanned: {lastScan}</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { fontSize: 18, fontWeight: '600' },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 15, fontWeight: '500', textAlign: 'center', marginTop: 8, marginHorizontal: 32 },
  cameraWrap: { flex: 1, marginHorizontal: 24, marginTop: 24, marginBottom: 24, borderRadius: 20, overflow: 'hidden' },
  camera: { flex: 1 },
  cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  placeholderText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  button: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  scanResult: { textAlign: 'center', fontWeight: '700', marginBottom: 16 },
});
