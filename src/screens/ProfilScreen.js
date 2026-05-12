import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../data/api'; 

const ProfilScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const session = await AsyncStorage.getItem('user_session');
      if (session !== null) {
        const parsedSession = JSON.parse(session);
        
        // Panggil Controller .NET GetProfile/{nim} yang pake Stored Procedure
        const response = await fetch(`${BASE_URL}/User/GetProfile/${parsedSession.nim}`);
        const result = await response.json();

        if (response.ok) {
          setUser(result);
        } else {
          Alert.alert("Gagal", "User tidak ditemukan di database server.");
        }
      }
    } catch (error) {
      console.error("Fetch Profile Error:", error);
      Alert.alert("Error", "Gagal terhubung ke API Profile.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_session');
    Alert.alert("Logout", "Anda telah keluar.");
    navigation.replace('Login'); 
  };

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#003366" /></View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerT}>Profil Saya</Text>
        <TouchableOpacity>
          <MaterialCommunityIcons name="pencil-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileHero}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTxt}>{getInitials(user?.nama)}</Text>
        </View>
        <Text style={styles.name}>{user?.nama || "User"}</Text>
        <Text style={styles.sub}>{user?.role} • Komatsu Maintenance</Text>
        <View style={styles.nimBadge}>
          <Text style={styles.nimT}>ID: {user?.nim}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.cardT}>DATA DATABASE SINKRON</Text>
        <View style={styles.row}><Text style={styles.label}>User ID</Text><Text style={styles.val}>#{user?.id}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Status Akun</Text><Text style={[styles.val, {color: 'green'}]}>Terverifikasi</Text></View>
        <View style={styles.row}><Text style={styles.label}>Akses</Text><Text style={styles.val}>{user?.role?.toUpperCase()}</Text></View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.sBox}><Text style={styles.sV}>12</Text><Text style={styles.sL}>Diagnosis</Text></View>
        <View style={styles.sBox}><Text style={[styles.sV, {color: 'green'}]}>OK</Text><Text style={styles.sL}>Unit Ready</Text></View>
      </View>

      <TouchableOpacity style={styles.passBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="red" />
        <Text style={[styles.passT, {color: 'red'}]}>Keluar Aplikasi</Text>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 },
  headerT: { fontSize: 18, fontWeight: 'bold' },
  profileHero: { alignItems: 'center', marginVertical: 30 },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarTxt: { color: '#FFD700', fontSize: 30, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold' },
  sub: { color: '#666', textTransform: 'capitalize' },
  nimBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginTop: 10 },
  nimT: { color: '#003366', fontWeight: 'bold', fontSize: 12 },
  infoCard: { backgroundColor: '#F9F9F9', padding: 20, borderRadius: 20, marginBottom: 20 },
  cardT: { fontSize: 12, fontWeight: 'bold', color: '#AAA', marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { color: '#666' },
  val: { fontWeight: 'bold' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  sBox: { width: '48%', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 15, alignItems: 'center' },
  sV: { fontSize: 24, fontWeight: 'bold' },
  sL: { color: '#AAA', fontSize: 12 },
  passBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#EEE', marginBottom: 40 },
  passT: { flex: 1, marginLeft: 15, fontWeight: 'bold' }
});

export default ProfilScreen;