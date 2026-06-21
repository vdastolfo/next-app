import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { NextLogo } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const categoryColor = {
    comun: '#75777E', especial: '#40C4FF',
    plata: '#B0BEC5', oro: '#FFD740', platino: '#E040FB',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <NextLogo size={36} showText={true} />
          <TouchableOpacity><Text style={styles.headerIcon}>🔔</Text></TouchableOpacity>
        </View>

        <View style={profileStyles.avatarSection}>
          <View style={profileStyles.avatarContainer}>
            <View style={profileStyles.avatar}>
              <Text style={profileStyles.avatarEmoji}>👤</Text>
            </View>
            <TouchableOpacity style={profileStyles.editBtn}>
              <Text style={profileStyles.editBtnText}>✏</Text>
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
            <Text style={profileStyles.statValue}>3</Text>
          </View>
          <View style={profileStyles.statCard}>
            <Text style={profileStyles.statLabel}>DISPONIBLE PARA OFERTAR</Text>
            <Text style={[profileStyles.statValue, { color: COLORS.secondary }]}>$1M</Text>
          </View>
        </View>

        <View style={profileStyles.menuCard}>
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

          <TouchableOpacity style={profileStyles.menuItem}>
            <View style={profileStyles.menuIconContainer}>
              <Text style={profileStyles.menuIcon}>📍</Text>
            </View>
            <Text style={profileStyles.menuItemText}>Direcciones de Envío</Text>
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

const profileStyles = StyleSheet.create({
  avatarSection: { alignItems: 'center', paddingVertical: SIZES.lg },
  avatarContainer: { position: 'relative', marginBottom: SIZES.sm },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
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
