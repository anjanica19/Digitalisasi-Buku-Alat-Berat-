import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImageManipulator from 'expo-image-manipulator'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

export default function ScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [detectedCode, setDetectedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const isFocused = useIsFocused(); 

  // UI State: Izin Kamera
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

  // Fungsi Filter Teks: Mencari pola kode error (Huruf-Angka)
  const validateAndExtractCode = (rawText) => {
    // Mencari pola 1-3 huruf kapital diikuti 2-5 angka (Contoh: CA145, E10, DW202)
    const regex = /\b([A-Z]{1,3}\d{2,5})\b/i; 
    const matches = rawText.match(regex);
    return (matches) ? matches[0].toUpperCase() : null;
  };

  const handleScan = async () => {
    if (!cameraRef.current || loading) return;

    try {
      setLoading(true);
      
      // 1. Ambil Foto
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });

      // 2. Crop Foto (Hanya mengambil area di dalam kotak kuning)
      const cropWidth = photo.width * 0.75; 
      const cropHeight = photo.height * 0.15;
      const originX = (photo.width - cropWidth) / 2;
      const originY = (photo.height - cropHeight) / 2.5;

      const manipulated = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
        { base64: true, compress: 0.5 }
      );

      // 3. Kirim ke OCR Space API
      // PENTING: Ganti dengan API Key pribadi lo (dapat dari email ocr.space)
      const apiKey = "helloworld"; // GANTI PAKE KEY LO SENDIRI
      
      const formData = new FormData();
      formData.append("base64Image", `data:image/jpg;base64,${manipulated.base64}`);
      formData.append("apikey", apiKey);
      formData.append("isOverlayRequired", "false");
      formData.append("OCREngine", "1"); 

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.OCRExitCode === 1) {
        const fullText = result.ParsedResults[0].ParsedText;
        const validCode = validateAndExtractCode(fullText);

        if (validCode) {
          setDetectedCode(validCode);
          // Langsung pindah ke halaman Chat untuk diagnosa
          navigation.navigate('Chat', { scannedCode: validCode });
        } else {
          Alert.alert("Gagal Scan", "Pola kode tidak dikenali. Pastikan teks terlihat jelas.");
        }
      } else {
        const errorMsg = result.ErrorMessage ? result.ErrorMessage[0] : "Limit API Habis atau Key Salah";
        Alert.alert("Server Error", errorMsg);
      }
    } catch (error) {
      Alert.alert("Koneksi Error", "Cek koneksi internet anda.");
    } finally {
      setLoading(false);
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
          <Text style={styles.headerTitle}>SCANNER DIAGNOSTIC</Text>
          <View style={{width: 35}} />
        </View>

        {/* CAMERA AREA */}
        <View style={styles.cameraArea}>
          {isFocused && (
            <>
              <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
              {/* UI Overlay Frame (Ditaruh di luar CameraView agar tidak warning) */}
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
                  <Text style={styles.hintT}>{loading ? "MENGENALI KODE..." : "POSISIKAN KODE DI DALAM KOTAK"}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* BOTTOM PANEL */}
        <View style={styles.bottomPanel}>
          <Text style={styles.label}>HASIL DETEKSI / INPUT MANUAL:</Text>
          <View style={styles.inputRow}>
            <TextInput 
              style={styles.input} 
              placeholder="Contoh: CA145" 
              placeholderTextColor="#555" 
              value={detectedCode}
              onChangeText={(txt) => setDetectedCode(txt.toUpperCase())}
            />
            <TouchableOpacity 
               style={styles.goBtn} 
               onPress={() => { if(detectedCode) navigation.navigate('Chat', { scannedCode: detectedCode }); }}
            >
              <MaterialCommunityIcons name="arrow-right-bold" size={24} color="#003366" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
             <View style={styles.sideBtn}><MaterialCommunityIcons name="image" size={28} color="#333" /></View>
             
             <TouchableOpacity 
               onPress={handleScan} 
               disabled={loading} 
               style={[styles.mainBtn, {backgroundColor: loading ? '#444' : '#FFD700'}]}
             >
                <MaterialCommunityIcons name="camera-iris" size={50} color={loading ? "#888" : "#003366"} />
             </TouchableOpacity>

             <View style={styles.sideBtn}><MaterialCommunityIcons name="flashlight" size={28} color="#333" /></View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  headerTitle: { color: 'white', fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
  cameraArea: { flex: 1 },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  maskDark: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  maskCenterRow: { flexDirection: 'row', height: 130 },
  targetFrame: { width: width * 0.8, height: 130, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  // Frame Corners
  cornerTL: { position: 'absolute', top: 0, left: 0, width: 25, height: 25, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#FFD700' },
  cornerTR: { position: 'absolute', top: 0, right: 0, width: 25, height: 25, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#FFD700' },
  cornerBL: { position: 'absolute', bottom: 0, left: 0, width: 25, height: 25, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#FFD700' },
  cornerBR: { position: 'absolute', bottom: 0, right: 0, width: 25, height: 25, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#FFD700' },
  
  hintT: { color: '#FFD700', fontWeight: 'bold', fontSize: 11, letterSpacing: 1 },
  bottomPanel: { backgroundColor: '#111', padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  label: { color: '#444', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 15, alignItems: 'center', paddingLeft: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, color: '#FFD700', height: 50, fontWeight: 'bold', fontSize: 18 },
  goBtn: { backgroundColor: '#FFD700', width: 45, height: 45, borderRadius: 10, justifyContent: 'center', alignItems: 'center', margin: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  mainBtn: { padding: 10, borderRadius: 50, elevation: 10 },
  sideBtn: { width: 50, alignItems: 'center' },
  requestBtn: { backgroundColor: '#FFD700', padding: 15, borderRadius: 25, marginTop: 20 },
  requestBtnT: { fontWeight: 'bold' }
});