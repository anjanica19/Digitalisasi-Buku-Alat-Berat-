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

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      const session = await AsyncStorage.getItem('user_session');
      if (!session) return;
      
      const userData = JSON.parse(session);
      const response = await fetch(API_ENDPOINTS.getHistory(userData.nim));
      if (!response.ok) throw new Error("Gagal mengambil data");

      const result = await response.json();
      
      // DEBUG: Liat di terminal Metro, nama field-nya huruf besar atau kecil?
      console.log("Data Riwayat:", result[0]); 
      
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
    // PROTEKSI MAPPING: Antisipasi kalau backend ngirim PascalCase (F Besar) atau camelCase (f kecil)
    const code = item.failureCode || item.FailureCode || "N/A";
    const title = item.diagnosisTitle || item.DiagnosisTitle || "Tanpa Judul";
    const date = item.dateDisplay || item.DateDisplay || "-";

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
        
        {/* Teks utama jangan sampai kosong */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        <View style={styles.footerAcent} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Riwayat Sesi</Text>
      
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
          ListEmptyComponent={<Text style={styles.emptyText}>Tidak ada riwayat diagnosa ditemukan.</Text>}
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
  title: { fontSize: 18, fontWeight: '700', color: '#333', lineHeight: 24, paddingRight: 10 },
  footerAcent: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 50,
    height: 50,
    backgroundColor: '#FFD70015', 
    borderRadius: 25,
  },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999', fontSize: 14 }
});

export default RiwayatScreen;