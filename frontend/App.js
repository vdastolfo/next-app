import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  useFonts,
  Manrope_300Light,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AuthProvider, useAuth } from './src/services/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import { COLORS } from './src/constants/theme';

function AppContent() {
  const { loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.secondary} size="large" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.secondary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor={COLORS.background} />
          <AppContent />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
