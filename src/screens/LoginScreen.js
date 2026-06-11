import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Alert, ScrollView,
  KeyboardAvoidingView, Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../data/api';

const NAVY = '#003366';
const GOLD = '#FFD700';

const LoginScreen = ({ navigation }) => {
  const [nim, setNim]           = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState({ nim: '', nama: '', role: '' });

  const handleLogin = async () => {
    if (!nim.trim())      { Alert.alert('Warning', 'Student ID / Lecturer ID is required!'); return; }
    if (!password.trim()) { Alert.alert('Warning', 'Password is required!'); return; }

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nim: nim.trim(), password }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setUserData(result.data.user);
        setModalVisible(true);
      } else {
        Alert.alert('Login Failed', result.message || 'Incorrect Student ID or password.');
      }
    } catch {
      Alert.alert('Connection Error', 'Unable to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    try {
      await AsyncStorage.setItem('user_session', JSON.stringify(userData));
      setModalVisible(false);
      navigation.replace('Main');
    } catch (e) {
      console.log('Error saving session:', e);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.headerSection}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="cog-refresh" size={50} color={GOLD} />
          </View>
          <Text style={styles.title}>TAB Troubleshoot</Text>
          <Text style={styles.subtitle}>Polytechnic Astra</Text>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.label}>Student ID / Lecturer ID</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="account-hard-hat" size={20} color={NAVY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. 0920240012"
              placeholderTextColor="#999"
              value={nim}
              onChangeText={setNim}
              keyboardType="numeric"
              returnKeyType="next"
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Password</Text>
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="lock-outline" size={20} color={NAVY} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass(p => !p)}>
              <MaterialCommunityIcons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, { opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={NAVY} />
            ) : (
              <View style={styles.btnInner}>
                <Text style={styles.loginBtnText}>SIGN IN</Text>
                <MaterialCommunityIcons name="login-variant" size={20} color={NAVY} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* WELCOME MODAL */}
        <Modal animationType="fade" transparent visible={modalVisible}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="shield-check" size={60} color={GOLD} />
              </View>
              <Text style={styles.welcomeTxt}>Access Granted,</Text>
              <Text style={styles.nameTxt}>{userData.nama}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{userData.role?.trim().toUpperCase()}</Text>
              </View>
              <Text style={styles.infoTxt}>
                The heavy equipment digital manual is now synced with your account.
              </Text>
              <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
                <Text style={styles.startBtnText}>Start Diagnosis</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={NAVY} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:      { flexGrow: 1, backgroundColor: '#FFF', padding: 25, justifyContent: 'center' },
  headerSection:  { alignItems: 'center', marginBottom: 40 },
  iconBox:        { backgroundColor: NAVY, padding: 20, borderRadius: 25, marginBottom: 15, elevation: 5 },
  title:          { fontSize: 26, fontWeight: 'bold', color: NAVY, letterSpacing: 0.5 },
  subtitle:       { fontSize: 16, color: '#666', fontWeight: '500' },
  form:           { width: '100%' },
  label:          { marginBottom: 8, fontWeight: 'bold', color: NAVY },
  inputWrapper:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 15, paddingHorizontal: 15, borderWidth: 1, borderColor: '#EEE' },
  inputIcon:      { marginRight: 10 },
  input:          { flex: 1, paddingVertical: 15, fontSize: 16, color: '#000' },
  forgotBtn:      { alignSelf: 'flex-end', marginVertical: 20 },
  forgotText:     { color: NAVY, fontWeight: 'bold', textDecorationLine: 'underline' },
  loginBtn:       { backgroundColor: GOLD, padding: 18, borderRadius: 15, alignItems: 'center' },
  loginBtnText:   { color: NAVY, fontWeight: '900', fontSize: 18 },
  btnInner:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  registerRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerHint:   { color: '#666', fontSize: 14 },
  registerLink:   { color: NAVY, fontWeight: 'bold', fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,51,102,0.85)', justifyContent: 'center', alignItems: 'center' },
  modalContent:   { width: '85%', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center' },
  iconCircle:     { width: 100, height: 100, borderRadius: 50, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center', marginTop: -80, borderWidth: 6, borderColor: '#FFF' },
  welcomeTxt:     { fontSize: 14, color: '#888', marginTop: 15 },
  nameTxt:        { fontSize: 24, fontWeight: 'bold', color: NAVY, textAlign: 'center' },
  roleBadge:      { backgroundColor: GOLD, paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20, marginVertical: 15 },
  roleBadgeText:  { color: NAVY, fontWeight: '900', fontSize: 12 },
  infoTxt:        { textAlign: 'center', color: '#666', marginBottom: 25 },
  startBtn:       { flexDirection: 'row', backgroundColor: GOLD, width: '100%', padding: 18, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  startBtnText:   { color: NAVY, fontWeight: '900', fontSize: 18, marginRight: 10 },
});

export default LoginScreen;