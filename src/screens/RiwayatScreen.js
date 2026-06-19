import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { API_ENDPOINTS } from '../data/api';

const RiwayatScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState(null);
  const [data, setData] = useState([]);

  const [selectedType, setSelectedType] = useState('FAILURE_CODE');

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);

      const session = await AsyncStorage.getItem('user_session');

      if (!session) return;

      const userData = JSON.parse(session);

      setRole(userData.role);

      if (userData.role !== 'lecturer') {
        setData([]);
        return;
      }

      const response = await fetch(
        `${API_ENDPOINTS.historySummary}?diagnosisType=${selectedType}`
      );

      const result = await response.json();

      if (result.success) {
        setData(result.data || []);
      } else {
        setData([]);
      }
    } catch (error) {
      console.log('History Error:', error);
      setData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => {
        console.log(
          'Klik Detail:',
          item.idHistory,
          selectedType
        );

         navigation.navigate('RiwayatDetailScreen', {
           id: item.idHistory,
          diagnosisType: selectedType
         });
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.code}>
            {item.code || '-'}
          </Text>
        </View>

        <View style={styles.searchBadge}>
          <MaterialCommunityIcons
            name="magnify"
            size={14}
            color="#003366"
          />
          <Text style={styles.searchCount}>
            {item.totalSearch}x
          </Text>
        </View>
      </View>

      <Text style={styles.title}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  if (role === 'student') {
    return (
      <View style={styles.restrictedContainer}>
        <MaterialCommunityIcons
          name="lock-alert-outline"
          size={100}
          color="#DDD"
        />

        <Text style={styles.restrictedTitle}>
          Akses Terbatas
        </Text>

        <Text style={styles.restrictedSub}>
          Halaman Monitoring Riwayat hanya dapat
          diakses oleh akun Dosen.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Monitoring Riwayat
      </Text>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedType === 'FAILURE_CODE' &&
              styles.activeTab
          ]}
          onPress={() =>
            setSelectedType('FAILURE_CODE')
          }
        >
          <Text
            style={[
              styles.tabText,
              selectedType === 'FAILURE_CODE' &&
                styles.activeTabText
            ]}
          >
            Failure-code
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedType === 'S_MODE' &&
              styles.activeTab
          ]}
          onPress={() => setSelectedType('S_MODE')}
        >
          <Text
            style={[
              styles.tabText,
              selectedType === 'S_MODE' &&
                styles.activeTabText
            ]}
          >
            S-Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedType === 'E_MODE' &&
              styles.activeTab
          ]}
          onPress={() => setSelectedType('E_MODE')}
        >
          <Text
            style={[
              styles.tabText,
              selectedType === 'E_MODE' &&
                styles.activeTabText
            ]}
          >
            E-Mode
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            selectedType === 'H_MODE' &&
              styles.activeTab
          ]}
          onPress={() => setSelectedType('H_MODE')}
        >
          <Text
            style={[
              styles.tabText,
              selectedType === 'H_MODE' &&
                styles.activeTabText
            ]}
          >
            H-Mode
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#003366"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) =>
            item.idHistory.toString()
          }
          renderItem={renderCard}
          contentContainerStyle={{
            paddingBottom: 30
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchHistory();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="clipboard-text-search-outline"
                size={80}
                color="#DDD"
              />

              <Text style={styles.emptyText}>
                Belum ada riwayat untuk kategori ini
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20
  },

  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    color: '#003366'
  },

  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#EEE',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTab: {
    backgroundColor: '#003366'
  },

  tabText: {
    color: '#666',
    fontWeight: '600'
  },

  activeTabText: {
    color: '#FFF'
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },

  badge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },

  code: {
    fontWeight: 'bold',
    color: '#003366'
  },

  searchBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  searchCount: {
    marginLeft: 4,
    fontWeight: '700',
    color: '#003366'
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333'
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 80
  },

  emptyText: {
    marginTop: 15,
    color: '#999'
  },

  restrictedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF'
  },

  restrictedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#003366',
    marginTop: 25
  },

  restrictedSub: {
    textAlign: 'center',
    color: '#888',
    marginTop: 12,
    lineHeight: 22
  }
});

export default RiwayatScreen;