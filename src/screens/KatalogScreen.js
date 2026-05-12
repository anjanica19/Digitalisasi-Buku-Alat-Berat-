import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, StyleSheet, 
  ActivityIndicator, TouchableOpacity, SafeAreaView 
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const KatalogScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [tools, setTools] = useState([]);

  const API_URL = 'http://10.1.12.29:5234/api/FailureDiagnosis'; 

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTools(data);
    } catch (error) {
      console.error("Gagal ambil data:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('Detail', { item })} // Navigasi ke Detail
    >
      <View style={styles.cardContent}>
        <View style={styles.headerCard}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" />
        </View>
        <Text style={styles.titleText}>{item.name}</Text>
        <Text style={styles.partNoText}>P/N: {item.part_number}</Text>
        <Text style={styles.descText} numberOfLines={2}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KATALOG ALAT BERAT</Text>
        <View style={{width: 24}} /> 
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#FFD700" /></View>
      ) : (
        <FlatList
          data={tools}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          onRefresh={fetchData}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { backgroundColor: '#FFD700', padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#EEE', overflow: 'hidden' },
  cardContent: { padding: 15 },
  headerCard: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  categoryText: { fontSize: 10, fontWeight: 'bold', color: '#FBC02D' },
  titleText: { fontSize: 16, fontWeight: 'bold', color: '#003366' },
  partNoText: { fontSize: 13, fontWeight: 'bold', color: '#D32F2F', marginVertical: 4 },
  descText: { fontSize: 12, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default KatalogScreen;