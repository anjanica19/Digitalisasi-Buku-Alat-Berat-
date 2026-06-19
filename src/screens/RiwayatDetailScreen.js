import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { API_ENDPOINTS } from '../data/api';

const NAVY   = '#003366';
const YELLOW = '#F5C518';
const BG     = '#F0F2F5';
const MUTED  = '#8A94A6';

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? '-'}</Text>
  </View>
);

const Divider = () => <View style={styles.divider} />;

const MahasiswaCard = ({ item, index }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.indexBadge}>
        <Text style={styles.indexBadgeText}>{index + 1}</Text>
      </View>
      <View style={styles.searchCountBox}>
        <Text style={styles.searchCountIcon}>🔍</Text>
        <Text style={styles.searchCountText}>{item.totalSearch}x</Text>
      </View>
    </View>

    <Divider />

    <InfoRow label="NIM"             value={item.nim} />
    <Divider />
    <InfoRow label="Nama Mahasiswa"  value={item.namaMahasiswa} />
    <Divider />
    <InfoRow label="First Search"    value={item.firstSearch} />
    <Divider />
    <InfoRow label="Last Search"     value={item.lastSearch} />
  </View>
);

/* ── Main Screen ── */

const RiwayatDetailScreen = ({ route, navigation }) => {
  const { id, diagnosisType } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState([]);

  useEffect(() => { fetchDetail(); }, []);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_ENDPOINTS.historyDetail}?diagnosisType=${diagnosisType}&idItem=${id}`
      );
      const json = await response.json();
      const list = Array.isArray(json?.data)
        ? json.data
        : json?.data
        ? [json.data]
        : [];
      console.log('ITEM DETAIL:', list);
      setData(list);
    } catch (error) {
      console.log('DETAIL ERROR:', error);
    } finally {
      setLoading(false);
    }
  };

  /* Loading */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={YELLOW} />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  /* Empty */
  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Tidak ada data</Text>
        <Text style={styles.emptySubtitle}>Belum ada mahasiswa yang mencari kode ini.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
          <Text style={styles.backButtonText}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerLabel}>DETAIL RIWAYAT</Text>
        <Text style={styles.headerTitle}>Diagnosa Sistem</Text>
      </View>

      {/* Badge kode + tipe */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{id}</Text>
        </View>
        <View style={styles.badgeOutline}>
          <Text style={styles.badgeOutlineText}>{diagnosisType ?? 'Failure-code'}</Text>
        </View>
      </View>

      {/* Jumlah mahasiswa */}
      <View style={styles.sectionLabel}>
        <Text style={styles.sectionLabelText}>
          {data.length} MAHASISWA MENCARI KODE INI
        </Text>
      </View>

      {/* List card mahasiswa */}
      {data.map((item, index) => (
        <MahasiswaCard key={item.nim ?? index} item={item} index={index} />
      ))}
    </ScrollView>
  );
};

/* ── Styles ── */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8,
  },

  /* Loading / Empty */
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    gap: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: MUTED,
    fontWeight: '500',
  },
  emptyIcon: { 
    fontSize: 48, 
    marginBottom: 8 
  },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: NAVY 
  },
  emptySubtitle: { 
    fontSize: 13, 
    color: MUTED, 
    textAlign: 'center', 
    paddingHorizontal: 32 
  },
  backButton: {
    marginTop: 20,
    backgroundColor: NAVY,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: { 
    color: '#FFF', 
    fontWeight: '600', 
    fontSize: 14 
  },

  /* Header */
  header: { 
    paddingTop: 20, 
    marginBottom: 4 
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: YELLOW,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: NAVY 
  },

  /* Badges */
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: YELLOW,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: { 
    color: NAVY, 
    fontWeight: '700', 
    fontSize: 13 
  },
  badgeOutline: {
    borderWidth: 1.5,
    borderColor: NAVY,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeOutlineText: { 
    color: NAVY, 
    fontWeight: '600', 
    fontSize: 12 
  },

  /* Section label */
  sectionLabel: { 
    marginBottom: 12 
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1.2,
  },

  /* Card mahasiswa */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexBadgeText: { 
    color: '#FFF', 
    fontWeight: '700', 
    fontSize: 13 
  },
  searchCountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8DC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: YELLOW,
  },
  searchCountIcon: { 
    fontSize: 12 
  },
  searchCountText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: NAVY 
  },

  /* Info row */
  infoRow: { 
    paddingVertical: 12 
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: MUTED,
    letterSpacing: 0.5,
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  infoValue: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: NAVY 
  },

  divider: { 
    height: 1, 
    backgroundColor: '#EAECF0' 
  },
});

export default RiwayatDetailScreen;