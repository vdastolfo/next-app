import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { paymentAPI } from '../services/api';
import { PrimaryButton, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function PaymentMethodsScreen({ navigation }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => { loadMethods(); }, []);

  const loadMethods = async () => {
    try {
      const res = await paymentAPI.list();
      setMethods(res.data || []);
      if (res.data?.length > 0) setSelected(res.data[0].id);
    } catch {
      setMethods([
        { id: 1, tipo: 'tarjeta', display: 'Visa XXXX-0123', logo: 'visa', verificado: true },
        { id: 2, tipo: 'tarjeta', display: 'Mastercard XXXX-4567', logo: 'mastercard', verificado: true },
        { id: 3, tipo: 'cuenta', display: 'Commonwealth Bank Australia\nBSB 00 0001', logo: 'banco', verificado: true },
      ]);
      setSelected(1);
    } finally {
      setLoading(false);
    }
  };

  const getLogoEmoji = (logo) => {
    const logos = { visa: '💳', mastercard: '🔴', banco: '🏦', cheque: '📄' };
    return logos[logo] || '💳';
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={paymentStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={paymentStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity><Text style={styles.headerIcon}>⬆</Text></TouchableOpacity>
        <View style={paymentStyles.avatarSmall} />
      </View>

      {successMessage && (
        <View style={paymentStyles.successBanner}>
          <Text style={paymentStyles.successText}>✅ {successMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: SIZES.lg, paddingBottom: 100 }}>
        {methods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[paymentStyles.methodCard, selected === method.id && paymentStyles.methodCardSelected]}
            onPress={() => setSelected(method.id)}
          >
            <Text style={paymentStyles.methodLogo}>{getLogoEmoji(method.logo)}</Text>
            <Text style={paymentStyles.methodDisplay}>{method.display}</Text>
            <View style={[paymentStyles.radio, selected === method.id && paymentStyles.radioSelected]}>
              {selected === method.id && <View style={paymentStyles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={paymentStyles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={paymentStyles.addBtnText}>AGREGAR MÉTODO DE PAGO</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddPaymentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          setSuccessMessage('Método de pago agregado correctamente');
          loadMethods();
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
    </SafeAreaView>
  );
}

// ── Modal Agregar Método de Pago ──────────────────────────────────────────────
export function AddPaymentModal({ visible, onClose, onSuccess }) {
  const [tab, setTab] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [expiryWarning, setExpiryWarning] = useState(null);

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');

  const [checkAmount, setCheckAmount] = useState('');
  const [errors, setErrors] = useState({});

  const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  const handleExpiryChange = (text) => {
    const digits = text.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    setCardExpiry(formatted);

    if (formatted.length < 5) { setExpiryWarning(null); return; }

    const month = parseInt(digits.slice(0, 2), 10);
    const year = 2000 + parseInt(digits.slice(2, 4), 10);
    if (month < 1 || month > 12) { setExpiryWarning(null); return; }

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth() + 1;

    if (year < curYear || (year === curYear && month < curMonth)) { setExpiryWarning(null); return; }

    let warnMonth = curMonth + 3;
    let warnYear = curYear;
    if (warnMonth > 12) { warnMonth -= 12; warnYear += 1; }

    if (year < warnYear || (year === warnYear && month <= warnMonth)) {
      setExpiryWarning(`Esta tarjeta vence en ${MESES[month - 1]} ${year}. Asegurate de actualizarla antes de participar en subastas.`);
    } else {
      setExpiryWarning(null);
    }
  };

  const validate = () => {
    const e = {};
    if (tab === 'tarjeta') {
      if (!cardName.trim()) e.cardName = 'El nombre es obligatorio';
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 15)
        e.cardNumber = 'Número de tarjeta inválido';
      if (!cardExpiry.trim()) {
        e.cardExpiry = 'La fecha de vencimiento es obligatoria';
      } else {
        const parts = cardExpiry.split('/');
        const month = parseInt(parts[0], 10);
        const year = 2000 + parseInt(parts[1] || '', 10);
        const now = new Date();
        if (parts.length !== 2 || parts[1].length !== 2 || month < 1 || month > 12) {
          e.cardExpiry = 'Formato inválido. Usá MM/AA';
        } else if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
          e.cardExpiry = 'Esta tarjeta está vencida';
        }
      }
      if (!cardCvv.trim() || cardCvv.length < 3) e.cardCvv = 'CVV inválido';
    } else if (tab === 'cuenta') {
      if (!bankName.trim()) e.bankName = 'El nombre del banco es obligatorio';
      if (!accountNumber.trim()) e.accountNumber = 'El número de cuenta es obligatorio';
      if (!bankCode.trim()) e.bankCode = 'El código de banco es obligatorio';
    } else if (tab === 'cheque') {
      if (!checkAmount || isNaN(parseFloat(checkAmount)) || parseFloat(checkAmount) <= 0)
        e.checkAmount = 'Ingresá un monto válido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = async () => {
    if (!validate()) return;
    setLoading(true);
    setProcessing(true);

    try {
      if (tab === 'tarjeta') {
        await paymentAPI.addCard({
          nombreTitular: cardName,
          numeroTarjeta: cardNumber.replace(/\s/g, ''),
          vencimiento: cardExpiry,
          cvv: cardCvv,
        });
      } else if (tab === 'cuenta') {
        await paymentAPI.addBankAccount({
          nombreBanco: bankName,
          numeroCuenta: accountNumber,
          codigoBanco: bankCode,
        });
      } else {
        await paymentAPI.addCheck({ monto: parseFloat(checkAmount) });
      }
      const display = tab === 'tarjeta'
        ? `Tarjeta XXXX-${cardNumber.replace(/\s/g, '').slice(-4)}`
        : tab === 'cuenta' ? bankName
        : `Cheque $${checkAmount}`;
      setTimeout(() => {
        setProcessing(false);
        onSuccess(display, tab);
      }, 1500);
    } catch (err) {
      setProcessing(false);
      setError(err.isNetworkError ? 'Sin conexión a internet.' : 'No se pudo agregar el método de pago.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv('');
    setBankName(''); setAccountNumber(''); setBankCode('');
    setCheckAmount(''); setErrors({}); setError(null);
    setExpiryWarning(null); setProcessing(false); onClose();
  };

  const formatCardNumber = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 16);
    setCardNumber(clean.match(/.{1,4}/g)?.join(' ') || clean);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <View style={modalAddStyles.overlay}>
        <SafeAreaView style={modalAddStyles.sheet} edges={['bottom']}>

          {processing && (
            <View style={modalAddStyles.processingBar}>
              <View style={modalAddStyles.processingFill} />
            </View>
          )}

          {!processing && (
            <>
              <View style={modalAddStyles.tabRow}>
                {['tarjeta', 'cuenta', 'cheque'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[modalAddStyles.tab, tab === t && modalAddStyles.tabActive]}
                    onPress={() => { setTab(t); setErrors({}); }}
                  >
                    <Text style={[modalAddStyles.tabText, tab === t && modalAddStyles.tabTextActive]}>
                      {t === 'tarjeta' ? 'Tarjeta' : t === 'cuenta' ? 'Cuenta bancaria' : 'Cheque'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: SIZES.lg }}>

                {tab === 'tarjeta' && (
                  <>
                    <View style={modalAddStyles.cardPreview}>
                      <View style={modalAddStyles.cardChip} />
                      <Text style={modalAddStyles.cardBrand}>AZURE</Text>
                      <Text style={modalAddStyles.cardNumber}>
                        {cardNumber || '• • • •   • • • •   • • • •   • • • •'}
                      </Text>
                      <View style={modalAddStyles.cardFooter}>
                        <View>
                          <Text style={modalAddStyles.cardFieldLabel}>TITULAR DE LA TARJETA</Text>
                          <Text style={modalAddStyles.cardFieldValue}>
                            {cardName.toUpperCase() || 'NOMBRE COMPLETO'}
                          </Text>
                        </View>
                        <View>
                          <Text style={modalAddStyles.cardFieldLabel}>VENCE</Text>
                          <Text style={modalAddStyles.cardFieldValue}>{cardExpiry || 'MM/AA'}</Text>
                        </View>
                      </View>
                    </View>

                    <View style={{ padding: SIZES.lg }}>
                      <Text style={modalAddStyles.fieldLabel}>NOMBRE EN LA TARJETA</Text>
                      <TextInput
                        style={[modalAddStyles.fieldInput, errors.cardName && modalAddStyles.fieldInputError]}
                        placeholder="Ej. Julian Casablancas"
                        placeholderTextColor={COLORS.textMuted}
                        value={cardName}
                        onChangeText={setCardName}
                        autoCapitalize="words"
                      />
                      {errors.cardName && <Text style={modalAddStyles.fieldError}>{errors.cardName}</Text>}

                      <Text style={modalAddStyles.fieldLabel}>NÚMERO DE TARJETA</Text>
                      <TextInput
                        style={[modalAddStyles.fieldInput, errors.cardNumber && modalAddStyles.fieldInputError]}
                        placeholder="0000 0000 0000 0000"
                        placeholderTextColor={COLORS.textMuted}
                        value={cardNumber}
                        onChangeText={formatCardNumber}
                        keyboardType="numeric"
                      />
                      {errors.cardNumber && <Text style={modalAddStyles.fieldError}>{errors.cardNumber}</Text>}

                      <View style={modalAddStyles.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={modalAddStyles.fieldLabel}>FECHA (MM/AA)</Text>
                          <TextInput
                            style={[modalAddStyles.fieldInput, errors.cardExpiry && modalAddStyles.fieldInputError]}
                            placeholder="MM/AA"
                            placeholderTextColor={COLORS.textMuted}
                            value={cardExpiry}
                            onChangeText={handleExpiryChange}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                          {errors.cardExpiry && <Text style={modalAddStyles.fieldError}>{errors.cardExpiry}</Text>}
                          {expiryWarning && !errors.cardExpiry && (
                            <View style={modalAddStyles.warningBanner}>
                              <Text style={modalAddStyles.warningText}>⚠ {expiryWarning}</Text>
                            </View>
                          )}
                        </View>
                        <View style={{ width: SIZES.md }} />
                        <View style={{ flex: 1 }}>
                          <Text style={modalAddStyles.fieldLabel}>CVV</Text>
                          <TextInput
                            style={[modalAddStyles.fieldInput, errors.cardCvv && modalAddStyles.fieldInputError]}
                            placeholder="• • •"
                            placeholderTextColor={COLORS.textMuted}
                            value={cardCvv}
                            onChangeText={setCardCvv}
                            keyboardType="numeric"
                            secureTextEntry
                            maxLength={4}
                          />
                          {errors.cardCvv && <Text style={modalAddStyles.fieldError}>{errors.cardCvv}</Text>}
                        </View>
                      </View>
                    </View>
                  </>
                )}

                {tab === 'cuenta' && (
                  <View style={{ padding: SIZES.lg }}>
                    <Text style={modalAddStyles.fieldLabel}>NOMBRE DEL BANCO</Text>
                    <TextInput
                      style={[modalAddStyles.fieldInput, errors.bankName && modalAddStyles.fieldInputError]}
                      placeholder="Ej. Commonwealth Bank"
                      placeholderTextColor={COLORS.textMuted}
                      value={bankName}
                      onChangeText={setBankName}
                    />
                    {errors.bankName && <Text style={modalAddStyles.fieldError}>{errors.bankName}</Text>}

                    <Text style={modalAddStyles.fieldLabel}>NÚMERO DE CUENTA</Text>
                    <TextInput
                      style={[modalAddStyles.fieldInput, errors.accountNumber && modalAddStyles.fieldInputError]}
                      placeholder="Ej. 0000 0000 0000"
                      placeholderTextColor={COLORS.textMuted}
                      value={accountNumber}
                      onChangeText={setAccountNumber}
                      keyboardType="numeric"
                    />
                    {errors.accountNumber && <Text style={modalAddStyles.fieldError}>{errors.accountNumber}</Text>}

                    <Text style={modalAddStyles.fieldLabel}>CÓDIGO DE BANCO (CBU / BSB / IBAN)</Text>
                    <TextInput
                      style={[modalAddStyles.fieldInput, errors.bankCode && modalAddStyles.fieldInputError]}
                      placeholder="Ej. BSB 00 0001"
                      placeholderTextColor={COLORS.textMuted}
                      value={bankCode}
                      onChangeText={setBankCode}
                    />
                    {errors.bankCode && <Text style={modalAddStyles.fieldError}>{errors.bankCode}</Text>}
                  </View>
                )}

                {tab === 'cheque' && (
                  <View style={{ padding: SIZES.lg }}>
                    <Text style={modalAddStyles.infoText}>
                      El cheque certificado debe ser entregado físicamente antes del inicio de la subasta.
                      Sus compras no podrán superar el monto declarado.
                    </Text>
                    <Text style={modalAddStyles.fieldLabel}>MONTO DEL CHEQUE</Text>
                    <TextInput
                      style={[modalAddStyles.fieldInput, errors.checkAmount && modalAddStyles.fieldInputError]}
                      placeholder="$ 0.00"
                      placeholderTextColor={COLORS.textMuted}
                      value={checkAmount}
                      onChangeText={setCheckAmount}
                      keyboardType="numeric"
                    />
                    {errors.checkAmount && <Text style={modalAddStyles.fieldError}>{errors.checkAmount}</Text>}
                  </View>
                )}

                {error && (
                  <View style={modalAddStyles.errorBanner}>
                    <Text style={modalAddStyles.errorBannerText}>⚠ {error}</Text>
                  </View>
                )}

                <View style={{ paddingHorizontal: SIZES.lg, paddingBottom: SIZES.xxl }}>
                  <PrimaryButton title="Agregar método de pago" onPress={handleAdd} loading={loading} />
                  <TouchableOpacity onPress={reset} style={modalAddStyles.cancelBtn}>
                    <Text style={modalAddStyles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerIcon: { fontSize: 22 },
});

const paymentStyles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.lg },
  backIcon: { color: COLORS.textPrimary, fontSize: 24 },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.primary },
  successBanner: { backgroundColor: 'rgba(0,230,118,0.15)', marginHorizontal: SIZES.lg, borderRadius: SIZES.radiusMd, padding: SIZES.md, borderLeftWidth: 3, borderLeftColor: COLORS.secondary, marginBottom: SIZES.sm },
  successText: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm, letterSpacing: 1 },
  methodCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  methodCardSelected: { borderColor: COLORS.primary },
  methodLogo: { fontSize: 32, marginRight: SIZES.md },
  methodDisplay: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.accent2, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  addBtn: { borderWidth: 1, borderColor: COLORS.primary, borderRadius: SIZES.radiusMd, padding: SIZES.md, alignItems: 'center', marginTop: SIZES.sm },
  addBtnText: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm, letterSpacing: 1 },
});

const modalAddStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay },
  sheet: { flex: 1, backgroundColor: COLORS.background, marginTop: 60 },
  processingBar: { height: 6, backgroundColor: COLORS.card, margin: SIZES.lg, borderRadius: 3 },
  processingFill: { height: '100%', width: '30%', backgroundColor: COLORS.secondary, borderRadius: 3 },
  tabRow: { flexDirection: 'row', backgroundColor: COLORS.card, margin: SIZES.lg, borderRadius: SIZES.radiusMd, padding: 4 },
  tab: { flex: 1, paddingVertical: SIZES.sm, alignItems: 'center', borderRadius: SIZES.radiusSm },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm },
  tabTextActive: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold },
  cardPreview: { margin: SIZES.lg, backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusLg, padding: SIZES.lg, minHeight: 180 },
  cardChip: { width: 40, height: 30, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginBottom: SIZES.lg },
  cardBrand: { color: COLORS.background, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textLg, position: 'absolute', top: SIZES.lg, right: SIZES.lg },
  cardNumber: { color: COLORS.background, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd, letterSpacing: 2, marginBottom: SIZES.lg },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardFieldLabel: { color: 'rgba(0,0,0,0.5)', fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  cardFieldValue: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd },
  fieldLabel: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1.5, marginBottom: 6, marginTop: SIZES.md },
  fieldInput: { backgroundColor: COLORS.input, borderRadius: SIZES.radiusMd, padding: SIZES.md, color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, borderWidth: 1, borderColor: 'transparent' },
  fieldInputError: { borderColor: COLORS.error },
  fieldError: { color: COLORS.error, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: 4 },
  row: { flexDirection: 'row' },
  infoText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, lineHeight: 22, marginBottom: SIZES.lg, backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md },
  errorBanner: { backgroundColor: 'rgba(255,82,82,0.12)', marginHorizontal: SIZES.lg, borderRadius: SIZES.radiusMd, padding: SIZES.md, borderLeftWidth: 3, borderLeftColor: COLORS.error, marginBottom: SIZES.md },
  errorBannerText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm },
  warningBanner: { backgroundColor: 'rgba(255,180,0,0.12)', borderRadius: SIZES.radiusSm, padding: SIZES.sm, marginTop: 4, borderLeftWidth: 3, borderLeftColor: '#FFB400' },
  warningText: { color: '#FFB400', fontFamily: FONTS.bodyMedium, fontSize: SIZES.textXs, lineHeight: 16 },
  cancelBtn: { alignItems: 'center', paddingVertical: SIZES.md, marginTop: SIZES.sm },
  cancelText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
});
