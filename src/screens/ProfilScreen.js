import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, ScrollView, Alert, RefreshControl
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../data/api';

const NAVY = '#003366';
const GOLD = '#FFD700';

const ProfilScreen = ({ navigation }) => {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reload setiap kali tab Profil difokuskan
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  const loadUserData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);

    try {
      // Ambil session dari AsyncStorage
      const session = await AsyncStorage.getItem('user_session');
      if (!session) {
        navigation.replace('Login');
        return;
      }

      const sessionData = JSON.parse(session);
      const nim = sessionData.nim;

      // Langsung gunakan data session dulu supaya UI tidak kosong
      setUser(sessionData);

      // Sinkronkan dengan data terbaru dari API
      const response = await fetch(API_ENDPOINTS.getProfile(nim));
      if (response.ok) {
        const result = await response.json();
        // Gabungkan data API dengan session (API lebih up-to-date)
        const merged = { ...sessionData, ...result };
        setUser(merged);
        // Update session dengan data terbaru
        await AsyncStorage.setItem('user_session', JSON.stringify(merged));
      }
      // Kalau API gagal, tetap tampilkan data dari session (tidak crash)

    } catch (error) {
      console.error('Profile Error:', error);
      // Tidak Alert — biarkan data session tetap tampil
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getInitials = name => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  const getRoleLabel = role => {
    if (!role) return '';
    if (role.toLowerCase() === 'student')  return 'Student';
    if (role.toLowerCase() === 'lecturer') return 'Lecturer';
    return role;
  };

  const getRoleIcon = role => {
    if (!role) return 'account';
    return role.toLowerCase() === 'lecturer' ? 'human-male-board' : 'school';
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('user_session');
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={NAVY} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadUserData(true)}
          colors={[NAVY]}
          tintColor={NAVY}
        />
      }
    >
      {/* ── HEADER ───────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.syncBadge}>
          <MaterialCommunityIcons name="cloud-check-outline" size={13} color={NAVY} />
          <Text style={styles.syncText}>Synced</Text>
        </View>
      </View>

      {/* ── HERO AVATAR ──────────────────────────────────────── */}
      <View style={styles.heroCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTxt}>{getInitials(user?.nama)}</Text>
        </View>
        <Text style={styles.name}>{user?.nama || 'User'}</Text>

        <View style={styles.rolePill}>
          <MaterialCommunityIcons name={getRoleIcon(user?.role)} size={15} color={NAVY} />
          <Text style={styles.roleText}>{getRoleLabel(user?.role)} · Komatsu Maintenance</Text>
        </View>

        <View style={styles.idBadge}>
          <MaterialCommunityIcons name="card-account-details-outline" size={14} color={NAVY} />
          <Text style={styles.idText}>
            {user?.role?.toLowerCase() === 'lecturer' ? 'NIDN' : 'NIM'}: {user?.nim}
          </Text>
        </View>
      </View>

      {/* ── INFO CARD ─────────────────────────────────────────── */}
      <View style={styles.infoCard}>
        <Text style={styles.cardSectionTitle}>ACCOUNT INFORMATION</Text>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name="account-outline" size={18} color={NAVY} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{user?.nama || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name="badge-account-outline" size={18} color={NAVY} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>
              {user?.role?.toLowerCase() === 'lecturer' ? 'Lecturer ID (NIDN)' : 'Student ID (NIM)'}
            </Text>
            <Text style={styles.infoValue}>{user?.nim || '—'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name={getRoleIcon(user?.role)} size={18} color={NAVY} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>{getRoleLabel(user?.role)}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name="shield-check-outline" size={18} color="#2E7D32" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Account Status</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active & Verified</Text>
            </View>
          </View>
        </View>

        {user?.id ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIconWrap}>
                <MaterialCommunityIcons name="identifier" size={18} color={NAVY} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>#{user.id}</Text>
              </View>
            </View>
          </>
        ) : null}
      </View>

      {/* ── SIGN OUT ──────────────────────────────────────────── */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#E53935" />
        <Text style={styles.logoutText}>Sign Out</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>

      <Text style={styles.versionText}>TAB Troubleshoot · Polytechnic Astra</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  center:          { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },

  // Header
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 55, marginBottom: 20 },
  headerTitle:     { fontSize: 22, fontWeight: 'bold', color: NAVY },
  syncBadge:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  syncText:        { fontSize: 11, fontWeight: 'bold', color: NAVY },

  // Hero
  heroCard:        { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 28, marginBottom: 16, borderWidth: 1, borderColor: '#EEE', elevation: 2 },
  avatarLarge:     { width: 90, height: 90, borderRadius: 45, backgroundColor: NAVY, justifyContent: 'center', alignItems: 'center', marginBottom: 14, elevation: 4 },
  avatarTxt:       { color: GOLD, fontSize: 28, fontWeight: 'bold' },
  name:            { fontSize: 20, fontWeight: 'bold', color: NAVY, marginBottom: 8, textAlign: 'center' },
  rolePill:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F0F4FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  roleText:        { color: NAVY, fontWeight: '600', fontSize: 13, textTransform: 'capitalize' },
  idBadge:         { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFDE7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FFD700' },
  idText:          { color: NAVY, fontWeight: 'bold', fontSize: 12 },

  // Info card
  infoCard:        { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#EEE', elevation: 1 },
  cardSectionTitle:{ fontSize: 11, fontWeight: 'bold', color: '#AAA', letterSpacing: 1, marginBottom: 16 },
  infoRow:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 14 },
  infoIconWrap:    { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0F4FF', justifyContent: 'center', alignItems: 'center' },
  infoContent:     { flex: 1 },
  infoLabel:       { fontSize: 12, color: '#999', marginBottom: 2 },
  infoValue:       { fontSize: 15, fontWeight: '600', color: '#222' },
  divider:         { height: 1, backgroundColor: '#F5F5F5', marginVertical: 2 },
  statusRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot:       { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2E7D32' },
  statusText:      { fontSize: 15, fontWeight: '600', color: '#2E7D32' },

  // Logout
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#FFEBEE', marginBottom: 16, gap: 12 },
  logoutText:      { flex: 1, color: '#E53935', fontWeight: 'bold', fontSize: 15 },

  versionText:     { textAlign: 'center', color: '#CCC', fontSize: 12, marginBottom: 8 },
});

export default ProfilScreen;