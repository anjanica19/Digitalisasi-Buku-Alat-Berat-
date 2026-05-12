import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Modal, Alert, ScrollView 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../data/api'; 

const LoginScreen = ({ navigation }) => {
  const [nim, setNim] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({ id: '', nim: '', nama: '', role: '' });

  const handleLogin = async () => {
    if (!nim) {
      Alert.alert("Peringatan", "NIM / NIP harus diisi!");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nim: nim.trim(), 
          role: role 
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Simpan data user hasil login ke state sementara untuk modal
        setUserData(result.data.user);
        setModalVisible(true);
      } else {
        Alert.alert("Login Gagal", result.message || "Data tidak ditemukan.");
      }
    } catch (error) {
      Alert.alert("Error Koneksi", "Gagal terhubung ke server. Pastikan Backend sudah RUN.");
      console.log("Login Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // INI BAGIAN PENTING: Simpan session sebelum pindah screen
  const handleStart = async () => {
    try {
      // Simpan data user ke storage agar ProfilScreen bisa baca
      await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      
      setModalVisible(false);
      navigation.replace('Main'); 
    } catch (error) {
      console.log("Error saving session:", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerSection}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="cog-refresh" size={50} color="#FFD700" />
        </View>
        <Text style={styles.title}>TAB Troubleshoot</Text>
        <Text style={styles.subtitle}>Polytechnic Astra</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, role === 'student' && styles.tabActive]} 
          onPress={() => setRole('student')}
        >
          <Text style={[styles.tabText, role === 'student' && styles.textNavy]}>Mahasiswa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, role === 'lecturer' && styles.tabActive]} 
          onPress={() => setRole('lecturer')}
        >
          <Text style={[styles.tabText, role === 'lecturer' && styles.textNavy]}>Dosen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>{role === 'student' ? "NIM Mahasiswa" : "NIP Dosen"}</Text>
        <View style={styles.inputWrapper}>
           <MaterialCommunityIcons name="account-hard-hat" size={20} color="#003366" style={{marginRight: 10}} />
           <TextInput 
            style={styles.input} 
            placeholder={role === 'student' ? "Contoh: 0325260032" : "Contoh: 19900101"}
            placeholderTextColor="#999"
            value={nim} 
            onChangeText={setNim}
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity style={styles.forgotBtn}>
          <Text style={styles.forgotText}>Lupa password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.loginBtn, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#003366" />
          ) : (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Text style={styles.loginBtnText}>MASUK </Text>
               <MaterialCommunityIcons name="login-variant" size={20} color="#003366" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="shield-check" size={60} color="#FFD700" />
            </View>
            <Text style={styles.welcomeTxt}>Akses Diizinkan,</Text>
            <Text style={styles.nameTxt}>{userData.nama}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {userData.role?.trim().toUpperCase()}
              </Text>
            </View>
            <Text style={styles.infoTxt}>Database digital manual alat berat kini sinkron dengan akun Anda.</Text>
            <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
              <Text style={styles.startBtnText}>Mulai Diagnosa</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#003366" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFF', padding: 25, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  iconBox: { backgroundColor: '#003366', padding: 20, borderRadius: 25, marginBottom: 15, elevation: 5 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#003366', letterSpacing: 0.5 },
  subtitle: { fontSize: 16, color: '#666', fontWeight: '500' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 15, padding: 6, marginBottom: 30 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FFD700', elevation: 2 },
  tabText: { color: '#888', fontWeight: 'bold' },
  textNavy: { color: '#003366' },
  form: { width: '100%' },
  label: { marginBottom: 8, fontWeight: 'bold', color: '#003366' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE' },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#000' },
  forgotBtn: { alignSelf: 'flex-end', marginVertical: 20 },
  forgotText: { color: '#003366', fontWeight: 'bold', textDecorationLine: 'underline' },
  loginBtn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 15, alignItems: 'center' },
  loginBtnText: { color: '#003366', fontWeight: '900', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,51,102,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center' },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', marginTop: -80, borderWidth: 6, borderColor: '#FFF' },
  welcomeTxt: { fontSize: 14, color: '#888', marginTop: 15 },
  nameTxt: { fontSize: 24, fontWeight: 'bold', color: '#003366', textAlign: 'center' },
  roleBadge: { backgroundColor: '#FFD700', paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginVertical: 15 },
  roleBadgeText: { color: '#003366', fontWeight: '900', fontSize: 12 },
  infoTxt: { textAlign: 'center', color: '#666', marginBottom: 25 },
  startBtn: { flexDirection: 'row', backgroundColor: '#FFD700', width: '100%', padding: 18, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  startBtnText: { color: '#003366', fontWeight: '900', fontSize: 18, marginRight: 10 }
});

export default LoginScreen;