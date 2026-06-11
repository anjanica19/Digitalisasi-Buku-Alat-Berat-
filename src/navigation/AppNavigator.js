import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen          from '../screens/LoginScreen';
import RegisterScreen       from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Main Screens
import HomeScreen    from '../screens/HomeScreen';
import ChatScreen    from '../screens/ChatScreen';
import ScanScreen    from '../screens/ScanScreen';
import HistoryScreen from '../screens/RiwayatScreen';
import ProfileScreen from '../screens/ProfilScreen';
import KatalogScreen from '../screens/KatalogScreen';
import DetailScreen  from '../screens/DetailScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size, focused }) => {
        const icons = {
          Home:    focused ? 'view-dashboard'          : 'view-dashboard-outline',
          Chat:    focused ? 'robot-happy'             : 'robot-happy-outline',
          Scan:    focused ? 'barcode-scan'            : 'camera-iris',
          Riwayat: focused ? 'clipboard-text-clock'   : 'clipboard-text-clock-outline',
          Profil:  focused ? 'account-hard-hat'       : 'account-hard-hat-outline',
        };
        return <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor:   '#FBC02D',
      tabBarInactiveTintColor: '#888',
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#FFF',
        height: 65,
        paddingBottom: 10,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        elevation: 10,
      },
    })}
  >
    <Tab.Screen name="Home"    component={HomeScreen} />
    <Tab.Screen name="Chat"    component={ChatScreen} />
    <Tab.Screen name="Scan"    component={ScanScreen} />
    <Tab.Screen name="Riwayat" component={HistoryScreen} />
    <Tab.Screen name="Profil"  component={ProfileScreen} />
  </Tab.Navigator>
);

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Auth Flow */}
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Main App */}
      <Stack.Screen name="Main" component={MainTabs} />

      {/* Sub-screens (tanpa bottom tab) */}
      <Stack.Screen name="Katalog" component={KatalogScreen} />
      <Stack.Screen name="Detail"  component={DetailScreen} />
    </Stack.Navigator>
  );
}