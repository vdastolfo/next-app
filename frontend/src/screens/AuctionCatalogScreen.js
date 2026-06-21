import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../services/AuthContext';
import { auctionsAPI } from '../services/api';
import { AuctionCard, LoadingScreen } from '../components';
import { useAuctionLiveSocket } from '../services/websocket';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const CATEGORY_LABELS = {
  comun: 'Común', especial: 'Especial', plata: 'Plata', oro: 'Oro', platino: 'Platino',
};
const CATEGORY_COLORS = {
  comun: COLORS.textMuted, especial: COLORS.accent1,
  plata: '#C0C0C0', oro: COLORS.warning, platino: '#E8E8FF',
};
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(d) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}
function formatTime(t) { return t ? t.substring(0, 5) : ''; }

const CARD_STYLE = { width: '100%', marginRight: 0, marginBottom: SIZES.md };

export default function AuctionCatalogScreen({ route, navigation }) {
  const { subasta } = route.params;
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  const [notification, setNotification] = useState(null);

  const loadItems = async () => {
    try {
      setError(null);
      const response = await auctionsAPI.getAuctionItems(subasta.id);
      const loaded = response.data || [];
      setItems(loaded);
      const active = loaded.find((i) => i.esItemActivo);
      setActiveItemId(active?.id ?? null);
    } catch (err) {
      setError(err.isNetworkError ? 'Sin conexión.' : 'No se pudieron cargar los lotes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadItems(); }, [subasta.id]));

  useAuctionLiveSocket(subasta.id, (update) => {
    const nuevoItem = update.itemActivo ?? null;
    setActiveItemId(nuevoItem?.id ?? null);
    if (nuevoItem) {
      setNotification(`Ahora subastando: ${nuevoItem.nombreProducto}`);
      setTimeout(() => setNotification(null), 4000);
    } else {
      // Un ítem cerró — recargar para mostrar estado VENDIDO actualizado
      loadItems();
    }
  });

  const activeItem = items.find((i) => i.id === activeItemId) ?? null;
  // Derivar estado de los propios ítems (más fresco que el param de navegación)
  const allSold = items.length > 0 && items.every((i) => i.subastado === 'si');
  const isFinalized = allSold || subasta.estado === 'cerrada';

  const catColor = CATEGORY_COLORS[subasta.categoria] || COLORS.textMuted;
  const catLabel = CATEGORY_LABELS[subasta.categoria] || subasta.categoria;

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Catálogo</Text>
          <Text style={styles.headerSub} numberOfLines={1}>{subasta.ubicacion}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Info bar */}
      <View style={styles.infoBar}>
        <View style={styles.infoTopRow}>
          <View style={[styles.catChip, { borderColor: catColor }]}>
            <Text style={[styles.catChipText, { color: catColor }]}>{catLabel}</Text>
          </View>
          <Text style={styles.infoDate}>{formatDate(subasta.fecha)} · {formatTime(subasta.hora)}hs</Text>
          {!isFinalized ? (
            <View style={styles.liveChip}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>EN VIVO</Text>
            </View>
          ) : (
            <View style={styles.closedChip}>
              <Text style={styles.closedText}>FINALIZADA</Text>
            </View>
          )}
        </View>
        {subasta.rematadorNombre && (
          <View style={styles.rematadorRow}>
            <Text style={styles.rematadorLabel}>REMATADOR</Text>
            <Text style={styles.rematadorName}>
              {subasta.rematadorNombre}
              {subasta.rematadorMatricula ? ` · Mat. ${subasta.rematadorMatricula}` : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Banner: lote activo o subasta finalizada */}
      {isFinalized ? (
        <View style={[styles.waitingBanner, { borderLeftColor: COLORS.textMuted }]}>
          <Text style={styles.waitingText}>Esta subasta finalizó. Podés ver todos los lotes subastados.</Text>
        </View>
      ) : activeItem ? (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => navigation.navigate('ProductDetail', { itemId: activeItem.id })}
          activeOpacity={0.85}
        >
          <View style={styles.activeBannerLeft}>
            <View style={styles.activePulseDot} />
            <View>
              <Text style={styles.activeBannerLabel}>SUBASTANDO AHORA</Text>
              <Text style={styles.activeBannerName} numberOfLines={1}>
                {activeItem.loteNumero} · {activeItem.nombreProducto}
              </Text>
            </View>
          </View>
          <Text style={styles.activeBannerArrow}>›</Text>
        </TouchableOpacity>
      ) : null}

      {/* Notificación de cambio */}
      {notification && (
        <View style={styles.notification}>
          <Text style={styles.notificationText}>🔔 {notification}</Text>
        </View>
      )}

      {/* Banner invitado */}
      {!user && (
        <TouchableOpacity
          style={styles.guestBanner}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.85}
        >
          <Text style={styles.guestBannerTag}>MODO INVITADO</Text>
          <Text style={styles.guestBannerCta}>Iniciá sesión para ver precios →</Text>
        </TouchableOpacity>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠ {error}</Text>
          <TouchableOpacity onPress={loadItems}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadItems(); }}
            tintColor={COLORS.secondary}
          />
        }
        ListHeaderComponent={
          <Text style={styles.listTitle}>
            {items.length} {items.length === 1 ? 'lote' : 'lotes'} en catálogo
            {items.filter(i => i.subastado === 'si').length > 0
              ? ` · ${items.filter(i => i.subastado === 'si').length} vendidos`
              : ''}
          </Text>
        }
        renderItem={({ item }) => (
          <AuctionCard
            item={item}
            isGuest={!user}
            style={[
              CARD_STYLE,
              item.id === activeItemId && item.subastado !== 'si' && styles.activeCardHighlight,
            ]}
            onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
            onBid={() => navigation.navigate('ProductDetail', { itemId: item.id })}
          />
        )}
        ListEmptyComponent={
          !error && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay lotes disponibles en este catálogo.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.card,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: COLORS.textPrimary, fontSize: 22 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg },
  headerSub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: 1 },
  infoBar: { paddingHorizontal: SIZES.lg, paddingVertical: SIZES.sm, backgroundColor: COLORS.card },
  infoTopRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, flexWrap: 'wrap' },
  rematadorRow: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginTop: SIZES.xs },
  rematadorLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  rematadorName: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  catChip: { borderWidth: 1, borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.sm + 2, paddingVertical: 2 },
  catChipText: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  infoDate: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, flex: 1 },
  liveChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
  liveText: { color: COLORS.success, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  closedChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  closedText: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },

  activeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderLeftWidth: 4, borderLeftColor: COLORS.error,
    paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
  },
  activeBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, flex: 1 },
  activePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },
  activeBannerLabel: { color: COLORS.error, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1.5 },
  activeBannerName: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, marginTop: 1 },
  activeBannerArrow: { color: COLORS.textMuted, fontSize: 24, marginLeft: SIZES.sm },

  waitingBanner: {
    backgroundColor: COLORS.card, paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
    borderLeftWidth: 4, borderLeftColor: COLORS.textMuted,
  },
  waitingText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },

  notification: {
    backgroundColor: 'rgba(255,193,7,0.12)', paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
  },
  notificationText: { color: COLORS.warning, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },

  guestBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.cardAlt, marginHorizontal: SIZES.lg, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, marginTop: SIZES.md, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  guestBannerTag: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1.5 },
  guestBannerCta: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },

  errorBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.12)', marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd, padding: SIZES.md, marginTop: SIZES.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.error,
  },
  errorText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm, flex: 1 },
  retryText: { color: COLORS.accent1, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },

  listContent: { padding: SIZES.lg, paddingBottom: 100 },
  listTitle: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginBottom: SIZES.md },

  activeCardHighlight: { borderWidth: 2, borderColor: COLORS.error },

  emptyState: { paddingVertical: SIZES.xl, alignItems: 'center' },
  emptyText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center' },
});
