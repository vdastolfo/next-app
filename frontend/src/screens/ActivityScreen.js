import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, RefreshControl, Image, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../services/AuthContext';
import { activityAPI, paymentAPI, MEDIA_URL } from '../services/api';
import { NextLogo, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const ESTADO_PAGO_LABELS = {
  pendiente: 'Pago pendiente',
  pagado: 'Pagado',
};
const ESTADO_PAGO_COLORS = {
  pendiente: COLORS.warning,
  pagado: COLORS.secondary,
};

const ESTADO_PAQUETE_LABELS = {
  pendiente_de_pago: 'Pendiente de pago',
  empaquetado: 'Empaquetado',
  despachado: 'Despachado',
  entregado: 'Entregado',
};
const PAQUETE_STEPS = ['pendiente_de_pago', 'empaquetado', 'despachado', 'entregado'];

export default function ActivityScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab] = useState('bidding');
  const [bidding, setBidding] = useState([]);
  const [won, setWon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [winToast, setWinToast] = useState(null);
  const [payingId, setPayingId] = useState(null);
  const [payModal, setPayModal] = useState(null); // puja activa en el modal
  const [payMethods, setPayMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadActivity();
    }, [])
  );

  const loadActivity = async () => {
    try {
      const [biddingRes, wonRes] = await Promise.all([
        activityAPI.getBidding(),
        activityAPI.getWon(),
      ]);
      setBidding(biddingRes.data || []);
      setWon(wonRes.data || []);
    } catch {
      // mantener datos anteriores si falla
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePay = async (puja) => {
    setLoadingMethods(true);
    setPayModal(puja);
    try {
      const res = await paymentAPI.list();
      const verified = (res.data || []).filter(m => m.verificado);
      setPayMethods(verified);
    } catch {
      setPayMethods([]);
    } finally {
      setLoadingMethods(false);
    }
  };

  const handleSelectMethod = (puja, method) => {
    const esDolares = puja.moneda === 'dolares';

    if (esDolares && method.tipo !== 'tarjeta') {
      Alert.alert(
        'Método no compatible',
        'No cuenta con fondos de dólares. Elija otra cuenta bancaria o una tarjeta de crédito.',
        [{ text: 'Entendido' }]
      );
      return;
    }

    const confirmar = async () => {
      setPayModal(null);
      setPayingId(puja.pujaId);
      try {
        await activityAPI.payWon(puja.pujaId, method.id);
        await loadActivity();
        setWinToast({ title: '¡Pago confirmado!', msg: 'Tu paquete está siendo preparado.' });
        setTimeout(() => setWinToast(null), 4000);
      } catch (e) {
        Alert.alert('Error', e.response?.data?.error || 'No se pudo procesar el pago.');
      } finally {
        setPayingId(null);
      }
    };

    if (esDolares && method.tipo === 'tarjeta') {
      Alert.alert(
        'Cobro en dólares',
        'Se cobrará el monto en dólares según el tipo de cambio aplicable.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: confirmar },
        ]
      );
    } else {
      Alert.alert(
        'Confirmar pago',
        `¿Confirmás el pago con ${method.display}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar', onPress: confirmar },
        ]
      );
    }
  };

  if (loading) return <LoadingScreen />;

  const data = tab === 'bidding' ? bidding : won;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <NextLogo size={36} showText={true} />
        <TouchableOpacity><Text style={styles.headerIcon}>🔔</Text></TouchableOpacity>
      </View>

      <View style={styles.pageTitleRow}>
        <Text style={styles.pageTitle}>Actividad</Text>
        <TouchableOpacity><Text style={styles.filterIcon}>⚙</Text></TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'bidding' && styles.tabActive]}
          onPress={() => setTab('bidding')}
        >
          <Text style={[styles.tabText, tab === 'bidding' && styles.tabTextActive]}>
            Pujando{bidding.length > 0 ? ` (${bidding.length})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'won' && styles.tabActive]}
          onPress={() => setTab('won')}
        >
          <Text style={[styles.tabText, tab === 'won' && styles.tabTextActive]}>
            Ganadas{won.length > 0 ? ` (${won.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.pujaId || item.itemId)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadActivity(); }}
            tintColor={COLORS.secondary}
          />
        }
        contentContainerStyle={{ padding: SIZES.lg, paddingBottom: 100 }}
        renderItem={({ item }) =>
          tab === 'bidding'
            ? <BiddingCard item={item} onPress={() => navigation.navigate('ProductDetail', { itemId: item.itemId })} />
            : <WonCard item={item} onPress={() => navigation.navigate('ProductDetail', { itemId: item.itemId })} onPay={() => handlePay(item)} paying={payingId === item.pujaId} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {tab === 'bidding'
                ? 'No estás participando en ninguna subasta.'
                : 'Todavía no ganaste ninguna subasta.'}
            </Text>
          </View>
        }
      />

      {/* Modal de selección de medio de pago */}
      <Modal
        visible={!!payModal}
        transparent
        animationType="slide"
        onRequestClose={() => setPayModal(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPayModal(null)}
        />
        <View style={styles.paySheet}>
          <View style={styles.paySheetHandle} />
          <Text style={styles.paySheetTitle}>Elegí cómo pagar</Text>
          {payModal && (
            <Text style={styles.paySheetSub}>
              {payModal.nombreProducto} · ${payModal.importePagado?.toLocaleString()}
              {payModal.moneda === 'dolares' ? ' USD' : ' ARS'}
            </Text>
          )}

          {loadingMethods ? (
            <ActivityIndicator color={COLORS.secondary} style={{ marginVertical: SIZES.xl }} />
          ) : (
            payMethods.map(method => (
              <TouchableOpacity
                key={method.id}
                style={styles.payMethodRow}
                onPress={() => handleSelectMethod(payModal, method)}
                activeOpacity={0.8}
              >
                <View style={styles.payMethodIcon}>
                  <Text style={styles.payMethodIconText}>
                    {method.tipo === 'tarjeta' ? '💳' : method.tipo === 'cuenta' ? '🏦' : '📄'}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payMethodDisplay}>{method.display}</Text>
                  <Text style={styles.payMethodTipo}>
                    {method.tipo === 'tarjeta' ? 'Tarjeta de crédito' : method.tipo === 'cuenta' ? 'Cuenta bancaria' : 'Cheque certificado'}
                  </Text>
                </View>
                <Text style={styles.payMethodArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.payCancelBtn} onPress={() => setPayModal(null)}>
            <Text style={styles.payCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {winToast && (
        <View style={styles.toastOverlay}>
          <View style={styles.toastCard}>
            <Text style={styles.toastTitle}>{winToast.title}</Text>
            <Text style={styles.toastMsg}>{winToast.msg}</Text>
            <TouchableOpacity style={styles.toastBtn} onPress={() => setWinToast(null)}>
              <Text style={styles.toastBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ── CARD: Pujando ─────────────────────────────────────────────────────────────
function BiddingCard({ item, onPress }) {
  const hasFoto = item.fotoIds?.[0];
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={cardStyles.cardImage}>
        {hasFoto ? (
          <Image
            source={{ uri: `${MEDIA_URL}/fotos/${item.fotoIds[0]}` }}
            style={cardStyles.cardPhoto}
            resizeMode="cover"
          />
        ) : (
          <Text style={cardStyles.cardImageEmoji}>📦</Text>
        )}
        <View style={cardStyles.liveBadge}>
          <View style={cardStyles.liveDot} />
          <Text style={cardStyles.liveBadgeText}>EN VIVO</Text>
        </View>
      </View>
      <View style={cardStyles.cardInfo}>
        <Text style={cardStyles.loteText}>{item.loteNumero}</Text>
        <Text style={cardStyles.productName}>{item.nombreProducto}</Text>
        <View style={cardStyles.cardBottom}>
          <View>
            <Text style={cardStyles.pujaLabel}>TU PUJA</Text>
            <Text style={cardStyles.pujaValue}>${item.tuPuja?.toLocaleString()}</Text>
          </View>
          <View style={cardStyles.statusRight}>
            {item.eresElMejor ? (
              <View style={cardStyles.winningBadge}>
                <Text style={cardStyles.winningText}>GANANDO ›</Text>
              </View>
            ) : (
              <View style={cardStyles.losingBadge}>
                <Text style={cardStyles.losingText}>SUPERADO ›</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── CARD: Ganadas ─────────────────────────────────────────────────────────────
function WonCard({ item, onPress, onPay, paying }) {
  const hasFoto = item.fotoIds?.[0];
  const estadoPago = item.estadoPago || 'pendiente';
  const estadoPaquete = item.estadoPaquete || 'pendiente_de_pago';
  const pagoColor = ESTADO_PAGO_COLORS[estadoPago] || COLORS.textMuted;
  const currentStep = PAQUETE_STEPS.indexOf(estadoPaquete);

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.88}>
      <View style={cardStyles.cardImage}>
        {hasFoto ? (
          <Image
            source={{ uri: `${MEDIA_URL}/fotos/${item.fotoIds[0]}` }}
            style={cardStyles.cardPhoto}
            resizeMode="cover"
          />
        ) : (
          <Text style={cardStyles.cardImageEmoji}>📦</Text>
        )}
        <View style={cardStyles.wonBadge}>
          <Text style={cardStyles.wonBadgeText}>🏆 GANADO</Text>
        </View>
      </View>

      <View style={cardStyles.cardInfo}>
        <Text style={cardStyles.loteText}>{item.loteNumero}</Text>
        <Text style={cardStyles.productName}>{item.nombreProducto}</Text>

        {/* Estado de pago */}
        <View style={cardStyles.statusRow}>
          <View style={[cardStyles.statusDot, { backgroundColor: pagoColor }]} />
          <Text style={[cardStyles.statusLabel, { color: pagoColor }]}>
            {ESTADO_PAGO_LABELS[estadoPago] || estadoPago}
          </Text>
        </View>

        {/* Tracker de paquete */}
        <View style={cardStyles.trackerRow}>
          {PAQUETE_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              <View style={[
                cardStyles.trackerStep,
                i <= currentStep && cardStyles.trackerStepDone,
              ]}>
                <Text style={[
                  cardStyles.trackerStepText,
                  i <= currentStep && cardStyles.trackerStepTextDone,
                ]} numberOfLines={2}>
                  {ESTADO_PAQUETE_LABELS[step]}
                </Text>
              </View>
              {i < PAQUETE_STEPS.length - 1 && (
                <View style={[cardStyles.trackerLine, i < currentStep && cardStyles.trackerLineDone]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Botón PAGAR o importe */}
        <View style={cardStyles.cardBottom}>
          {estadoPago === 'pendiente' ? (
            <TouchableOpacity
              style={[cardStyles.payBtn, paying && cardStyles.payBtnDisabled]}
              onPress={onPay}
              disabled={paying}
            >
              <Text style={cardStyles.payBtnText}>
                {paying ? 'Procesando…' : `PAGAR $${item.importePagado?.toLocaleString()}`}
              </Text>
            </TouchableOpacity>
          ) : (
            <View>
              <Text style={cardStyles.pujaLabel}>IMPORTE ABONADO</Text>
              <Text style={[cardStyles.pujaValue, { color: COLORS.secondary }]}>
                ${item.importePagado?.toLocaleString()}
              </Text>
            </View>
          )}
          <Text style={cardStyles.arrowIcon}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md },
  headerIcon: { fontSize: 22 },
  pageTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.lg, marginBottom: SIZES.md },
  pageTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero },
  filterIcon: { fontSize: 22 },
  tabRow: { flexDirection: 'row', marginHorizontal: SIZES.lg, backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: 4, marginBottom: SIZES.md },
  tab: { flex: 1, paddingVertical: SIZES.sm, alignItems: 'center', borderRadius: SIZES.radiusSm },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
  tabTextActive: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold },
  emptyState: { alignItems: 'center', paddingVertical: SIZES.xxl },
  emptyText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  paySheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.card, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl,
    paddingBottom: 40, paddingHorizontal: SIZES.lg, paddingTop: SIZES.md,
  },
  paySheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.textMuted, alignSelf: 'center', marginBottom: SIZES.md },
  paySheetTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: 4 },
  paySheetSub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginBottom: SIZES.lg },
  payMethodRow: {
    flexDirection: 'row', alignItems: 'center', gap: SIZES.md,
    backgroundColor: COLORS.cardAlt, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, marginBottom: SIZES.sm,
  },
  payMethodIcon: { width: 44, height: 44, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.input, alignItems: 'center', justifyContent: 'center' },
  payMethodIconText: { fontSize: 22 },
  payMethodDisplay: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textMd },
  payMethodTipo: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: 2 },
  payMethodArrow: { color: COLORS.textMuted, fontSize: 24 },
  payCancelBtn: { marginTop: SIZES.sm, paddingVertical: SIZES.md, alignItems: 'center' },
  payCancelText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },

  toastOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SIZES.lg },
  toastCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: SIZES.lg, borderTopWidth: 4, borderTopColor: COLORS.secondary },
  toastTitle: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.sm },
  toastMsg: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, lineHeight: 22, marginBottom: SIZES.lg },
  toastBtn: { backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusFull, paddingVertical: SIZES.md, alignItems: 'center' },
  toastBtnText: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, letterSpacing: 1 },
});

const cardStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, overflow: 'hidden', marginBottom: SIZES.md },
  cardImage: { height: 160, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardPhoto: { width: '100%', height: '100%' },
  cardImageEmoji: { fontSize: 60 },

  liveBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: SIZES.radiusFull, paddingHorizontal: 10, paddingVertical: 4 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.secondary },
  liveBadgeText: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },

  wonBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 4 },
  wonBadgeText: { color: COLORS.warning, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },

  cardInfo: { padding: SIZES.md },
  loteText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginBottom: 2 },
  productName: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.sm },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: SIZES.sm },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },

  trackerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SIZES.md, gap: 0 },
  trackerStep: { alignItems: 'center', flex: 1 },
  trackerStepDone: {},
  trackerStepText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: 9, textAlign: 'center', lineHeight: 12 },
  trackerStepTextDone: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold },
  trackerLine: { flex: 0.3, height: 2, backgroundColor: COLORS.input, marginTop: 4 },
  trackerLineDone: { backgroundColor: COLORS.secondary },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SIZES.xs },
  pujaLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  pujaValue: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXxl },
  arrowIcon: { color: COLORS.textMuted, fontSize: 28 },

  statusRight: { alignItems: 'flex-end' },
  winningBadge: { backgroundColor: 'rgba(0,230,118,0.12)', borderWidth: 1, borderColor: COLORS.secondary, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 4 },
  winningText: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs },
  losingBadge: { backgroundColor: 'rgba(255,82,82,0.12)', borderWidth: 1, borderColor: COLORS.error, borderRadius: SIZES.radiusFull, paddingHorizontal: 12, paddingVertical: 4 },
  losingText: { color: COLORS.error, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs },

  payBtn: { flex: 1, backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusMd, paddingVertical: SIZES.sm + 2, paddingHorizontal: SIZES.md, alignItems: 'center', marginRight: SIZES.sm },
  payBtnDisabled: { backgroundColor: COLORS.textMuted },
  payBtnText: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, letterSpacing: 0.5 },
});
