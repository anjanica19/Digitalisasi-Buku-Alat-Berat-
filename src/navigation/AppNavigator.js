import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const MainTabs = () => {
  // Tambahan Logika Role
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getRole = async () => {
      try {
        const session = await AsyncStorage.getItem('user_session');
        if (session) {
          const userData = JSON.parse(session);
          setRole(userData.role);
        }
      } catch (e) {
        console.log(e);
      }
    };
    getRole();
  }, []);

  return (
    <Tab.Navigator screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'robot-happy' : 'robot-happy-outline';
          } else if (route.name === 'Scan') {
            iconName = focused ? 'barcode-scan' : 'camera-iris';
          } else if (route.name === 'Riwayat') {
            iconName = focused ? 'clipboard-text-clock' : 'clipboard-text-clock-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'account-hard-hat' : 'account-hard-hat-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FBC02D', 
        tabBarInactiveTintColor: '#888',
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#FFF', 
          height: 65, 
          paddingBottom: 10,
          borderTopWidth: 1,
          borderTopColor: '#EEE',
          elevation: 10 
        }
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      
      {/* Menu Riwayat HANYA muncul jika role dosen/lecturer */}
      {role === 'lecturer' && (
        <Tab.Screen name="Riwayat" component={HistoryScreen} />
      )}
      
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Katalog" component={KatalogScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}