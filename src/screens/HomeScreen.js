import React, { useState, useEffect, useRef } from 'react'; 
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Dimensions, FlatList } from 'react-native'; 
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window'); 
const ITEM_WIDTH = width - 40; 

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  
  // DATA SLIDER TETAP SAMA
  const carouselData = [
    { id: '1', image: require('../../assets/slide1.jpg'), title: 'Energy Transformation', desc: 'Towards a Greener Future' }, 
    { id: '2', image: require('../../assets/slide2.jpg'), title: 'SDM Unggul & Terampil', desc: 'Workshop Alat Berat Standar Astra' },
    { id: '3', image: require('../../assets/slide3.jpg'), title: 'Teknologi Monitoring AI', desc: 'Sistem Pantau Kondisi Unit Real-time' },
    { id: '4', image: require('../../assets/slide4.jpg'), title: 'Preventive Maintenance', desc: 'Optimalisasi Lifetime Komponen Alat' },
    { id: '5', image: require('../../assets/slide5.jpg'), title: 'Safety First (K3)', desc: 'Prioritas Utama Keselamatan Kerja' },
    { id: '6', image: require('../../assets/slide6.jpg'), title: 'Digitalisasi Manual', desc: 'Akses Katalog TAB Kini Lebih Mudah' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = activeIndex === carouselData.length - 1 ? 0 : activeIndex + 1;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000); 

    return () => clearInterval(interval);
  }, [activeIndex]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session) {
          setUserData(JSON.parse(session));
        }
      } catch (error) {
        console.log("Error loading user data", error);
      }
    };
    fetchUser();
  }, []);

  const getInitial = (name) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER - BAGIAN YANG DIUBAH JADI DINAMIS */}
      <View style={styles.topRow}>
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{getInitial(userData?.nama)}</Text>
          </View>
          <View>
            <Text style={styles.hi}>
                {userData?.role === 'lecturer' 
                    ? `Halo, Dr. ${userData?.nama?.split(' ')[0]}!` 
                    : `Halo, ${userData?.nama?.split(' ')[0] || 'User'}!`
                }
            </Text>
            <Text style={styles.sub}>
                {userData?.nim || 'NIM'} • {userData?.role === 'lecturer' ? 'Dosen' : (userData?.kelas || 'Astra')}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialCommunityIcons name="bell-ring" size={22} color="#003366" />
        </TouchableOpacity>
      </View>

      {/* BANNER SCAN - STRUKTUR TETAP */}
      <TouchableOpacity style={styles.scanBig} onPress={() => navigation.navigate('Scan')}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons name="engine" size={32} color="#003366" />
        </View>
        <View style={{marginLeft: 15, flex: 1}}>
          <Text style={styles.scanT}>Scan Kode Error</Text>
          <Text style={styles.scanS}>Analisa panel monitor alat berat</Text>
        </View>
      </TouchableOpacity>

      {/* --- SEKSI GAMBAR GERAK (SLIDER BACKGROUND) - STRUKTUR TETAP --- */}
      <View style={styles.sliderContainer}>
        <FlatList
          ref={flatListRef}
          data={carouselData}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          getItemLayout={(data, index) => (
            { length: ITEM_WIDTH, offset: ITEM_WIDTH * index, index }
          )}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <ImageBackground 
              source={item.image} 
              style={styles.sliderImage} 
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={styles.textOverlay}>
                <Text style={styles.titleText}>{item.title}</Text>
                <Text style={styles.descText}>{item.desc}</Text>
              </View>
            </ImageBackground>
          )}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / ITEM_WIDTH);
            setActiveIndex(newIndex);
          }}
        />
        <View style={styles.dotContainer}>
          {carouselData.map((_, index) => (
            <View 
              key={index} 
              style={[styles.dot, { backgroundColor: activeIndex === index ? '#003366' : '#CCC' }]} 
            />
          ))}
        </View>
      </View>

      <Text style={styles.secT}>AKSES CEPAT</Text>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Chat')}>
        <View style={styles.menuIconBg}>
           <MaterialCommunityIcons name="robot" size={24} color="#003366" />
        </View>
        <Text style={styles.menuT}>TAB Bot (AI Assistant)</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.menuItem, { marginTop: 12 }]} 
        onPress={() => navigation.navigate('Katalog')}
      >
        <View style={styles.menuIconBg}>
           <MaterialCommunityIcons name="tools" size={22} color="#003366" />
        </View>
        <Text style={styles.menuT}>Katalog Manual Alat</Text>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
      </TouchableOpacity>
      
      <View style={{height: 40}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 25 },
  profileBox: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 45, height: 45, borderRadius: 12, backgroundColor: '#003366', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarTxt: { color: '#FFD700', fontWeight: 'bold' },
  hi: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  sub: { color: '#666', fontSize: 13 },
  notifBtn: { padding: 8, backgroundColor: '#FFF9C4', borderRadius: 10 },
  scanBig: { 
    backgroundColor: '#FFD700', 
    padding: 20, 
    borderRadius: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 5, 
    marginBottom: 20,
  },
  iconCircle: { width: 55, height: 55, borderRadius: 15, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  scanT: { fontWeight: 'bold', fontSize: 18, color: '#003366' },
  scanS: { fontSize: 12, color: '#333', marginTop: 2, fontWeight: '500' },
  sliderContainer: { marginTop: 10, marginBottom: 10 },
  sliderImage: { 
    width: ITEM_WIDTH, 
    height: 180, 
    justifyContent: 'flex-end', 
  },
  textOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    height: '100%', 
    justifyContent: 'center',
    borderRadius: 20
  },
  titleText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  descText: { color: '#FFFFFF', fontSize: 12, marginTop: 4 },
  dotContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
  secT: { fontSize: 12, fontWeight: '900', color: '#AAA', marginVertical: 15, letterSpacing: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#EEE', elevation: 1 },
  menuIconBg: { width: 42, height: 42, backgroundColor: '#FFD700', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuT: { flex: 1, marginLeft: 15, fontWeight: 'bold', color: '#003366', fontSize: 15 },
});

export default HomeScreen;