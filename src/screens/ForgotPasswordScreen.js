import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, Animated,
  KeyboardAvoidingView, Platform
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_ENDPOINTS } from '../data/api';

const NAVY  = '#003366';
const GOLD  = '#FFD700';
const RED   = '#E53935';
const GREEN = '#2E7D32';

// ─── Password rules ────────────────────────────────────────────────
const passwordRules = [
  { key: 'length', label: 'At least 8 characters',       test: p => p.length >= 8 },
  { key: 'upper',  label: 'Contains an uppercase letter', test: p => /[A-Z]/.test(p) },
  { key: 'number', label: 'Contains a number',            test: p => /[0-9]/.test(p) },
];

const PasswordChecklist = ({ password }) => (
  <View style={styles.checklist}>
    {passwordRules.map(rule => {
      const passed = rule.test(password);
      return (
        <View key={rule.key} style={styles.checkRow}>
          <MaterialCommunityIcons
            name={passed ? 'check-circle' : 'close-circle'}
            size={16}
            color={passed ? GREEN : (password.length > 0 ? RED : '#CCC')}
          />
          <Text style={[styles.checkText, { color: passed ? GREEN : (password.length > 0 ? RED : '#AAA') }]}>
            {rule.label}
          </Text>
        </View>
      );
    })}
  </View>
);

// ─── Step Indicator ────────────────────────────────────────────────
const STEP_LABELS = ['Find Account', 'Security Questions', 'New Password'];

const StepIndicator = ({ current }) => (
  <View style={styles.stepContainer}>
    <View style={styles.stepRow}>
      {[1, 2, 3].map(s => (
        <View key={s} style={styles.stepGroup}>
          <View style={[styles.stepDot, current >= s ? styles.stepDotActive : styles.stepDotInactive]}>
            {current > s
              ? <MaterialCommunityIcons name="check" size={13} color={NAVY} />
              : <Text style={[styles.stepNum, { color: current === s ? NAVY : '#AAA' }]}>{s}</Text>
            }
          </View>
          {s < 3 && (
            <View style={[styles.stepLine, current > s ? styles.stepLineActive : styles.stepLineInactive]} />
          )}
        </View>
      ))}
    </View>
    <Text style={styles.stepLabel}>{STEP_LABELS[current - 1]}</Text>
  </View>
);

// ─── User Card (reusable) ─────────────────────────────────────────
const UserCard = ({ nama, nim, verified = false }) => (
  <View style={styles.userCard}>
    <View style={styles.userAvatar}>
      <Text style={styles.userAvatarText}>
        {nama ? nama.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U'}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.userCardName}>{nama}</Text>
      <Text style={styles.userCardNim}>ID: {nim}</Text>
    </View>
    <View style={[styles.verifiedBadge, verified && styles.verifiedBadgeGreen]}>
      <MaterialCommunityIcons
        name={verified ? 'shield-check' : 'check-circle'}
        size={15}
        color={verified ? GREEN : '#2E7D32'}
      />
      <Text style={[styles.verifiedText, verified && { color: GREEN }]}>
        {verified ? 'Verified' : 'Found'}
      </Text>
    </View>
  </View>
);

// ═════════════════════════════════════════════════════════════════
// SCREEN UTAMA
// ═════════════════════════════════════════════════════════════════
const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Step 1
  const [nim, setNim] = useState('');

  // Data dari API
  const [namaUser, setNamaUser]   = useState('');
  const [questions, setQuestions] = useState({
    q1: { id: 0, text: '' },
    q2: { id: 0, text: '' },
    q3: { id: 0, text: '' },
  });

  // Step 2 — jawaban security questions
  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');

  // Step 3 — password baru
  const [newPass, setNewPass]         = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordValid = passwordRules.every(r => r.test(newPass));

  // ── Animasi transisi ───────────────────────────────────────────
  const goToStep = next => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(next), 120);
  };

  const handleBack = () => {
    if (step === 1) navigation.goBack();
    else goToStep(step - 1);
  };

  // ════════════════════════════════════════════════════════════════
  // STEP 1: Cari akun by NIM
  // ════════════════════════════════════════════════════════════════
  const handleFindAccount = async () => {
    if (!nim.trim()) { Alert.alert('Warning', 'Student ID / Lecturer ID is required!'); return; }
    setLoading(true);
    try {
      const res    = await fetch(API_ENDPOINTS.forgotPassword, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nim: nim.trim() }),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setNamaUser(result.nama || '');
        setQuestions({
          q1: { id: result.q1.id, text: result.q1.text },
          q2: { id: result.q2.id, text: result.q2.text },
          q3: { id: result.q3.id, text: result.q3.text },
        });
        goToStep(2);
      } else {
        Alert.alert('Not Found', result.message || 'Account not registered.');
      }
    } catch {
      Alert.alert('Connection Error', 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // ════════════════════════════════════════════════════════════════
  // STEP 2: Verifikasi jawaban security questions
  // ════════════════════════════════════════════════════════════════
  const handleVerifyAnswers = () => {
    if (!a1.trim() || !a2.trim() || !a3.trim()) {
      Alert.alert('Warning', 'All security answers are required.');
      return;
    }
    // Lanjut ke step 3 — verifikasi jawaban dilakukan saat submit akhir
    goToStep(3);
  };

  // ════════════════════════════════════════════════════════════════
  // STEP 3: Submit reset password
  // ════════════════════════════════════════════════════════════════
  const handleResetPassword = async () => {
    if (!passwordValid) {
      Alert.alert('Warning', 'Password does not meet all requirements.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Warning', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res    = await fetch(API_ENDPOINTS.verifyReset, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          nim:             nim.trim(),
          a1Id:            questions.q1.id, a1: a1.trim(),
          a2Id:            questions.q2.id, a2: a2.trim(),
          a3Id:            questions.q3.id, a3: a3.trim(),
          newPassword:     newPass,
          confirmPassword: confirmPass,
        }),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        Alert.alert(
          '✅ Success!',
          'Your password has been reset. Please sign in with your new password.',
          [{ text: 'Sign In Now', onPress: () => navigation.replace('Login') }]
        );
      } else {
        // Kalau jawaban salah, balik ke step 2
        Alert.alert(
          'Verification Failed',
          result.message || 'Incorrect answers. Please go back and try again.',
          [
            { text: 'Try Again', onPress: () => goToStep(2) },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      }
    } catch {
      Alert.alert('Connection Error', 'Unable to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.headerSection}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialCommunityIcons name="chevron-left" size={28} color={NAVY} />
          </TouchableOpacity>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons name="lock-reset" size={50} color={GOLD} />
          </View>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>TAB Troubleshoot · Polytechnic Astra</Text>
        </View>

        {/* STEP INDICATOR */}
        <StepIndicator current={step} />

        <Animated.View style={{ opacity: fadeAnim }}>

          {/* ══ STEP 1: FIND ACCOUNT ════════════════════════════════ */}
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.cardDesc}>
                Enter your Student ID or Lecturer ID. We'll show you your security questions to verify your identity.
              </Text>

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
                  returnKeyType="done"
                  onSubmitEditing={handleFindAccount}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1, marginTop: 24 }]}
                onPress={handleFindAccount}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={NAVY} /> : (
                  <View style={styles.btnInner}>
                    <Text style={styles.primaryBtnText}>FIND ACCOUNT</Text>
                    <MaterialCommunityIcons name="account-search" size={18} color={NAVY} />
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.backToLoginBtn} onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={15} color={NAVY} />
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 2: SECURITY QUESTIONS ══════════════════════════ */}
          {step === 2 && (
            <View>
              <UserCard nama={namaUser} nim={nim} verified={false} />

              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={18} color={NAVY} />
                  <Text style={styles.sectionTitle}>Answer Security Questions</Text>
                </View>
                <Text style={styles.cardDesc}>
                  Answer all three questions exactly as you did when registering.
                </Text>

                {[
                  { q: questions.q1, val: a1, set: setA1 },
                  { q: questions.q2, val: a2, set: setA2 },
                  { q: questions.q3, val: a3, set: setA3 },
                ].map((item, i) => (
                  <View key={i} style={styles.questionBlock}>
                    <View style={styles.questionLabelRow}>
                      <View style={styles.qNum}>
                        <Text style={styles.qNumText}>{i + 1}</Text>
                      </View>
                      <Text style={styles.questionText}>{item.q.text}</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <MaterialCommunityIcons name="pencil-outline" size={18} color={NAVY} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Your answer..."
                        placeholderTextColor="#999"
                        value={item.val}
                        onChangeText={item.set}
                      />
                    </View>
                  </View>
                ))}

                <View style={styles.hintBox}>
                  <MaterialCommunityIcons name="information-outline" size={14} color="#555" />
                  <Text style={styles.hintBoxText}>
                    Answers are not case-sensitive. "Jakarta" and "jakarta" are treated the same.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleVerifyAnswers}
              >
                <View style={styles.btnInner}>
                  <Text style={styles.primaryBtnText}>NEXT</Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={NAVY} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* ══ STEP 3: NEW PASSWORD ════════════════════════════════ */}
          {step === 3 && (
            <View>
              <UserCard nama={namaUser} nim={nim} verified={true} />

              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="lock-outline" size={18} color={NAVY} />
                  <Text style={styles.sectionTitle}>Set New Password</Text>
                </View>

                {/* Read-only auto-fill */}
                <Text style={styles.label}>Full Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: '#F0F0F0', marginBottom: 14 }]}>
                  <MaterialCommunityIcons name="account-outline" size={18} color="#AAA" style={styles.inputIcon} />
                  <TextInput style={[styles.input, { color: '#AAA' }]} value={namaUser} editable={false} />
                  <MaterialCommunityIcons name="lock-outline" size={14} color="#CCC" />
                </View>

                <Text style={styles.label}>Student ID / Lecturer ID</Text>
                <View style={[styles.inputWrapper, { backgroundColor: '#F0F0F0', marginBottom: 20 }]}>
                  <MaterialCommunityIcons name="account-hard-hat-outline" size={18} color="#AAA" style={styles.inputIcon} />
                  <TextInput style={[styles.input, { color: '#AAA' }]} value={nim} editable={false} />
                  <MaterialCommunityIcons name="lock-outline" size={14} color="#CCC" />
                </View>

                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color={NAVY} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Create a strong password"
                    placeholderTextColor="#999"
                    value={newPass}
                    onChangeText={setNewPass}
                    secureTextEntry={!showNew}
                  />
                  <TouchableOpacity onPress={() => setShowNew(p => !p)}>
                    <MaterialCommunityIcons
                      name={showNew ? 'eye-off-outline' : 'eye-outline'}
                      size={20} color="#999"
                    />
                  </TouchableOpacity>
                </View>
                <PasswordChecklist password={newPass} />

                <Text style={[styles.label, { marginTop: 8 }]}>Confirm New Password</Text>
                <View style={[
                  styles.inputWrapper,
                  confirmPass.length > 0 && newPass !== confirmPass ? styles.inputError : null
                ]}>
                  <MaterialCommunityIcons name="lock-check-outline" size={20} color={NAVY} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#999"
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(p => !p)}>
                    <MaterialCommunityIcons
                      name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20}
                      color={confirmPass.length > 0 ? (newPass === confirmPass ? GREEN : RED) : '#999'}
                    />
                  </TouchableOpacity>
                </View>
                {confirmPass.length > 0 && newPass !== confirmPass && (
                  <Text style={styles.errorText}>Passwords do not match.</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, { opacity: loading ? 0.7 : 1 }]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color={NAVY} /> : (
                  <View style={styles.btnInner}>
                    <Text style={styles.primaryBtnText}>RESET PASSWORD</Text>
                    <MaterialCommunityIcons name="shield-check" size={18} color={NAVY} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container:        { flexGrow: 1, backgroundColor: '#F8F9FA', padding: 20, paddingTop: 50 },
  headerSection:    { alignItems: 'center', marginBottom: 20 },
  backBtn:          { position: 'absolute', left: -5, top: 0, padding: 6 },
  iconBox:          { backgroundColor: NAVY, padding: 18, borderRadius: 25, marginBottom: 14, elevation: 5 },
  title:            { fontSize: 24, fontWeight: 'bold', color: NAVY, letterSpacing: 0.5 },
  subtitle:         { fontSize: 13, color: '#666', marginTop: 4 },
  // Step indicator
  stepContainer:    { marginBottom: 20 },
  stepRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  stepGroup:        { flexDirection: 'row', alignItems: 'center' },
  stepDot:          { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepDotActive:    { backgroundColor: GOLD },
  stepDotInactive:  { backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#DDD' },
  stepNum:          { fontSize: 13, fontWeight: 'bold' },
  stepLine:         { width: 44, height: 2, marginHorizontal: 4 },
  stepLineActive:   { backgroundColor: GOLD },
  stepLineInactive: { backgroundColor: '#DDD' },
  stepLabel:        { textAlign: 'center', fontSize: 13, fontWeight: 'bold', color: NAVY },
  // User card
  userCard:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#EEE', gap: 12, elevation: 1 },
  userAvatar:       { width: 44, height: 44, borderRadius: 22, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center' },
  userAvatarText:   { color: GOLD, fontWeight: 'bold', fontSize: 15 },
  userCardName:     { fontWeight: 'bold', color: NAVY, fontSize: 14 },
  userCardNim:      { color: '#666', fontSize: 12 },
  verifiedBadge:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  verifiedBadgeGreen: { backgroundColor: '#C8E6C9' },
  verifiedText:     { fontSize: 11, fontWeight: 'bold', color: '#2E7D32' },
  // Card
  card:             { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#EEE', elevation: 1 },
  cardDesc:         { fontSize: 13, color: '#666', lineHeight: 20, marginBottom: 16 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionTitle:     { fontSize: 14, fontWeight: 'bold', color: NAVY },
  // Questions
  questionBlock:    { marginBottom: 16 },
  questionLabelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  qNum:             { width: 24, height: 24, borderRadius: 12, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  qNumText:         { color: GOLD, fontWeight: 'bold', fontSize: 12 },
  questionText:     { flex: 1, fontSize: 13, color: '#333', fontWeight: '600', lineHeight: 20 },
  // Form
  label:            { marginBottom: 7, fontWeight: 'bold', color: NAVY, fontSize: 13 },
  inputWrapper:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#EEE', marginBottom: 4 },
  inputError:       { borderColor: RED },
  inputIcon:        { marginRight: 10 },
  input:            { flex: 1, paddingVertical: 14, fontSize: 15, color: '#000' },
  errorText:        { fontSize: 11, color: RED, marginBottom: 10, marginLeft: 4 },
  // Password checklist
  checklist:        { marginVertical: 10, gap: 6 },
  checkRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkText:        { fontSize: 13 },
  // Hint
  hintBox:          { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FFF9C4', borderRadius: 10, padding: 10, marginTop: 4 },
  hintBoxText:      { flex: 1, fontSize: 11, color: '#555', lineHeight: 16 },
  // Buttons
  primaryBtn:       { backgroundColor: GOLD, padding: 18, borderRadius: 15, alignItems: 'center', marginBottom: 8 },
  primaryBtnText:   { color: NAVY, fontWeight: '900', fontSize: 15 },
  btnInner:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backToLoginBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 14, gap: 5 },
  backToLoginText:  { color: NAVY, fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 14 },
});

export default ForgotPasswordScreen;