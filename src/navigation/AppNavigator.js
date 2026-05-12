import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// GANTI KE MaterialCommunityIcons BIAR LEBIH TEKNIS
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

// Import Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import ScanScreen from '../screens/ScanScreen';
import HistoryScreen from '../screens/RiwayatScreen'; 
import ProfileScreen from '../screens/ProfilScreen';
import KatalogScreen from '../screens/KatalogScreen';
import DetailScreen from '../screens/DetailScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size, focused }) => {
        let iconName;

        // PENENTUAN ICON BERDASARKAN KONSEP TEKNIS
        if (route.name === 'Home') {
          iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
        } else if (route.name === 'Chat') {
          iconName = focused ? 'robot-happy' : 'robot-happy-outline'; // Icon Bot AI
        } else if (route.name === 'Scan') {
          iconName = focused ? 'barcode-scan' : 'camera-iris'; // Icon Scan & Lensa Kamera
        } else if (route.name === 'Riwayat') {
          iconName = focused ? 'clipboard-text-clock' : 'clipboard-text-clock-outline'; // Icon Log Kerja
        } else if (route.name === 'Profil') {
          iconName = focused ? 'account-hard-hat' : 'account-hard-hat-outline'; // Icon Safety Hat (Teknik banget)
        }

        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FBC02D', // Kuning Astra
      tabBarInactiveTintColor: '#888',
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#FFF', 
        height: 65, 
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        elevation: 10 // Kasih shadow dikit biar mewah
      }
    })}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Chat" component={ChatScreen} />
    <Tab.Screen name="Scan" component={ScanScreen} />
    <Tab.Screen name="Riwayat" component={HistoryScreen} />
    <Tab.Screen name="Profil" component={ProfileScreen} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* 1. Auth Flow */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      {/* 2. Main App (Halaman dengan Bottom Tabs) */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* 3. Sub-Screens (Halaman Full Screen) */}
      {/* Katalog & Detail ditaruh di sini supaya Bottom Tabs-nya hilang pas dibuka */}
      <Stack.Screen name="Katalog" component={KatalogScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      
    </Stack.Navigator>
  );
}