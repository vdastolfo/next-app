import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, Animated, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { auctionsAPI } from '../services/api';
import { PrimaryButton, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

// ── DETALLE DEL PRODUCTO (frame 07) ──────────────────────────────────────────
export default function ProductDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hrs: '00', min: '00', sec: '00' });

  useEffect(() => {
    loadItem();
  }, [itemId]);

  // Countdown timer simulado
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let s = parseInt(prev.sec) - 1;
        let m = parseInt(prev.min);
        let h = parseInt(prev.hrs);
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { clearInterval(timer); return { hrs: '00', min: '00', sec: '00' }; }
        return {
          hrs: String(h).padStart(2, '0'),
          min: String(m).padStart(2, '0'),
          sec: String(s).padStart(2, '0'),
        };
      });
    }, 1000);
    // Valor inicial simulado: 1 hora 34 segundos
    setTimeLeft({ hrs: '00', min: '01', sec: '34' });
    return () => clearInterval(timer);
  }, []);

  const handlePujar = () => {
  if (!user) {
    navigation.navigate('Login');
      return;
    }
    setShowBidModal(true);
  };

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
        // Mock para desarrollo
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
          categoriaSubasta: 'platino',
        });
      }
    } finally {
      setLoading(false);
    }
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen del producto */}
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

          {/* Placeholder imagen */}
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderEmoji}>🛋</Text>
          </View>

          {/* Badge lote */}
          <View style={styles.loteBadge}>
            <Text style={styles.loteBadgeText}>{item.loteNumero}</Text>
          </View>

          {/* Botón PUJAR sobre imagen */}
          <TouchableOpacity
            style={styles.pujiarOverBtn}
            onPress={handlePujar}
          >
            <Text style={styles.pujiarOverBtnText}>PUJAR ⬆</Text>
          </TouchableOpacity>
        </View>

        {/* Info del producto */}
        <View style={styles.infoContainer}>
          <View style={styles.badgeRow}>
            <Text style={styles.categoryLabel}>✅ BIENES DE HERENCIA</Text>
            <Text style={styles.ratingText}>• CALIFICACIÓN 4.9</Text>
          </View>

          <Text style={styles.productTitle}>{item.nombreProducto}</Text>

          {/* Countdown */}
          <View style={styles.countdownCard}>
            <Text style={styles.countdownLabel}>TERMINA EN:</Text>
            <View style={styles.countdownRow}>
              <View style={styles.countdownUnit}>
                <Text style={styles.countdownNumber}>{timeLeft.hrs}</Text>
                <Text style={styles.countdownUnitLabel}>HRS</Text>
              </View>
              <Text style={styles.countdownSep}>:</Text>
              <View style={styles.countdownUnit}>
                <Text style={styles.countdownNumber}>{timeLeft.min}</Text>
                <Text style={styles.countdownUnitLabel}>MIN</Text>
              </View>
              <Text style={styles.countdownSep}>:</Text>
              <View style={styles.countdownUnit}>
                <Text style={styles.countdownNumber}>{timeLeft.sec}</Text>
                <Text style={styles.countdownUnitLabel}>SEC</Text>
              </View>
            </View>
          </View>

          {/* Descripción */}
          <Text style={styles.descriptionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{item.descripcionCompleta}</Text>

          {/* Precio base */}
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

          <View style={{ height: SIZES.xxl }} />
        </View>
      </ScrollView>

      {/* Botón PUJAR fijo abajo */}
      <View style={styles.bottomBar}>
        <PrimaryButton
          title="PUJAR ⬆"
          onPress={handlePujar}
          disabled={item.subastado === 'si'}
        />
      </View>

      {/* Modal de puja */}
      <BidModal
        visible={showBidModal}
        item={item}
        onClose={() => setShowBidModal(false)}
        onSuccess={(result) => {
          setShowBidModal(false);
          navigation.navigate('Activity');
        }}
      />
    </SafeAreaView>
  );
}

// ── MODAL DE PUJA (frames 08 y 09) ───────────────────────────────────────────
function BidModal({ visible, item, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState('input'); // 'input' | 'confirm' | 'processing'
  const [error, setError] = useState(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handlePreview = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Ingresá un monto válido');
      return;
    }

    const numAmount = parseFloat(amount);
    const minBid = item.pujaMinima || (item.mejorPujaActual * 1.01);
    const maxBid = item.pujaMaxima || (item.mejorPujaActual * 1.20);

    if (numAmount < minBid) {
      setError(`La puja mínima es $${minBid.toLocaleString()}`);
      return;
    }

    setError(null);

    // Calcular preview localmente para no hacer un request extra
    const comision = numAmount * 0.10;
    const envio = 75;
    setPreview({
      tuPuja: numAmount,
      comisionComprador: comision,
      envioEstimado: envio,
      totalAPagar: numAmount + comision + envio,
    });
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setStep('processing');

    // Animar barra de progreso
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    try {
      await auctionsAPI.placeBid(item.id, parseFloat(amount), 1);
      setTimeout(() => onSuccess?.(), 1600);
    } catch (err) {
      setStep('confirm');
      if (err.isNetworkError) {
        setError('Sin conexión. No se registró la puja.');
      } else {
        setError(err.response?.data?.error || 'No se pudo registrar la puja.');
      }
    }
  };

  const reset = () => {
    setAmount('');
    setPreview(null);
    setStep('input');
    setError(null);
    progressAnim.setValue(0);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>

          {/* Step: Procesando */}
          {step === 'processing' && (
            <View style={modalStyles.processingContainer}>
              <Animated.View style={[
                modalStyles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })
                }
              ]} />
            </View>
          )}

          {/* Step: Confirmación */}
          {step === 'confirm' && preview && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Mini card del producto */}
              <View style={modalStyles.productCard}>
                <View style={modalStyles.productThumb} />
                <View style={modalStyles.productInfo}>
                  <Text style={modalStyles.productName}>{item.nombreProducto}</Text>
                  <Text style={modalStyles.productBidLabel}>PUJA MÁS ALTA</Text>
                  <Text style={modalStyles.productBidValue}>
                    ${item.mejorPujaActual?.toLocaleString()}
                  </Text>
                </View>
              </View>

              <Text style={modalStyles.tuOfertaLabel}>TU OFERTA</Text>
              <Text style={modalStyles.tuOfertaValue}>${parseFloat(amount).toLocaleString()}</Text>

              {/* Desglose */}
              <View style={modalStyles.breakdown}>
                <View style={modalStyles.breakdownRow}>
                  <Text style={modalStyles.breakdownLabel}>Tu puja</Text>
                  <Text style={modalStyles.breakdownValue}>
                    ${preview.tuPuja.toLocaleString()}
                  </Text>
                </View>
                <View style={modalStyles.breakdownRow}>
                  <Text style={modalStyles.breakdownLabel}>Comisión del comprador (10%)</Text>
                  <Text style={modalStyles.breakdownValue}>
                    ${preview.comisionComprador.toLocaleString()}
                  </Text>
                </View>
                <View style={modalStyles.breakdownRow}>
                  <Text style={modalStyles.breakdownLabel}>Envío estimado</Text>
                  <Text style={modalStyles.breakdownValue}>
                    ${preview.envioEstimado.toLocaleString()}
                  </Text>
                </View>
                <View style={[modalStyles.breakdownRow, modalStyles.totalRow]}>
                  <Text style={modalStyles.totalLabel}>TOTAL A PAGAR</Text>
                  <Text style={modalStyles.totalValue}>
                    ${preview.totalAPagar.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Disclaimer legal */}
              <View style={modalStyles.disclaimer}>
                <Text style={modalStyles.disclaimerIcon}>⬆</Text>
                <Text style={modalStyles.disclaimerText}>
                  Al realizar esta puja, usted entra en un contrato legalmente
                  vinculante para comprar este artículo de Next si resulta ser el ganador.
                </Text>
              </View>

              {error && (
                <Text style={modalStyles.errorText}>⚠ {error}</Text>
              )}

              <PrimaryButton
                title="CONFIRMAR PUJA"
                onPress={handleConfirm}
                style={modalStyles.confirmBtn}
              />
              <TouchableOpacity onPress={() => setStep('input')} style={modalStyles.cancelBtn}>
                <Text style={modalStyles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* Step: Ingreso de monto */}
          {step === 'input' && (
            <View>
              <View style={modalStyles.handle} />
              <Text style={modalStyles.modalTitle}>Hacer una puja</Text>
              <Text style={modalStyles.modalSubtitle}>
                Mejor oferta actual:{' '}
                <Text style={{ color: COLORS.secondary }}>
                  ${item?.mejorPujaActual?.toLocaleString()}
                </Text>
              </Text>
              <Text style={modalStyles.modalHint}>
                Mínimo: ${item?.pujaMinima?.toLocaleString()} •
                Máximo: ${item?.pujaMaxima?.toLocaleString()}
              </Text>

              <View style={modalStyles.amountRow}>
                <Text style={modalStyles.currencySymbol}>$</Text>
                <TextInput
                  style={modalStyles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.textMuted}
                  value={amount}
                  onChangeText={(t) => {
                    setAmount(t);
                    setError(null);
                  }}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              {error && <Text style={modalStyles.errorText}>⚠ {error}</Text>}

              <PrimaryButton
                title="Ver resumen"
                onPress={handlePreview}
                style={modalStyles.confirmBtn}
              />
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
    position: 'absolute',
    top: SIZES.md,
    left: SIZES.md,
    right: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  imageHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm },
  iconBtn: {
    width: 40, height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: COLORS.textPrimary, fontSize: 18 },
  avatarSmall: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
  },
  imagePlaceholder: {
    height: 320,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderEmoji: { fontSize: 80 },
  loteBadge: {
    position: 'absolute',
    top: SIZES.xxl + SIZES.md,
    left: SIZES.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
  },
  loteBadgeText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
  },
  pujiarOverBtn: {
    position: 'absolute',
    bottom: SIZES.md,
    left: SIZES.md,
    right: SIZES.md,
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    alignItems: 'center',
  },
  pujiarOverBtnText: {
    color: COLORS.background,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textMd,
    letterSpacing: 1,
  },
  infoContainer: { padding: SIZES.lg },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.sm },
  categoryLabel: {
    color: COLORS.secondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1,
  },
  ratingText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    marginLeft: SIZES.xs,
  },
  productTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleExtraBold,
    fontSize: SIZES.textHero,
    marginBottom: SIZES.lg,
  },
  countdownCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  countdownLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 2,
    marginBottom: SIZES.sm,
  },
  countdownRow: { flexDirection: 'row', alignItems: 'center' },
  countdownUnit: { alignItems: 'center', minWidth: 60 },
  countdownNumber: {
    color: COLORS.error,
    fontFamily: FONTS.titleExtraBold,
    fontSize: 48,
  },
  countdownUnitLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textXs,
    letterSpacing: 1,
  },
  countdownSep: {
    color: COLORS.error,
    fontSize: 40,
    fontFamily: FONTS.titleBold,
    marginBottom: SIZES.sm,
  },
  descriptionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textLg,
    marginBottom: SIZES.sm,
  },
  descriptionText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  priceLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
  },
  priceValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textMd,
  },
  bottomBar: {
    padding: SIZES.lg,
    paddingBottom: SIZES.xl,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  errorStateText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd, textAlign: 'center' },
  retryBtn: { marginTop: SIZES.md, padding: SIZES.md },
  retryBtnText: { color: COLORS.accent1, fontFamily: FONTS.bodySemiBold },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    paddingBottom: SIZES.xxl,
    maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: COLORS.accent2,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SIZES.lg,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textXl,
    marginBottom: SIZES.sm,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    marginBottom: SIZES.xs,
  },
  modalHint: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
    marginBottom: SIZES.lg,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  currencySymbol: {
    color: COLORS.accent1,
    fontFamily: FONTS.titleBold,
    fontSize: 36,
    marginRight: SIZES.sm,
  },
  amountInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: 36,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardAlt,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    gap: SIZES.md,
  },
  productThumb: {
    width: 70, height: 70,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.input,
  },
  productInfo: { flex: 1 },
  productName: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textLg,
  },
  productBidLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1,
    marginTop: SIZES.xs,
  },
  productBidValue: {
    color: COLORS.secondary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textXl,
  },
  tuOfertaLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  tuOfertaValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleExtraBold,
    fontSize: 36,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  breakdown: {
    backgroundColor: COLORS.cardAlt,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SIZES.sm,
  },
  breakdownLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    flex: 1,
  },
  breakdownValue: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textMd,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.input,
    marginTop: SIZES.xs,
    paddingTop: SIZES.sm,
  },
  totalLabel: {
    color: COLORS.accent1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textMd,
    letterSpacing: 1,
    flex: 1,
  },
  totalValue: {
    color: COLORS.accent1,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textLg,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  disclaimerIcon: { fontSize: 18, marginTop: 2 },
  disclaimerText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
    lineHeight: 20,
  },
  processingContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.lg,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.secondary,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  confirmBtn: { marginBottom: SIZES.sm },
  cancelBtn: { alignItems: 'center', paddingVertical: SIZES.md },
  cancelText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textMd,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
});
