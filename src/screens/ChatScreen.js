import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar,
  Keyboard, Alert, Image // Ditambahkan Image
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { API_ENDPOINTS } from '../data/api'; 

const ChatScreen = ({ navigation, route }) => {
  const [searchText, setSearchText] = useState('');
  const [messages, setMessages] = useState([
    { id: 'start', sender: 'bot', text: 'Halo! Ketik kode error untuk melihat informasi lengkap.', type: 'text' }
  ]);
  const [loading, setLoading] = useState(false);
  const [activeData, setActiveData] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [userNim, setUserNim] = useState(null); 
  const [userNama, setUserNama] = useState(null); 
  const flatListRef = useRef();

  // AMBIL NIM & NAMA DARI STORAGE SAAT LAYAR DIBUKA
  useEffect(() => {
    const getSession = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session) {
          const userData = JSON.parse(session);
          setUserNim(userData.nim);
          setUserNama(userData.nama);
        }
      } catch (e) { 
        console.log("Gagal ambil session", e); 
      }
    };
    getSession();

    if (route.params?.scannedCode) {
      handleSearch(route.params.scannedCode);
    }
  }, [route.params?.scannedCode]);

  // FUNGSI UNTUK SIMPAN KE DATABASE RIWAYAT (SINKRON DENGAN DOSEN)
  const saveToHistory = async (code, title, solution = null) => {
    if (!userNim) {
      console.log("History tidak disimpan: NIM tidak ditemukan");
      return;
    }

    try {
      const payload = {
        FailureCode: code,
        UserNim: userNim, 
        UserNama: userNama, 
        DiagnosisTitle: title,
        TotalSteps: activeData?.causes?.length || activeData?.detail?.causes?.length || 0,
        SolutionText: solution,
        Notes: "Dicari melalui chat",
        SessionId: currentSessionId 
      };

      const response = await fetch(API_ENDPOINTS.saveHistory, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.session_id) {
        setCurrentSessionId(result.session_id);
      }
    } catch (error) {
      console.error("Gagal simpan riwayat ke dosen:", error);
    }
  };

  const handleSearch = async (manualCode = null) => {
    const codeToSearch = manualCode || searchText;
    if (!codeToSearch.trim()) return;

    Keyboard.dismiss();
    const cleanQuery = codeToSearch.trim().toUpperCase();
    
    setMessages((prev) => [...prev, { id: Date.now().toString(), text: cleanQuery, sender: 'user', type: 'text' }]);
    setSearchText('');
    setLoading(true);
    setCurrentSessionId(null); 

    try {
      const url = `${API_ENDPOINTS.failureCode}/${cleanQuery}`;
      const response = await fetch(url);
      const json = await response.json();

      if (response.ok && json) {
        const detailData = json.detail || json;
        setActiveData(json);
        setMessages((prev) => [
          ...prev,
          { id: 'info-' + Date.now(), sender: 'bot', type: 'info_card', data: detailData },
        ]);
        
        saveToHistory(detailData.code, detailData.description, null);

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: 'confirm-' + Date.now(), sender: 'bot', type: 'confirm_ask', text: 'Lihat langkah troubleshooting?' },
          ]);
        }, 800);
      } else {
        setMessages((prev) => [...prev, { id: 'err-' + Date.now(), sender: 'bot', type: 'text', text: `Kode "${cleanQuery}" tidak ditemukan.` }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { id: 'err-' + Date.now(), sender: 'bot', type: 'text', text: "Koneksi server gagal." }]);
    } finally {
      setLoading(false);
    }
  };

  const showStep = (index) => {
    const causes = activeData?.causes || activeData?.detail?.causes;
    if (causes && index < causes.length) {
      const stepData = causes[index];
      setMessages((prev) => [
        ...prev,
        { id: `step-${index}-${Date.now()}`, sender: 'bot', type: 'step_card', data: stepData, currentIndex: index }
      ]);
    } else {
      setMessages((prev) => [...prev, { id: 'end-' + Date.now(), sender: 'bot', type: 'text', text: 'Selesai. Semua langkah perbaikan sudah ditampilkan.' }]);
    }
  };

  const InfoCard = ({ data }) => {
    const renderProblemPoints = (text) => {
      if (!text || text === '-') return <Text style={styles.valueYellow}>-</Text>;
      const points = text.split('|').map(item => item.trim()).filter(item => item !== "");
      return points.map((point, index) => (
        <Text key={index} style={styles.valueYellow}>
          {points.length > 1 ? `${index + 1}. ` : ""}{point}
        </Text>
      ));
    };

    return (
      <View style={styles.infoCard}>
        <View style={styles.cardHeaderRow}>
          <MaterialCommunityIcons name="database-search" size={18} color="#FFD700" />
          <Text style={styles.cardInfoTag}> HASIL DIAGNOSA SISTEM</Text>
        </View>
        <Text style={styles.infoTitle}>{data.code} / {data.user_code}</Text>
        <Text style={styles.infoDesc}>{data.description}</Text>
        <View style={styles.divider} />
        <View style={styles.gridRow}>
          <View style={styles.gridCol}><Text style={styles.labelSmall}>COMPONENT:</Text><Text style={styles.valueWhite}>{data.component_in_charge || '-'}</Text></View>
          <View style={styles.gridCol}><Text style={styles.labelSmall}>CATEGORY:</Text><Text style={styles.valueWhite}>{data.category || '-'}</Text></View>
        </View>
        
        <View style={styles.dataSection}>
          <Text style={styles.labelSmall}>PROBLEM APPEARS (GEJALA):</Text>
          {renderProblemPoints(data.problem_appears)}
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.labelSmall}>ACTION OF CONTROLLER:</Text>
          <Text style={styles.valueWhiteSmall}>{data.action_of_controller || '-'}</Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.labelSmall}>CONTENTS OF TROUBLE:</Text>
          <Text style={styles.valueWhiteSmall}>{data.contents_of_trouble || '-'}</Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.labelSmall}>RELATED INFORMATION:</Text>
          <Text style={styles.valueWhiteSmall}>{data.related_information || '-'}</Text>
        </View>
      </View>
    );
  };

  const StepCard = ({ data, index }) => {
    const causes = activeData?.causes || activeData?.detail?.causes || [];
    const isLastStep = index === causes.length - 1;

    const handleFinishStep = () => {
        const detailData = activeData.detail || activeData;
        saveToHistory(detailData.code, detailData.description, data.cause_description);
        Alert.alert("Berhasil", "Diagnosa selesai dan riwayat Anda telah dikirim ke Dosen.");
    };

    return (
        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>{index + 1}</Text></View>
            <Text style={styles.stepHeaderText}>Langkah Perbaikan</Text>
          </View>
          
          <Text style={styles.causeDesc}>{data.cause_description}</Text>
          
          {/* TAMPILKAN GAMBAR SIRKUIT JIKA ADA URL DARI BACKEND */}
          {data.image_url && (
            <View style={styles.imgContainer}>
              <Text style={styles.labelSmall}>CIRCUIT DIAGRAM REFERENCE:</Text>
              <Image 
                source={{ uri: data.image_url }} 
                style={styles.fullImage} 
                resizeMode="contain" 
              />
            </View>
          )}

          <View style={styles.methodBox}>
            <Text style={styles.labelSmall}>CHECK METHOD:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 2 }}>
              {data.special_method === 'iya' && (
                <MaterialCommunityIcons name="star" size={16} color="#000" style={{ marginRight: 5, marginTop: 2 }} />
              )}
              <Text style={styles.methodText}>{data.check_method}</Text>
            </View>
          </View>

          {/* TAMPILKAN STANDARD CONDITION DAN GAMBAR TABEL JIKA ADA */}
          <View style={styles.standardBox}>
            <Text style={styles.labelSmall}>STANDARD CONDITION:</Text>
            <Text style={styles.standardValueText}>{data.standard_condition || '-'}</Text>
            
            {data.standard_image_url && (
              <Image 
                source={{ uri: data.standard_image_url }} 
                style={styles.standardImage} 
                resizeMode="contain" 
              />
            )}
          </View>

          <View style={styles.stepActionRow}>
            <TouchableOpacity style={styles.btnYa} onPress={handleFinishStep}>
              <Text style={styles.btnTextWhite}>Normal / Selesai</Text>
            </TouchableOpacity>
            
            {!isLastStep && (
              <TouchableOpacity style={styles.btnTidak} onPress={() => showStep(index + 1)}>
                <Text style={styles.btnTextBlack}>Masih Error</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
    );
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgWrapper, isUser ? styles.userWrapper : styles.botWrapper]}>
        {!isUser && item.type === 'text' && (
          <View style={styles.botAvatar}><MaterialCommunityIcons name="robot-industrial" size={20} color="#FFD700" /></View>
        )}
        {item.type === 'info_card' ? <InfoCard data={item.data} /> :
         item.type === 'confirm_ask' ? (
           <View style={styles.botBubble}>
             <Text style={styles.botText}>{item.text}</Text>
             <TouchableOpacity style={styles.btnConfirm} onPress={() => showStep(0)}>
               <Text style={styles.btnTextWhite}>Ya, Tampilkan Langkah</Text>
             </TouchableOpacity>
           </View>
         ) : item.type === 'step_card' ? <StepCard data={item.data} index={item.currentIndex} /> : (
           <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
             <Text style={isUser ? styles.userText : styles.botText}>{item.text}</Text>
           </View>
         )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><MaterialCommunityIcons name="arrow-left" size={28} color="#003366" /></TouchableOpacity>
        <Text style={styles.headerTitle}>TAB Bot Diagnostic</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContent}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
        {loading && <ActivityIndicator size="small" color="#003366" style={{ marginBottom: 10 }} />}
        <View style={styles.inputArea}>
          <TextInput style={styles.textInput} placeholder="Ketik kode error..." value={searchText} onChangeText={setSearchText} onSubmitEditing={() => handleSearch()} />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSearch()}>
            <MaterialCommunityIcons name="send" size={22} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    headerTitle: { fontWeight: 'bold', fontSize: 16, color: '#003366' },
    chatContent: { padding: 15 },
    msgWrapper: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
    userWrapper: { justifyContent: 'flex-end' },
    botWrapper: { justifyContent: 'flex-start' },
    botAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    bubble: { padding: 12, borderRadius: 15, maxWidth: '85%' },
    userBubble: { backgroundColor: '#FFD700' },
    botBubble: { backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#DDD', padding: 12, borderRadius: 15, marginLeft: 5 },
    userText: { color: '#003366', fontWeight: 'bold' },
    botText: { color: '#333' },
    infoCard: { backgroundColor: '#001a33', padding: 18, borderRadius: 15, width: '95%', marginLeft: 10, elevation: 5 },
    cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    cardInfoTag: { color: '#FFD700', fontSize: 10, fontWeight: 'bold' },
    infoTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    infoDesc: { color: '#DDD', fontSize: 14, marginTop: 4 },
    divider: { height: 1, backgroundColor: '#1a3a5a', marginVertical: 12 },
    gridRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    gridCol: { flex: 1 },
    dataSection: { marginBottom: 15 },
    labelSmall: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 5 },
    valueWhite: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },
    valueYellow: { color: '#FFD700', fontWeight: 'bold', fontSize: 14, lineHeight: 20, marginBottom: 2 },
    valueWhiteSmall: { color: '#EEE', fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
    btnConfirm: { backgroundColor: '#003366', padding: 10, borderRadius: 8, marginTop: 10, alignItems: 'center' },
    stepCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, width: '95%', marginLeft: 10, elevation: 4, borderWidth: 1, borderColor: '#EEE', borderLeftWidth: 6, borderLeftColor: '#003366', marginTop: 10 },
    stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    stepBadge: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    stepBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    stepHeaderText: { color: '#003366', fontWeight: 'bold' },
    causeDesc: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
    imgContainer: { marginBottom: 15, backgroundColor: '#F0F0F0', padding: 5, borderRadius: 8 },
    fullImage: { width: '100%', height: 200, borderRadius: 5 },
    methodBox: { backgroundColor: '#F5F5F5', padding: 10, borderRadius: 8, marginBottom: 10 },
    methodText: { fontSize: 13, color: '#444', flex: 1 },
    standardBox: { backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 15 },
    standardValueText: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginBottom: 5 },
    standardImage: { width: '100%', height: 140, marginTop: 10, backgroundColor: '#FFF', borderRadius: 5 },
    stepActionRow: { flexDirection: 'row' },
    btnYa: { flex: 1, backgroundColor: '#2E7D32', padding: 12, borderRadius: 8, marginRight: 5, alignItems: 'center' },
    btnTidak: { flex: 1, backgroundColor: '#FFD700', padding: 12, borderRadius: 8, marginLeft: 5, alignItems: 'center' },
    btnTextWhite: { color: '#FFF', fontWeight: 'bold' },
    btnTextBlack: { color: '#000', fontWeight: 'bold' },
    inputArea: { flexDirection: 'row', padding: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
    textInput: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 25, paddingHorizontal: 20, height: 45, borderWidth: 1, borderColor: '#DDD' },
    sendBtn: { backgroundColor: '#003366', width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
});

export default ChatScreen;