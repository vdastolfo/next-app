import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../services/AuthContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import RegisterScreen from '../screens/RegisterScreen';
import RegistrationPendingScreen from '../screens/RegistrationPendingScreen';
import CompleteRegistrationScreen from '../screens/CompleteRegistrationScreen';
import FirstPaymentScreen from '../screens/FirstPaymentScreen';
import VerificationScreen from '../screens/VerificationScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ActivityScreen from '../screens/ActivityScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import SearchScreen from '../screens/SearchScreen';
import AuctionCatalogScreen from '../screens/AuctionCatalogScreen';
import ParticipacionesScreen from '../screens/ParticipacionesScreen';
import ConsignacionesScreen from '../screens/ConsignacionesScreen';
import NuevaConsignacionScreen from '../screens/NuevaConsignacionScreen';
import ConsignacionDetalleScreen from '../screens/ConsignacionDetalleScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Stack del Home (Home → Catálogo de subasta → Búsqueda) ───────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="AuctionCatalog" component={AuctionCatalogScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}

// ── Stack del Perfil ──────────────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <Stack.Screen name="Participaciones" component={ParticipacionesScreen} />
      <Stack.Screen name="Consignaciones" component={ConsignacionesScreen} />
      <Stack.Screen name="NuevaConsignacion" component={NuevaConsignacionScreen} />
      <Stack.Screen name="ConsignacionDetalle" component={ConsignacionDetalleScreen} />
    </Stack.Navigator>
  );
}

// ── Tab Bar personalizada ─────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const tabs = [
    { name: 'Home', label: 'INICIO', icon: '🏠' },
    { name: 'Search', label: 'BUSCAR', icon: '🔍' },
    { name: 'Activity', label: 'ACTIVIDAD', icon: '⬆' },
    { name: 'Profile', label: 'PERFIL', icon: '👤' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderTopColor: COLORS.cardAlt,
      paddingBottom: 20,
      paddingTop: 10,
    }}>
      {state.routes.map((route, index) => {
        const tab = tabs[index];
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            style={{
              flex: 1, alignItems: 'center', justifyContent: 'center',
            }}
            onPress={() => {
              if (!isFocused) navigation.navigate(route.name);
            }}
          >
            <View style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: isFocused ? COLORS.primary : 'transparent',
            }}>
              <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            </View>
            <Text style={{
              color: isFocused ? COLORS.secondary : COLORS.textMuted,
              fontFamily: isFocused ? FONTS.bodySemiBold : FONTS.bodyRegular,
              fontSize: SIZES.textXs,
              marginTop: 4,
              letterSpacing: 0.5,
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Tabs principales (usuario autenticado) ────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ── Navegador raíz ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegistrationPending" component={RegistrationPendingScreen} />
        <Stack.Screen name="CompleteRegistration" component={CompleteRegistrationScreen} />
        <Stack.Screen name="FirstPayment" component={FirstPaymentScreen} />
        <Stack.Screen name="Verify" component={VerificationScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
