import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../services/AuthContext';
import { auctionsAPI } from '../services/api';
import { NextLogo, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const CATEGORY_LABELS = {
  comun: 'COMÚN',
  especial: 'ESPECIAL',
  plata: 'PLATA',
  oro: 'ORO',
  platino: 'PLATINO',
};

const CATEGORY_COLORS = {
  comun: COLORS.textMuted,
  especial: COLORS.accent1,
  plata: '#C0C0C0',
  oro: COLORS.warning,
  platino: '#E8E8FF',
};

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(month) - 1]} ${year}`;
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
}

function AuctionListCard({ subasta, onPress }) {
  const catColor = CATEGORY_COLORS[subasta.categoria] || COLORS.textMuted;
  const catLabel = CATEGORY_LABELS[subasta.categoria] || subasta.categoria?.toUpperCase();
  const moneda = subasta.moneda === 'dolares' ? 'USD' : 'ARS';

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={cardStyles.cardHeader}>
        <View style={[cardStyles.catBadge, { borderColor: catColor }]}>
          <Text style={[cardStyles.catText, { color: catColor }]}>{catLabel}</Text>
        </View>
        <View style={cardStyles.statusRow}>
          {subasta.estado === 'proxima' ? (
            <Text style={cardStyles.statusTextProxima}>PRÓXIMA</Text>
          ) : (
            <>
              <View style={[cardStyles.statusDot, subasta.estado !== 'abierta' && cardStyles.statusDotClosed]} />
              <Text style={[cardStyles.statusText, subasta.estado !== 'abierta' && cardStyles.statusTextClosed]}>
                {subasta.estado === 'abierta' ? 'EN VIVO' : 'FINALIZADA'}
              </Text>
            </>
          )}
          <Text style={cardStyles.currencyBadge}>{moneda}</Text>
        </View>
      </View>

      <View style={cardStyles.dateRow}>
        <Text style={cardStyles.dateText}>{formatDate(subasta.fecha)}</Text>
        <Text style={cardStyles.timeSep}> • </Text>
        <Text style={cardStyles.timeText}>{formatTime(subasta.hora)}hs</Text>
      </View>

      <Text style={cardStyles.location} numberOfLines={1}>{subasta.ubicacion}</Text>

      {subasta.rematadorNombre && (
        <View style={cardStyles.rematadorRow}>
          <Text style={cardStyles.rematadorLabel}>REMATADOR</Text>
          <Text style={cardStyles.rematadorName}>
            {subasta.rematadorNombre}
            {subasta.rematadorMatricula ? ` · Mat. ${subasta.rematadorMatricula}` : ''}
          </Text>
        </View>
      )}

      <View style={cardStyles.cardFooter}>
        <Text style={cardStyles.itemCount}>
          {subasta.totalItems ?? '—'} lotes disponibles
        </Text>
        <Text style={cardStyles.viewCta}>Ver catálogo →</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadAuctions = async () => {
    try {
      setError(null);
      const response = await auctionsAPI.getAuctions();
      setAuctions(response.data || []);
    } catch (err) {
      if (err.isNetworkError) {
        setError('Sin conexión a internet. Verificá tu red.');
      } else {
        setError('No se pudieron cargar las subastas.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAuctions();
    }, [])
  );

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAuctions(); }} tintColor={COLORS.secondary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <NextLogo size={40} showText={true} />
        </View>

        {/* Buscador */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Buscar lotes curados...</Text>
        </TouchableOpacity>

        {/* Banner modo invitado */}
        {!user && (
          <TouchableOpacity
            style={styles.guestBanner}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <View style={styles.guestBannerLeft}>
              <Text style={styles.guestBannerTag}>MODO INVITADO</Text>
              <Text style={styles.guestBannerSub}>Registrate para ver precios y pujar</Text>
            </View>
            <Text style={styles.guestBannerCta}>Iniciar sesión →</Text>
          </TouchableOpacity>
        )}

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={loadAuctions}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección de subastas */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Subastas</Text>
          <Text style={styles.sectionCount}>
            {auctions.filter(a => a.estado === 'abierta').length} en vivo
          </Text>
        </View>

        <FlatList
          data={auctions}
          scrollEnabled={false}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AuctionListCard
              subasta={item}
              onPress={() => navigation.navigate('AuctionCatalog', { subasta: item })}
            />
          )}
          ListEmptyComponent={
            !error && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hay subastas abiertas en este momento.</Text>
              </View>
            )
          }
        />

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
  },
  bellBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  bellIcon: { fontSize: 22 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.input,
    marginHorizontal: SIZES.lg, borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm + 4, marginBottom: SIZES.md,
  },
  searchIcon: { fontSize: 16, marginRight: SIZES.sm },
  searchPlaceholder: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  guestBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.card, marginHorizontal: SIZES.lg, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, marginBottom: SIZES.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  guestBannerLeft: { flex: 1 },
  guestBannerTag: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1.5 },
  guestBannerSub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: 2 },
  guestBannerCta: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  errorBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.12)', marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm, flex: 1 },
  retryText: { color: COLORS.accent1, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SIZES.lg, marginBottom: SIZES.md,
  },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXxl },
  sectionCount: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  listContent: { paddingHorizontal: SIZES.lg },
  emptyState: { padding: SIZES.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center' },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg,
    padding: SIZES.lg, marginBottom: SIZES.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  catBadge: {
    borderWidth: 1, borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.sm + 2, paddingVertical: 3,
  },
  catText: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.xs },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  statusDotClosed: { backgroundColor: COLORS.textMuted },
  statusText: { color: COLORS.success, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  statusTextClosed: { color: COLORS.textMuted },
  statusTextProxima: { color: '#5B8DEF', fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  currencyBadge: {
    color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs,
    backgroundColor: COLORS.cardAlt, borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.xs + 2, paddingVertical: 2, marginLeft: SIZES.xs,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.xs },
  dateText: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl },
  timeSep: { color: COLORS.textMuted, fontSize: SIZES.textXl },
  timeText: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl },
  location: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, marginBottom: SIZES.md },
  rematadorRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.sm },
  rematadorLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  rematadorName: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, flex: 1 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.cardAlt, paddingTop: SIZES.sm },
  itemCount: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  viewCta: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
});
