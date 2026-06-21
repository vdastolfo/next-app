import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../services/AuthContext';
import { activityAPI, profileAPI } from '../services/api';
import { NextLogo } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ pujasActivas: 0, itemsGanados: 0 });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  useEffect(() => {
    Promise.all([activityAPI.getBidding(), activityAPI.getParticipaciones()])
      .then(([bidding, part]) => {
        setStats({
          pujasActivas: bidding.data?.length ?? 0,
          itemsGanados: part.data?.itemsGanados ?? 0,
        });
      })
      .catch(() => {});

    profileAPI.getPhoto()
      .then(r => { if (r.data?.foto) setFotoPerfil(r.data.foto); })
      .catch(() => {});
  }, []);

  const handleEditFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    setSubiendoFoto(true);
    try {
      await profileAPI.updatePhoto(result.assets[0].base64);
      setFotoPerfil(result.assets[0].base64);
    } catch {
      Alert.alert('Error', 'No se pudo guardar la foto. Intentá de nuevo.');
    } finally {
      setSubiendoFoto(false);
    }
  };

  const categoryColor = {
    comun: '#75777E', especial: '#40C4FF',
    plata: '#B0BEC5', oro: '#FFD740', platino: '#E040FB',
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <NextLogo size={36} showText={true} />
        </View>
        <View style={guestStyles.container}>
          <Text style={guestStyles.icon}>👤</Text>
          <Text style={guestStyles.title}>Modo invitado</Text>
          <Text style={guestStyles.sub}>Iniciá sesión para acceder a tu perfil, pujas y medios de pago.</Text>
          <TouchableOpacity
            style={guestStyles.btn}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={guestStyles.btnText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <NextLogo size={36} showText={true} />
        </View>

        <View style={profileStyles.avatarSection}>
          <View style={profileStyles.avatarContainer}>
            <View style={profileStyles.avatar}>
              {fotoPerfil ? (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${fotoPerfil}` }}
                  style={profileStyles.avatarImage}
                />
              ) : (
                <Text style={profileStyles.avatarEmoji}>👤</Text>
              )}
            </View>
            <TouchableOpacity style={profileStyles.editBtn} onPress={handleEditFoto} disabled={subiendoFoto}>
              {subiendoFoto
                ? <ActivityIndicator size="small" color={COLORS.secondary} />
                : <Text style={profileStyles.editBtnText}>✏</Text>
              }
            </TouchableOpacity>
          </View>
          <Text style={profileStyles.userName}>{user?.nombre || 'Usuario'}</Text>
          <Text style={[profileStyles.categoryText, { color: categoryColor[user?.categoria] || '#75777E' }]}>
            MIEMBRO {user?.categoria?.toUpperCase() || 'COMÚN'}
          </Text>
        </View>

        <View style={profileStyles.statsRow}>
          <View style={profileStyles.statCard}>
            <Text style={profileStyles.statLabel}>PUJAS ACTIVAS</Text>
            <Text style={profileStyles.statValue}>{stats.pujasActivas}</Text>
          </View>
          <View style={profileStyles.statCard}>
            <Text style={profileStyles.statLabel}>LOTES GANADOS</Text>
            <Text style={[profileStyles.statValue, { color: COLORS.secondary }]}>{stats.itemsGanados}</Text>
          </View>
        </View>

        <View style={profileStyles.menuCard}>
          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate('Participaciones')}
          >
            <View style={profileStyles.menuIconContainer}>
              <Text style={profileStyles.menuIcon}>📊</Text>
            </View>
            <Text style={profileStyles.menuItemText}>Mis Participaciones</Text>
            <Text style={profileStyles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate('Consignaciones')}
          >
            <View style={profileStyles.menuIconContainer}>
              <Text style={profileStyles.menuIcon}>📦</Text>
            </View>
            <Text style={profileStyles.menuItemText}>Mis Consignaciones</Text>
            <Text style={profileStyles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={profileStyles.menuItem}
            onPress={() => navigation.navigate('PaymentMethods')}
          >
            <View style={profileStyles.menuIconContainer}>
              <Text style={profileStyles.menuIcon}>💳</Text>
            </View>
            <Text style={profileStyles.menuItemText}>Métodos de Pago</Text>
            <Text style={profileStyles.menuArrow}>›</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          style={profileStyles.logoutBtn}
          onPress={async () => { await logout(); navigation.reset({ index: 0, routes: [{ name: 'Main' }] }); }}
        >
          <Text style={profileStyles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md },
  headerIcon: { fontSize: 22 },
});

const guestStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.xl, marginTop: 80 },
  icon: { fontSize: 56, marginBottom: SIZES.lg },
  title: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXxl, marginBottom: SIZES.sm },
  sub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center', marginBottom: SIZES.xl },
  btn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.xl, paddingVertical: SIZES.md + 2, width: '100%', alignItems: 'center' },
  btnText: { color: 'white', fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textMd },
});

const profileStyles = StyleSheet.create({
  avatarSection: { alignItems: 'center', paddingVertical: SIZES.lg },
  avatarContainer: { position: 'relative', marginBottom: SIZES.sm },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarEmoji: { fontSize: 50 },
  editBtn: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.background },
  editBtnText: { fontSize: 14 },
  userName: { color: COLORS.textPrimary, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero, marginBottom: 4 },
  categoryText: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm, letterSpacing: 2 },
  statsRow: { flexDirection: 'row', marginHorizontal: SIZES.lg, gap: SIZES.md, marginBottom: SIZES.lg },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md },
  statLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, marginBottom: SIZES.xs },
  statValue: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXxl },
  menuCard: { marginHorizontal: SIZES.lg, backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, overflow: 'hidden', marginBottom: SIZES.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, borderBottomWidth: 1, borderBottomColor: COLORS.cardAlt },
  menuIconContainer: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center', marginRight: SIZES.md },
  menuIcon: { fontSize: 20 },
  menuItemText: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
  menuArrow: { color: COLORS.textMuted, fontSize: 24 },
  logoutBtn: { marginHorizontal: SIZES.lg, padding: SIZES.md, alignItems: 'center' },
  logoutText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
});
