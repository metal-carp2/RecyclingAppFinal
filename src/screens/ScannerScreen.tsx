import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useApp } from '../context/AppContext';
import { fetchProductByBarcode, ScannedProduct } from '../services/openFoodFacts';
import { MATERIALS } from '../data/materials';

type Props = NativeStackScreenProps<RootStackParamList, 'Scanner'>;

function materialLabel(key: string | null): string {
  if (!key) return 'Unrecognized material';
  return MATERIALS.find((m) => m.key === key)?.label ?? key;
}

export default function ScannerScreen({ navigation }: Props) {
  const { theme } = useApp();
  const [permission, requestPermission] = useCameraPermissions();
  const [manualBarcode, setManualBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedProduct | null>(null);
  const scanLockRef = useRef(false);

  const isWeb = Platform.OS === 'web';

  const lookup = async (barcode: string) => {
    setLoading(true);
    setErrorMsg(null);
    setResult(null);
    const res = await fetchProductByBarcode(barcode);
    setLoading(false);
    if (res.status === 'found') {
      setResult(res.product);
    } else if (res.status === 'not_found') {
      setErrorMsg(`No product found on Open Food Facts for barcode ${barcode}.`);
    } else {
      setErrorMsg(res.message);
    }
  };

  const onBarcodeScanned = (scanned: { data: string }) => {
    if (scanLockRef.current) return;
    scanLockRef.current = true;
    lookup(scanned.data);
  };

  const scanAgain = () => {
    scanLockRef.current = false;
    setResult(null);
    setErrorMsg(null);
  };

  const sendToCalculator = () => {
    if (!result) return;
    const prefill = result.components
      .filter((c) => c.material && c.weightGrams)
      .map((c) => ({ material: c.material!, grams: c.weightGrams! }));
    navigation.navigate('Rewards', { prefill: prefill.length > 0 ? prefill : undefined });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
        <Text style={[styles.backText, { color: theme.text }]}>{'‹'} Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.title, { color: theme.text }]}>Scanner</Text>
        <Text style={[styles.subtitle, { color: theme.text }]}>
          Scan a product barcode to look up its packaging material via Open Food Facts.
        </Text>

        {!result && (
          <View style={styles.cameraWrap}>
            {isWeb ? (
              <View style={[styles.cameraPlaceholder, { backgroundColor: theme.panelInput }]}>
                <Text style={[styles.placeholderText, { color: theme.subtext }]}>
                  Camera scanning is available on iOS and Android. Enter a barcode below to test lookups here.
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
                barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
                onBarcodeScanned={onBarcodeScanned}
              />
            )}
          </View>
        )}

        <View style={styles.manualRow}>
          <TextInput
            style={[styles.manualInput, { backgroundColor: theme.panelInput, color: theme.text }]}
            placeholder="Or type a barcode, e.g. 3017620422003"
            placeholderTextColor={theme.subtext}
            keyboardType="number-pad"
            value={manualBarcode}
            onChangeText={setManualBarcode}
            onSubmitEditing={() => manualBarcode.trim() && lookup(manualBarcode.trim())}
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={() => manualBarcode.trim() && lookup(manualBarcode.trim())}
          >
            <Text style={styles.buttonText}>Look Up</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator color={theme.text} style={{ marginTop: 24 }} />}

        {errorMsg && <Text style={[styles.error, { color: theme.text }]}>{errorMsg}</Text>}

        {result && (
          <View style={[styles.resultCard, { backgroundColor: theme.panel }]}>
            <View style={styles.resultHeader}>
              {result.imageUrl && <Image source={{ uri: result.imageUrl }} style={styles.resultImage} />}
              <Text style={[styles.resultName, { color: theme.text }]}>{result.name}</Text>
            </View>

            {result.components.length === 0 ? (
              <Text style={[styles.placeholderText, { color: theme.subtext }]}>
                No packaging material data available for this item.
              </Text>
            ) : (
              result.components.map((c, idx) => (
                <View key={idx} style={styles.componentRow}>
                  <Text style={[styles.componentMaterial, { color: theme.text }]}>
                    {materialLabel(c.material)}
                    {c.shape ? ` • ${c.shape.replace(/-/g, ' ')}` : ''}
                  </Text>
                  <Text style={[styles.componentWeight, { color: theme.subtext }]}>
                    {c.weightGrams ? `${c.weightGrams.toFixed(0)} g` : 'weight unknown'}
                  </Text>
                </View>
              ))
            )}

            <TouchableOpacity style={[styles.button, { backgroundColor: theme.button, marginTop: 16 }]} onPress={sendToCalculator}>
              <Text style={styles.buttonText}>Send to Calculator</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanAgainRow} onPress={scanAgain}>
              <Text style={[styles.scanAgainText, { color: theme.text }]}>Scan another item</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  backRow: { paddingHorizontal: 20, paddingTop: 12 },
  backText: { fontSize: 18, fontWeight: '600' },
  scroll: { paddingHorizontal: 24, paddingBottom: 48 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 12 },
  subtitle: { fontSize: 15, fontWeight: '500', textAlign: 'center', marginTop: 8, marginHorizontal: 8 },
  cameraWrap: { height: 260, marginTop: 24, borderRadius: 20, overflow: 'hidden' },
  camera: { flex: 1 },
  cameraPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  placeholderText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  manualRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 12 },
  manualInput: { flex: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15 },
  button: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  error: { textAlign: 'center', fontWeight: '600', marginTop: 20 },
  resultCard: { borderRadius: 16, padding: 18, marginTop: 24 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  resultImage: { width: 48, height: 48, borderRadius: 8 },
  resultName: { fontSize: 19, fontWeight: '700', flexShrink: 1 },
  componentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  componentMaterial: { fontSize: 15, fontWeight: '600', flexShrink: 1, marginRight: 8 },
  componentWeight: { fontSize: 14, fontWeight: '600' },
  scanAgainRow: { alignItems: 'center', marginTop: 14 },
  scanAgainText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
});
