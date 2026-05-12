import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DetailScreen({ route, navigation }) {
  const { item } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Alat</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.codeText}>{item.part_number}</Text>
          <Text style={styles.nameText}>{item.name}</Text>
          <View style={styles.badge}><Text style={styles.badgeTxt}>{item.category}</Text></View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Deskripsi</Text>
          <Text style={styles.descText}>{item.description}</Text>

          <Text style={[styles.sectionTitle, {marginTop: 20}]}>Langkah Troubleshooting</Text>
          {/* Contoh mapping langkah (Sesuaikan field DB lu) */}
          {["Cek kondisi visual", "Ukur tekanan hydraulic", "Ganti filter jika perlu"].map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.circle}><Text style={styles.stepNum}>{index + 1}</Text></View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topHeader: { flexDirection: 'row', padding: 20, paddingTop: 40, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFD700' },
  headerTitle: { fontWeight: 'bold', fontSize: 16 },
  heroSection: { backgroundColor: '#FFD700', padding: 30, alignItems: 'center', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  codeText: { fontSize: 24, fontWeight: 'bold', color: '#003366' },
  nameText: { fontSize: 18, textAlign: 'center', marginTop: 10, fontWeight: '500' },
  badge: { backgroundColor: '#003366', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginTop: 15 },
  badgeTxt: { color: '#FFD700', fontWeight: 'bold', fontSize: 10 },
  content: { padding: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  descText: { color: '#666', lineHeight: 22, marginBottom: 10 },
  stepRow: { flexDirection: 'row', marginBottom: 15, alignItems: 'center' },
  circle: { width: 30, height: 30, backgroundColor: '#FFD700', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNum: { fontWeight: 'bold', color: '#003366' },
  stepText: { flex: 1, fontSize: 14, color: '#444' }
});