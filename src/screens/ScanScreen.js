import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity,  
  ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator'; 
import * as ImagePicker from 'expo-image-picker'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState('off'); // State untuk Flash (on/off)
  const cameraRef = useRef(null);
  const isFocused = useIsFocused(); 

  // UI Izin Kamera
  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="camera-off" size={60} color="#666" />
        <Text style={styles.whiteT}>Akses kamera diperlukan.</Text>
        <TouchableOpacity style={styles.requestBtn} onPress={requestPermission}>
          <Text style={styles.requestBtnT}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Filter Kode Error (Contoh: CA145, E10)
  const validateAndExtractCode = (rawText) => {
    const cleanText = rawText.replace(/\s+/g, '').toUpperCase();
    const regex = /([A-Z]{1,3}\d{1,5})/; 
    const matches = cleanText.match(regex);
    return (matches) ? matches[0] : null;
  };

  // FUNGSI UTAMA OCR (Dipakai Kamera & Galeri)
  const performOCR = async (base64Data) => {
    try {
      const apiKey = "K84623724388957"; 
      const formData = new FormData();
      formData.append("base64Image", `data:image/jpg;base64,${base64Data}`);
      formData.append("apikey", apiKey);
      formData.append("language", "eng");
      formData.append("OCREngine", "2");

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.OCRExitCode === 1) {
        const fullText = result.ParsedResults[0].ParsedText;
        const validCode = validateAndExtractCode(fullText);

        if (validCode) {
          Alert.alert("Kode Ditemukan", `Berhasil mengenali kode: ${validCode}`, [
            { text: "Analisis Sekarang", onPress: () => navigation.navigate('Chat', { scannedCode: validCode }) }
          ]);
        } else {
          Alert.alert("Gagal", "Kode failure tidak ditemukan. Pastikan teks berada tepat di dalam kotak.");
        }
      } else {
        Alert.alert("Error", "Gagal memproses gambar. Pastikan gambar jelas.");
      }
    } catch (error) {
      Alert.alert("Koneksi Error", "Cek koneksi internet Anda.");
    } finally {
      setLoading(false);
    }
  };

  // SCAN VIA KAMERA
  const handleScan = async () => {
    if (!cameraRef.current || loading) return;
    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });

      // Hitung rasio untuk cropping yang presisi
      const factorX = photo.width / SCREEN_WIDTH;
      const factorY = photo.height / SCREEN_HEIGHT;

      const cropWidth = (SCREEN_WIDTH * 0.8) * factorX;
      const cropHeight = 130 * factorY;
      const originX = (photo.width - cropWidth) / 2;
      const originY = (photo.height / 2.5) - (cropHeight / 2);

      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { base64: true, compress: 0.5 }
      );

      await performOCR(manipulated.base64);
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", "Gagal mengambil gambar.");
    }
  };

  // SCAN VIA GALERI
  const handlePickImage = async () => {
    // Meminta izin galeri
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Izin Ditolak", "Akses galeri diperlukan untuk fitur ini.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setLoading(true);
      await performOCR(result.assets[0].base64);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="chevron-left" size={35} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>FAILURE CODE SCANNER</Text>
            <Text style={styles.headerSub}>Excavator Monitor System</Text>
          </View>
          <View style={{width: 35}} />
        </View>

        {/* CAMERA AREA */}
        <View style={styles.cameraArea}>
          {isFocused && (
            <>
              <CameraView 
                ref={cameraRef} 
                style={StyleSheet.absoluteFill} 
                facing="back"
                enableTorch={flash === 'on'} 
              />
              <View style={styles.overlayContainer} pointerEvents="box-none">
                <View style={styles.maskDark} />
                <View style={styles.maskCenterRow}>
                  <View style={styles.maskDark} />
                  <View style={styles.targetFrame}>
                    <View style={styles.cornerTL} /><View style={styles.cornerTR} />
                    <View style={styles.cornerBL} /><View style={styles.cornerBR} />
                    {loading && <ActivityIndicator size="large" color="#FFD700" />}
                  </View>
                  <View style={styles.maskDark} />
                </View>
                <View style={[styles.maskDark, { alignItems: 'center', paddingTop: 20 }]}>
                  <Text style={styles.hintT}>POSISIKAN KODE ERROR MONITOR DI DALAM KOTAK</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* BOTTOM PANEL */}
        <View style={styles.bottomPanel}>
          <Text style={styles.instruction}>
            Scan kode kerusakan yang muncul pada panel monitor alat berat untuk mendapatkan analisis perbaikan.
          </Text>

          <View style={styles.actionRow}>
             {/* TOMBOL GALERI */}
             <TouchableOpacity style={styles.sideBtn} onPress={handlePickImage} disabled={loading}>
                <MaterialCommunityIcons name="image-plus" size={30} color="#FFD700" />
                <Text style={styles.sideText}>Galeri</Text>
             </TouchableOpacity>
             
             {/* TOMBOL SCAN UTAMA */}
             <TouchableOpacity 
               onPress={handleScan} 
               disabled={loading} 
               style={[styles.mainBtn, {backgroundColor: loading ? '#444' : '#FFD700'}]}
             >
                <MaterialCommunityIcons name="camera-iris" size={50} color="#003366" />
             </TouchableOpacity>

             {/* TOMBOL FLASH */}
             <TouchableOpacity 
                style={styles.sideBtn} 
                onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
             >
                <MaterialCommunityIcons 
                  name={flash === 'on' ? "flashlight" : "flashlight-off"} 
                  size={30} 
                  color={flash === 'on' ? "#FFD700" : "#555"} 
                />
                <Text style={[styles.sideText, {color: flash === 'on' ? "#FFD700" : "#555"}]}>Flash</Text>
             </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  whiteT: { color: 'white', marginTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 0.5, borderBottomColor: '#222' },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { color: 'white', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  headerSub: { color: '#FFD700', fontSize: 10, fontWeight: 'bold' },
  cameraArea: { flex: 1 },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  maskDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  maskCenterRow: { flexDirection: 'row', height: 130 },
  targetFrame: { width: SCREEN_WIDTH * 0.8, height: 130, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 5, borderLeftWidth: 5, borderColor: '#FFD700' },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 5, borderRightWidth: 5, borderColor: '#FFD700' },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: '#FFD700' },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 5, borderRightWidth: 5, borderColor: '#FFD700' },
  hintT: { color: '#FFD700', fontWeight: 'bold', fontSize: 10, letterSpacing: 1, textAlign: 'center', paddingHorizontal: 20 },
  bottomPanel: { backgroundColor: '#111', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  instruction: { color: '#888', fontSize: 11, textAlign: 'center', marginBottom: 25, lineHeight: 16 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  mainBtn: { padding: 12, borderRadius: 60, elevation: 15, shadowColor: '#FFD700', shadowOpacity: 0.3, shadowRadius: 10 },
  sideBtn: { alignItems: 'center', width: 60 },
  sideText: { color: '#FFD700', fontSize: 10, marginTop: 5, fontWeight: 'bold' },
  requestBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 25, marginTop: 20 },
  requestBtnT: { fontWeight: 'bold', color: '#003366' }
});