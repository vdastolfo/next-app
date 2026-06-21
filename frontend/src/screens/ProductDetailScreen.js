import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, FlatList, Dimensions, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { auctionsAPI, MEDIA_URL } from '../services/api';
import { useAuctionSocket } from '../services/websocket';
import { PrimaryButton, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 320;

function secondsToTime(total) {
  const s = Math.max(0, Math.floor(total));
  return {
    hrs: String(Math.floor(s / 3600)).padStart(2, '0'),
    min: String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
    sec: String(s % 60).padStart(2, '0'),
  };
}

export default function ProductDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [bidToast, setBidToast] = useState(null);
  const [showGanadorModal, setShowGanadorModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const timerRef = useRef(null);

  // Inicializa el countdown cuando llega el item
  useEffect(() => {
    if (item?.segundosRestantes != null) {
      setSegundos(item.segundosRestantes);
    }
  }, [item?.segundosRestantes]);

  // Countdown en tiempo real
  useEffect(() => {
    if (segundos <= 0) return;
    timerRef.current = setInterval(() => {
      setSegundos(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [segundos > 0 && item?.id]);

  // WebSocket: recibir actualizaciones de pujas y cierre de ítem
  const handleBidUpdate = useCallback((update) => {
    if (update.tipo === 'CERRADO') {
      setSegundos(0);
      setItem(prev => prev ? { ...prev, esItemActivo: false, subastado: 'si' } : prev);
      if (user?.clienteId && update.ganadorClienteId === user.clienteId) {
        setShowGanadorModal(true);
      }
      return;
    }
    setItem(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mejorPujaActual: update.mejorPuja,
        pujaMinima: update.pujaMinima,
        pujaMaxima: update.pujaMaxima,
      };
    });
    setBidToast(`Nueva oferta: $${Number(update.mejorPuja).toLocaleString()}`);
    setTimeout(() => setBidToast(null), 3000);
  }, [user]);

  useAuctionSocket(item?.id, handleBidUpdate);

  useEffect(() => { loadItem(); }, [itemId]);

  const loadItem = async () => {
    try {
      setError(null);
      const response = await auctionsAPI.getItem(itemId);
      setItem(response.data);
    } catch (err) {
      if (err.isNetworkError) {
        setError('Sin conexión a internet.');
      } else if (err.response?.status === 404) {
        setError('Este lote no existe o ya fue subastado.');
      } else {
        setItem({
          id: itemId,
          nombreProducto: 'Sillón Luis XV',
          descripcionCompleta: 'Sillón estilo Luis XV en perfecto estado, tapizado original. Pieza única de colección.',
          precioBase: 5000,
          mejorPujaActual: 6630,
          pujaMinima: 6680,
          pujaMaxima: 7630,
          comision: 500,
          loteNumero: `LOTE #${itemId}`,
          subastado: 'no',
          fotoIds: [],
          piezas: [],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePujar = () => {
    if (!user) { navigation.navigate('Login'); return; }
    setShowBidModal(true);
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
  };

  if (loading) return <LoadingScreen />;

  if (error && !item) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.errorState}>
          <Text style={styles.errorStateText}>⚠ {error}</Text>
          <TouchableOpacity onPress={loadItem} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const hasFotos = item.fotoIds?.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── ZONA DE IMAGEN / CARRUSEL ── */}
        <View style={styles.imageContainer}>
          {/* Header flotante */}
          <View style={styles.imageHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.imageHeaderRight}>
              <TouchableOpacity style={styles.iconBtn}>
                <Text style={styles.iconBtnText}>⬆</Text>
              </TouchableOpacity>
              <View style={styles.avatarSmall} />
            </View>
          </View>

          {/* Carrusel o placeholder */}
          {hasFotos ? (
            <FlatList
              data={item.fotoIds}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(id) => String(id)}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
                setCarouselIndex(idx);
              }}
              renderItem={({ item: fotoId, index }) => (
                <TouchableOpacity activeOpacity={0.92} onPress={() => openLightbox(index)}>
                  <Image
                    source={{ uri: `${MEDIA_URL}/fotos/${fotoId}` }}
                    style={{ width: SW, height: CAROUSEL_HEIGHT }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderEmoji}>🛋</Text>
            </View>
          )}

          {/* Dots del carrusel */}
          {hasFotos && item.fotoIds.length > 1 && (
            <View style={styles.dotsRow}>
              {item.fotoIds.map((_, i) => (
                <View key={i} style={[styles.dot, i === carouselIndex && styles.dotActive]} />
              ))}
            </View>
          )}

          {/* Badge lote */}
          <View style={styles.loteBadge}>
            <Text style={styles.loteBadgeText}>{item.loteNumero}</Text>
          </View>

          {/* Botón PUJAR sobre imagen */}
          {user && item?.esItemActivo && segundos > 0 && (
            <TouchableOpacity style={styles.pujiarOverBtn} onPress={handlePujar}>
              <Text style={styles.pujiarOverBtnText}>PUJAR ⬆</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── INFO DEL PRODUCTO ── */}
        <View style={styles.infoContainer}>
          <View style={styles.badgeRow}>
            <Text style={styles.categoryLabel}>✅ BIENES DE HERENCIA</Text>
            <Text style={styles.ratingText}>• CALIFICACIÓN 4.9</Text>
          </View>

          <Text style={styles.productTitle}>{item.nombreProducto}</Text>

          {/* Countdown */}
          {item.subastado === 'si' ? (
            <View style={[styles.countdownCard, styles.countdownCardEnded]}>
              <Text style={styles.countdownLabel}>LOTE FINALIZADO</Text>
            </View>
          ) : item.esItemActivo ? (
            (() => { const t = secondsToTime(segundos); return (
            <View style={[styles.countdownCard, segundos <= 0 && styles.countdownCardEnded]}>
              <Text style={styles.countdownLabel}>
                {segundos > 0 ? 'TERMINA EN:' : 'SUBASTA FINALIZADA'}
              </Text>
              {segundos > 0 && (
                <View style={styles.countdownRow}>
                  <View style={styles.countdownUnit}>
                    <Text style={styles.countdownNumber}>{t.hrs}</Text>
                    <Text style={styles.countdownUnitLabel}>HRS</Text>
                  </View>
                  <Text style={styles.countdownSep}>:</Text>
                  <View style={styles.countdownUnit}>
                    <Text style={styles.countdownNumber}>{t.min}</Text>
                    <Text style={styles.countdownUnitLabel}>MIN</Text>
                  </View>
                  <Text style={styles.countdownSep}>:</Text>
                  <View style={styles.countdownUnit}>
                    <Text style={styles.countdownNumber}>{t.sec}</Text>
                    <Text style={styles.countdownUnitLabel}>SEC</Text>
                  </View>
                </View>
              )}
            </View>
            ); })()
          ) : (
            <View style={styles.countdownCard}>
              <Text style={styles.countdownLabel}>ESPERANDO TURNO</Text>
              <Text style={styles.countdownWaiting}>
                Este lote aún no está en subasta
              </Text>
            </View>
          )}

          {/* Descripción */}
          <Text style={styles.descriptionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{item.descripcionCompleta}</Text>

          {/* Piezas */}
          {item.piezas?.length > 0 && (
            <View style={styles.piezasSection}>
              <Text style={styles.descriptionTitle}>Composición del lote</Text>
              {item.piezas.map((p) => (
                <View key={p.id} style={styles.piezaRow}>
                  <Text style={styles.piezaDesc}>{p.descripcion}</Text>
                  <Text style={styles.piezaCantidad}>×{p.cantidad}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Dueño actual */}
          {item.duenioActual && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Dueño actual</Text>
              <Text style={styles.priceValue}>{item.duenioActual}</Text>
            </View>
          )}

          {/* Precios */}
          {user ? (
            <>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Precio base</Text>
                <Text style={styles.priceValue}>${item.precioBase?.toLocaleString()}</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Mejor oferta actual</Text>
                <Text style={[styles.priceValue, { color: COLORS.secondary }]}>
                  ${item.mejorPujaActual?.toLocaleString()}
                </Text>
              </View>
            </>
          ) : (
            <TouchableOpacity
              style={styles.guestPriceBanner}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.guestPriceTitle}>Precios ocultos</Text>
              <Text style={styles.guestPriceSub}>Iniciá sesión para ver precios y pujar →</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: SIZES.xxl }} />
        </View>
      </ScrollView>

      {/* Toast de nueva oferta (WebSocket) */}
      {bidToast && (
        <View style={styles.bidToast}>
          <Text style={styles.bidToastText}>⬆ {bidToast}</Text>
        </View>
      )}

      {/* Botón PUJAR fijo abajo */}
      {user && (
        <View style={styles.bottomBar}>
          <PrimaryButton
            title="PUJAR ⬆"
            onPress={handlePujar}
            disabled={!item.esItemActivo || item.subastado === 'si' || segundos <= 0}
          />
        </View>
      )}

      {/* Modal de puja */}
      <BidModal
        visible={showBidModal}
        item={item}
        onClose={() => setShowBidModal(false)}
        onSuccess={() => { setShowBidModal(false); navigation.navigate('Activity'); }}
      />

      {/* Lightbox */}
      <PhotoLightbox
        visible={lightboxVisible}
        fotoIds={item.fotoIds || []}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxVisible(false)}
      />

      {/* Modal de ganador */}
      {showGanadorModal && (
        <Modal visible transparent animationType="fade">
          <View style={winStyles.overlay}>
            <View style={winStyles.card}>
              <Text style={winStyles.trophy}>🏆</Text>
              <Text style={winStyles.title}>¡Ganaste este lote!</Text>
              <Text style={winStyles.subtitle}>{item.nombreProducto}</Text>
              <Text style={winStyles.amount}>
                ${item.mejorPujaActual?.toLocaleString()}
              </Text>
              <Text style={winStyles.body}>
                Felicitaciones. El lote te fue adjudicado.{'\n'}
                Revisá tu actividad para más detalles.
              </Text>
              <TouchableOpacity
                style={winStyles.btn}
                onPress={() => { setShowGanadorModal(false); navigation.navigate('Activity'); }}
              >
                <Text style={winStyles.btnText}>VER MI ACTIVIDAD</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={winStyles.closeBtn}
                onPress={() => setShowGanadorModal(false)}
              >
                <Text style={winStyles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ── LIGHTBOX ─────────────────────────────────────────────────────────────────
function PhotoLightbox({ visible, fotoIds, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const listRef = useRef(null);

  useEffect(() => {
    if (visible) setCurrentIndex(initialIndex);
  }, [visible, initialIndex]);

  if (!visible || fotoIds.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={lbStyles.container}>
        {/* Cerrar */}
        <TouchableOpacity style={lbStyles.closeBtn} onPress={onClose}>
          <Text style={lbStyles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Contador */}
        <Text style={lbStyles.counter}>{currentIndex + 1} / {fotoIds.length}</Text>

        {/* Imágenes */}
        <FlatList
          ref={listRef}
          data={fotoIds}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SW, offset: SW * index, index })}
          style={{ flex: 1 }}
          keyExtractor={(id) => String(id)}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
            setCurrentIndex(idx);
          }}
          renderItem={({ item: fotoId }) => (
            <View style={{ width: SW, height: SH, justifyContent: 'center', alignItems: 'center' }}>
              <Image
                source={{ uri: `${MEDIA_URL}/fotos/${fotoId}` }}
                style={{ width: SW, height: SH * 0.7 }}
                resizeMode="contain"
              />
            </View>
          )}
        />

        {/* Dots */}
        {fotoIds.length > 1 && (
          <View style={lbStyles.dotsRow}>
            {fotoIds.map((_, i) => (
              <View key={i} style={[lbStyles.dot, i === currentIndex && lbStyles.dotActive]} />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

// ── MODAL DE PUJA ─────────────────────────────────────────────────────────────
function BidModal({ visible, item, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('input');
  const [error, setError] = useState(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handleBid = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Ingresá un monto válido');
      return;
    }
    const numAmount = parseFloat(amount);
    const minBid = item.pujaMinima;
    const maxBid = item.pujaMaxima;
    if (minBid && numAmount < minBid) {
      setError(`Monto muy bajo. La puja mínima es $${minBid.toLocaleString()}`);
      return;
    }
    if (maxBid && numAmount > maxBid) {
      setError(`Monto muy alto. La puja máxima es $${maxBid.toLocaleString()}`);
      return;
    }
    setError(null);
    setStep('processing');
    Animated.timing(progressAnim, {
      toValue: 1, duration: 1500, useNativeDriver: false,
    }).start();
    try {
      await auctionsAPI.placeBid(item.id, numAmount, 1);
      setTimeout(() => onSuccess?.(), 1600);
    } catch (err) {
      setStep('input');
      progressAnim.setValue(0);
      if (err.isNetworkError) {
        setError('Sin conexión. No se registró la puja.');
      } else {
        setError(err.response?.data?.error || 'No se pudo registrar la puja.');
      }
    }
  };

  const reset = () => {
    setAmount(''); setStep('input');
    setError(null); progressAnim.setValue(0); onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>

          {step === 'processing' && (
            <View style={modalStyles.processingContainer}>
              <Animated.View style={[
                modalStyles.progressBar,
                { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
              ]} />
            </View>
          )}

          {step === 'input' && (
            <View>
              <View style={modalStyles.handle} />
              <Text style={modalStyles.modalTitle}>Hacer una puja</Text>
              <Text style={modalStyles.modalSubtitle}>
                Mejor oferta actual:{' '}
                <Text style={{ color: COLORS.secondary }}>${item?.mejorPujaActual?.toLocaleString()}</Text>
              </Text>
              <Text style={modalStyles.modalHint}>
                Mínimo: ${item?.pujaMinima?.toLocaleString()} • Máximo: ${item?.pujaMaxima?.toLocaleString()}
              </Text>
              <View style={modalStyles.amountRow}>
                <Text style={modalStyles.currencySymbol}>$</Text>
                <TextInput
                  style={modalStyles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={amount}
                  onChangeText={(t) => { setAmount(t); setError(null); }}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              {error && <Text style={modalStyles.errorText}>⚠ {error}</Text>}
              <PrimaryButton title="PUJAR" onPress={handleBid} style={modalStyles.confirmBtn} />
              <TouchableOpacity onPress={reset} style={modalStyles.cancelBtn}>
                <Text style={modalStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  backBtn: { padding: SIZES.md },
  backIcon: { color: COLORS.textPrimary, fontSize: 24 },
  imageContainer: { position: 'relative' },
  imageHeader: {
    position: 'absolute', top: SIZES.md, left: SIZES.md, right: SIZES.md,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', zIndex: 10,
  },
  imageHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBtn: {
    width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { color: COLORS.textPrimary, fontSize: 18 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary },
  imagePlaceholder: {
    height: CAROUSEL_HEIGHT, backgroundColor: COLORS.cardAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  imagePlaceholderEmoji: { fontSize: 80 },
  dotsRow: {
    position: 'absolute', bottom: 56, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive: { backgroundColor: COLORS.textPrimary, width: 18 },
  loteBadge: {
    position: 'absolute', top: SIZES.xxl + SIZES.md, left: SIZES.md,
    backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.xs,
  },
  loteBadgeText: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  pujiarOverBtn: {
    position: 'absolute', bottom: SIZES.md, left: SIZES.md, right: SIZES.md,
    backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md, alignItems: 'center',
  },
  pujiarOverBtnText: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, letterSpacing: 1 },
  infoContainer: { padding: SIZES.lg },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  categoryLabel: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  ratingText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginLeft: SIZES.xs },
  productTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero, marginBottom: SIZES.lg },
  countdownCard: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg,
    padding: SIZES.lg, alignItems: 'center', marginBottom: SIZES.lg,
  },
  countdownLabel: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 2, marginBottom: SIZES.sm },
  countdownRow: { flexDirection: 'row', alignItems: 'center' },
  countdownUnit: { alignItems: 'center', minWidth: 60 },
  countdownNumber: { color: COLORS.error, fontFamily: FONTS.titleExtraBold, fontSize: 48 },
  countdownUnitLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textXs, letterSpacing: 1 },
  countdownSep: { color: COLORS.error, fontSize: 40, fontFamily: FONTS.titleBold, marginBottom: SIZES.sm },
  descriptionTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, marginBottom: SIZES.sm },
  descriptionText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, lineHeight: 24, marginBottom: SIZES.lg },
  piezasSection: { marginBottom: SIZES.lg },
  piezaRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SIZES.sm, borderBottomWidth: 1, borderBottomColor: COLORS.card,
  },
  piezaDesc: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, flex: 1 },
  piezaCantidad: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textMd, marginLeft: SIZES.sm },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SIZES.sm },
  priceLabel: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  priceValue: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd },
  bottomBar: { padding: SIZES.lg, paddingBottom: SIZES.xl, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.card },
  countdownCardEnded: { borderWidth: 1, borderColor: COLORS.error },
  countdownWaiting: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginTop: SIZES.xs },
  bidToast: {
    position: 'absolute', bottom: 100, left: SIZES.lg, right: SIZES.lg,
    backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, alignItems: 'center',
  },
  bidToastText: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd },
  guestPriceBanner: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  guestPriceTitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textMd,
    marginBottom: 4,
  },
  guestPriceSub: {
    color: COLORS.primary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
  },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  errorStateText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd, textAlign: 'center' },
  retryBtn: { marginTop: SIZES.md, padding: SIZES.md },
  retryBtnText: { color: COLORS.accent1, fontFamily: FONTS.bodySemiBold },
});

const winStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', padding: SIZES.xl },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusXl,
    padding: SIZES.xl, alignItems: 'center',
    borderWidth: 2, borderColor: COLORS.secondary,
  },
  trophy: { fontSize: 56, marginBottom: SIZES.md },
  title: { color: COLORS.secondary, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero, marginBottom: SIZES.xs },
  subtitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, textAlign: 'center', marginBottom: SIZES.sm },
  amount: { color: COLORS.secondary, fontFamily: FONTS.titleExtraBold, fontSize: 36, marginBottom: SIZES.md },
  body: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center', lineHeight: 22, marginBottom: SIZES.xl },
  btn: {
    backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusFull,
    paddingVertical: SIZES.md, paddingHorizontal: SIZES.xxl,
    marginBottom: SIZES.md, width: '100%', alignItems: 'center',
  },
  btnText: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, letterSpacing: 1 },
  closeBtn: { paddingVertical: SIZES.sm },
  closeBtnText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
});

const lbStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'rgba(0,0,0,0.93)', justifyContent: 'center' },
  closeBtn: {
    position: 'absolute', top: 50, right: SIZES.lg, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: COLORS.textPrimary, fontSize: 18, fontFamily: FONTS.titleBold },
  counter: {
    position: 'absolute', top: 56, left: 0, right: 0,
    textAlign: 'center', color: 'rgba(255,255,255,0.6)',
    fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm,
  },
  dotsRow: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive: { backgroundColor: COLORS.textPrimary, width: 18 },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.card, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.lg, paddingBottom: SIZES.xxl, maxHeight: '90%' },
  handle: { width: 40, height: 4, backgroundColor: COLORS.accent2, borderRadius: 2, alignSelf: 'center', marginBottom: SIZES.lg },
  modalTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.sm },
  modalSubtitle: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, marginBottom: SIZES.xs },
  modalHint: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginBottom: SIZES.lg },
  amountRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.lg },
  currencySymbol: { color: COLORS.accent1, fontFamily: FONTS.titleBold, fontSize: 36, marginRight: SIZES.sm },
  amountInput: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: 36 },
  productCard: { flexDirection: 'row', backgroundColor: COLORS.cardAlt, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.lg, gap: SIZES.md },
  productThumb: { width: 70, height: 70, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.input },
  productInfo: { flex: 1 },
  productName: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg },
  productBidLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, marginTop: SIZES.xs },
  productBidValue: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl },
  tuOfertaLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 2, textAlign: 'center', marginBottom: SIZES.xs },
  tuOfertaValue: { color: COLORS.textPrimary, fontFamily: FONTS.titleExtraBold, fontSize: 36, textAlign: 'center', marginBottom: SIZES.lg },
  breakdown: { backgroundColor: COLORS.cardAlt, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SIZES.sm },
  breakdownLabel: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, flex: 1 },
  breakdownValue: { color: COLORS.textPrimary, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.input, marginTop: SIZES.xs, paddingTop: SIZES.sm },
  totalLabel: { color: COLORS.accent1, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textMd, letterSpacing: 1, flex: 1 },
  totalValue: { color: COLORS.accent1, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg },
  disclaimer: { flexDirection: 'row', backgroundColor: COLORS.input, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.lg, gap: SIZES.sm },
  disclaimerIcon: { fontSize: 18, marginTop: 2 },
  disclaimerText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, lineHeight: 20 },
  processingContainer: { height: 200, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SIZES.lg },
  progressBar: { height: 6, backgroundColor: COLORS.secondary, borderRadius: 3, alignSelf: 'flex-start' },
  confirmBtn: { marginBottom: SIZES.sm },
  cancelBtn: { alignItems: 'center', paddingVertical: SIZES.md },
  cancelText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
  errorText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm, marginBottom: SIZES.md, textAlign: 'center' },
});
