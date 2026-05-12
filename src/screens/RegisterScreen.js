import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const RegisterScreen = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Akun</Text>
      </View>

      <View style={styles.form}>
        {[
          { label: 'Nama Lengkap', placeholder: 'Andi Trisna' },
          { label: 'NIM', placeholder: '0320240001' },
          { label: 'Kelas', placeholder: 'TRPAB - 2A' },
          { label: 'Email', placeholder: 'andi@polytechnic.astra.ac.id' },
          { label: 'Username', placeholder: 'andi_t' },
          { label: 'Password', placeholder: '********', secure: true },
          { label: 'Konfirmasi Password', placeholder: '********', secure: true },
        ].map((item, index) => (
          <View key={index} style={styles.inputGroup}>
            <Text style={styles.label}>{item.label}</Text>
            <TextInput 
              style={styles.input} 
              placeholder={item.placeholder} 
              secureTextEntry={item.secure}
              placeholderTextColor="#999"
            />
          </View>
        ))}

        <TouchableOpacity style={styles.btn}>
          <Text style={styles.btnText}>Buat Akun</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Masuk</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFF', padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 40, marginBottom: 30 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 10 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { backgroundColor: '#F5F5F5', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#EEE' },
  btn: { backgroundColor: '#FFD700', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnText: { fontWeight: 'bold', fontSize: 16, color: '#003366' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, marginBottom: 40 },
  link: { color: '#FBC02D', fontWeight: 'bold' }
});

export default RegisterScreen;