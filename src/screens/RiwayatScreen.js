import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_ENDPOINTS } from '../data/api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RiwayatScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]); 
  const [role, setRole] = useState(null); 

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const session = await AsyncStorage.getItem('user_session');
      if (!session) return;
      
      const userData = JSON.parse(session);
      setRole(userData.role); 

      // LOGIKA PROTEKSI: Jika user adalah mahasiswa, jangan tarik data dari server
      if (userData.role !== 'lecturer') {
        setData([]);
        setLoading(false);
        return;
      }

      // Endpoint khusus Dosen untuk monitoring SEMUA riwayat mahasiswa
      // Pastikan backend mengembalikan field: Nama, Nim, FailureCode, DiagnosisTitle, DateDisplay
      const response = await fetch(API_ENDPOINTS.getAllHistory || API_ENDPOINTS.getHistory('all')); 
      if (!response.ok) throw new Error("Gagal mengambil data");

      const result = await response.json();
      
      console.log("Data Riwayat Masuk:", result[0]); 
      setData(result);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const renderCard = ({ item }) => {
    // Mapping data agar fleksibel dengan penamaan di Database (Besar/Kecil)
    const code = item.failureCode || item.FailureCode || item.kode || "N/A";
    const title = item.diagnosisTitle || item.DiagnosisTitle || item.deskripsi || "Tanpa Judul";
    const date = item.dateDisplay || item.DateDisplay || item.waktu || "-";
    
    // Identitas Mahasiswa yang dicari oleh Dosen
    const studentName = item.nama || item.Nama || item.UserNama || "Mahasiswa";
    const studentNim = item.nim || item.Nim || item.UserNim || "-";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.code}>{code}</Text>
          </View>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar-clock" size={14} color="#AAA" />
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        {/* BOX INFORMASI MAHASISWA (KHUSUS TAMPILAN DOSEN) */}
        <View style={styles.studentInfo}>
          <MaterialCommunityIcons name="account-hard-hat" size={16} color="#003366" />
          <Text style={styles.studentText}>{studentName} | {studentNim}</Text>
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.footerAcent} />
      </View>
    );
  };

  // Tampilan "Lock Screen" jika user yang login adalah Mahasiswa
  if (role === 'student') {
    return (
      <View style={styles.restrictedContainer}>
        <MaterialCommunityIcons name="lock-alert-outline" size={100} color="#DDD" />
        <Text style={styles.restrictedTitle}>Akses Terbatas</Text>
        <Text style={styles.restrictedSub}>Maaf, halaman Monitoring Riwayat hanya dapat diakses oleh akun Dosen untuk keperluan pengawasan.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monitoring Riwayat</Text>
      
      {loading && !refreshing && data.length === 0 ? (
        <ActivityIndicator size="large" color="#003366" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => item.sessionId || item.SessionId || index.toString()}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl 
               refreshing={refreshing} 
               onRefresh={() => { setRefreshing(true); fetchHistory(); }} 
            />
          }
          ListEmptyComponent={
            <View style={{alignItems: 'center', marginTop: 100}}>
               <MaterialCommunityIcons name="clipboard-text-search-outline" size={80} color="#EEE" />
               <Text style={styles.emptyText}>Tidak ada riwayat diagnosa ditemukan.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginTop: 50, marginBottom: 20, color: '#003366' },
  card: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    marginBottom: 15, 
    padding: 18,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#003366',
    position: 'relative',
    overflow: 'hidden'
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12
  },
  badge: { 
    backgroundColor: '#FFD700', 
    paddingHorizontal: 12, 
    paddingVertical: 5, 
    borderRadius: 10 
  },
  code: { fontWeight: '900', fontSize: 13, color: '#003366' },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  date: { color: '#999', fontSize: 11, marginLeft: 5, fontWeight: '600' },
  
  // Style Baru Info Mahasiswa (Nama & NIM)
  studentInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F0F4F8', 
    padding: 8, 
    borderRadius: 8, 
    marginBottom: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D1DBE5'
  },
  studentText: { fontSize: 12, fontWeight: 'bold', color: '#003366', marginLeft: 6 },

  title: { fontSize: 17, fontWeight: '700', color: '#333', lineHeight: 24, paddingRight: 10 },
  footerAcent: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 50,
    height: 50,
    backgroundColor: '#FFD70015', 
    borderRadius: 25,
  },
  emptyText: { textAlign: 'center', marginTop: 15, color: '#999', fontSize: 14 },

  // Style Tampilan Akses Ditolak (Mahasiswa)
  restrictedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#FFF' },
  restrictedTitle: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginTop: 25 },
  restrictedSub: { textAlign: 'center', color: '#888', marginTop: 12, lineHeight: 22, fontSize: 14 }
});

export default RiwayatScreen;