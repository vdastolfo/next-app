import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, RefreshControl, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { activityAPI, paymentAPI } from '../services/api';
import { PrimaryButton, NextLogo, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

// ══════════════════════════════════════════════════════════════════════════════
// ACTIVIDAD (frames 11 y 12)
// ══════════════════════════════════════════════════════════════════════════════
export function ActivityScreen({ navigation }) {
  const [tab, setTab] = useState('bidding'); // 'bidding' | 'won'
  const [bidding, setBidding] = useState([]);
  const [won, setWon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadActivity();
    // Mostrar toast si viene de una puja exitosa
    if (navigation.getState?.()?.routes?.slice(-1)[0]?.params?.bidSuccess) {
      showToast('¡Sos el mejor postor!', 'Felicidades, ya estás participando en la subasta.');
    }
  }, []);

  const loadActivity = async () => {
    try {
      const [biddingRes, wonRes] = await Promise.all([
        activityAPI.getBidding(),
        activityAPI.getWon(),
      ]);
      setBidding(biddingRes.data || []);
      setWon(wonRes.data || []);
    } catch {
      // Mock para desarrollo
      setBidding([
        { pujaId: 1, itemId: 1, nombreProducto: 'Sillón Luis XV', tuPuja: 6690, mejorPuja: 6690, eresElMejor: true, loteNumero: 'LOTE #1442', estadoSubasta: 'abierta', segundosRestantes: 12 },
        { pujaId: 2, itemId: 2, nombreProducto: 'The Chronos Heirloom', tuPuja: 45000, mejorPuja: 45000, eresElMejor: true, loteNumero: 'LOTE #1002', estadoSubasta: 'abierta', segundosRestantes: 2666 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showToast = (title, msg) => {
    setToast({ title, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '--:--:--';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) return <LoadingScreen />;

  const data = tab === 'bidding' ? bidding : won;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <NextLogo size={36} showText={true} />
        <TouchableOpacity><Text style={styles.headerIcon}>🔔</Text></TouchableOpacity>
      </View>

      <View style={styles.pageTitleRow}>
        <Text style={styles.pageTitle}>Actividad</Text>
        <TouchableOpacity><Text style={styles.filterIcon}>⚙</Text></TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'bidding' && styles.tabActive]}
          onPress={() => setTab('bidding')}
        >
          <Text style={[styles.tabText, tab === 'bidding' && styles.tabTextActive]}>
            Pujando
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'won' && styles.tabActive]}
          onPress={() => setTab('won')}
        >
          <Text style={[styles.tabText, tab === 'won' && styles.tabTextActive]}>
            Ganadas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.pujaId || item.itemId)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadActivity(); }} tintColor={COLORS.secondary} />
        }
        contentContainerStyle={{ padding: SIZES.lg, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={activityStyles.card}
            onPress={() => navigation.navigate('ProductDetail', { itemId: item.itemId })}
          >
            {/* Imagen placeholder */}
            <View style={activityStyles.cardImage}>
              <Text style={activityStyles.cardImageEmoji}>📦</Text>
              {/* Timer badge */}
              {tab === 'bidding' && (
                <View style={activityStyles.timerBadge}>
                  <Text style={activityStyles.timerText}>
                    ⏱ {formatTime(item.segundosRestantes)}
                  </Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={activityStyles.cardInfo}>
              <View style={activityStyles.cardInfoRow}>
                <Text style={activityStyles.liveLabel}>● SUBASTA EN VIVO</Text>
                {item.eresElMejor && (
                  <View style={activityStyles.winningBadge}>
                    <Text style={activityStyles.winningText}>GANANDO</Text>
                  </View>
                )}
              </View>
              <Text style={activityStyles.loteText}>{item.loteNumero}</Text>
              <Text style={activityStyles.productName}>{item.nombreProducto}</Text>
              <View style={activityStyles.cardBottom}>
                <View>
                  <Text style={activityStyles.pujaLabel}>TU PUJA</Text>
                  <Text style={activityStyles.pujaValue}>
                    ${(tab === 'bidding' ? item.tuPuja : item.importePagado)?.toLocaleString()}
                  </Text>
                </View>
                <Text style={activityStyles.arrowIcon}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {tab === 'bidding' ? 'No estás participando en ninguna subasta.' : 'Todavía no ganaste ninguna subasta.'}
            </Text>
          </View>
        }
      />

      {/* Toast */}
      {toast && (
        <View style={activityStyles.toastOverlay}>
          <View style={activityStyles.toastCard}>
            <Text style={activityStyles.toastTitle}>{toast.title}</Text>
            <Text style={activityStyles.toastMsg}>{toast.msg}</Text>
            <TouchableOpacity style={activityStyles.toastBtn} onPress={() => setToast(null)}>
              <Text style={activityStyles.toastBtnText}>SEGUIR SUBASTA</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PERFIL (frame 13)
// ══════════════════════════════════════════════════════════════════════════════
export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const categoryColor = {
    comun: '#75777E', especial: '#40C4FF',
    plata: '#B0BEC5', oro: '#FFD740', platino: '#E040FB',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={styles.header}>
          <NextLogo size={36} showText={true} />
          <TouchableOpacity><Text style={styles.headerIcon}>🔔</Text></TouchableOpacity>
        </View>

        {/* Avatar */}
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

        {/* Stats */}
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

        {/* Menú */}
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

        {/* Logout */}
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

// ══════════════════════════════════════════════════════════════════════════════
// MÉTODOS DE PAGO (frames 14, 15, 17)
// ══════════════════════════════════════════════════════════════════════════════
export function PaymentMethodsScreen({ navigation }) {
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
      // Mock
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
      {/* Header con back */}
      <View style={paymentStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={paymentStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity><Text style={styles.headerIcon}>⬆</Text></TouchableOpacity>
        <View style={paymentStyles.avatarSmall} />
      </View>

      {/* Mensaje de éxito */}
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

      {/* Modal agregar método */}
      <AddPaymentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(msg) => {
          setShowAddModal(false);
          setSuccessMessage(msg);
          loadMethods();
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
    </SafeAreaView>
  );
}

// ── Modal Agregar Método de Pago ──────────────────────────────────────────────
function AddPaymentModal({ visible, onClose, onSuccess }) {
  const [tab, setTab] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Campos tarjeta
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Campos cuenta
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState('');

  // Campos cheque
  const [checkAmount, setCheckAmount] = useState('');

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (tab === 'tarjeta') {
      if (!cardName.trim()) e.cardName = 'El nombre es obligatorio';
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16)
        e.cardNumber = 'Número de tarjeta inválido';
      if (!cardExpiry.trim()) e.cardExpiry = 'La fecha de vencimiento es obligatoria';
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
      setTimeout(() => {
        setProcessing(false);
        onSuccess('NUEVO MÉTODO DE PAGO VERIFICADO');
      }, 1500);
    } catch (err) {
      setProcessing(false);
      if (err.isNetworkError) {
        setError('Sin conexión a internet.');
      } else {
        setError('No se pudo agregar el método de pago.');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCardName(''); setCardNumber(''); setCardExpiry(''); setCardCvv('');
    setBankName(''); setAccountNumber(''); setBankCode('');
    setCheckAmount(''); setErrors({}); setError(null);
    setProcessing(false); onClose();
  };

  // Formato automático del número de tarjeta
  const formatCardNumber = (text) => {
    const clean = text.replace(/\D/g, '').slice(0, 16);
    const formatted = clean.match(/.{1,4}/g)?.join(' ') || clean;
    setCardNumber(formatted);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={reset}>
      <View style={modalAddStyles.overlay}>
        <SafeAreaView style={modalAddStyles.sheet} edges={['bottom']}>

          {/* Barra de procesamiento */}
          {processing && (
            <View style={modalAddStyles.processingBar}>
              <View style={modalAddStyles.processingFill} />
            </View>
          )}

          {!processing && (
            <>
              {/* Tabs tipo tarjeta */}
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

                {/* ── TARJETA ── */}
                {tab === 'tarjeta' && (
                  <>
                    {/* Vista previa de tarjeta */}
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
                            onChangeText={setCardExpiry}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                          {errors.cardExpiry && <Text style={modalAddStyles.fieldError}>{errors.cardExpiry}</Text>}
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

                {/* ── CUENTA BANCARIA ── */}
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

                {/* ── CHEQUE ── */}
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

// ══════════════════════════════════════════════════════════════════════════════
// BUSCADOR (frame 18 + filtros frame 19)
// ══════════════════════════════════════════════════════════════════════════════
export function SearchScreen({ navigation, route }) {
  const [query, setQuery] = useState(route.params?.query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches] = useState(['Rolex Oyster Perpetual', 'Esculturas de mármol']);
  const [suggestions] = useState(['Relojes de lujo', 'Arte contemporáneo', 'Coches clásicos', 'Joyas reales']);
  const [popularItems] = useState([
    { id: 1, nombreProducto: 'PATEK PHILIPPE', mejorPujaActual: 42000, badge: 'EN VIVO' },
    { id: 2, nombreProducto: 'BLUE GENESIS #4', mejorPujaActual: 18500, badge: '2D 14H' },
  ]);

  useEffect(() => {
    if (query) handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { auctionsAPI } = require('../services/api');
      const res = await auctionsAPI.search(query);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const showingResults = query.trim().length > 0 && results.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Barra de búsqueda */}
      <View style={searchStyles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={searchStyles.backBtn}>
          <Text style={searchStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={searchStyles.searchInputContainer}>
          <Text style={searchStyles.searchIcon}>🔍</Text>
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Buscar lotes curados..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={searchStyles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={searchStyles.filterBtn}>
          <Text style={searchStyles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SIZES.lg }}>

        {/* Búsquedas recientes */}
        {!showingResults && (
          <>
            <View style={searchStyles.sectionRow}>
              <Text style={searchStyles.sectionTitle}>BÚSQUEDAS RECIENTES</Text>
              <TouchableOpacity><Text style={searchStyles.clearAllBtn}>BORRAR</Text></TouchableOpacity>
            </View>
            {recentSearches.map((s, i) => (
              <TouchableOpacity key={i} style={searchStyles.recentItem} onPress={() => setQuery(s)}>
                <Text style={searchStyles.recentIcon}>🕐</Text>
                <Text style={searchStyles.recentText}>{s}</Text>
                <Text style={searchStyles.recentArrow}>↗</Text>
              </TouchableOpacity>
            ))}

            <Text style={[searchStyles.sectionTitle, { marginTop: SIZES.lg }]}>SUGERENCIAS</Text>
            <View style={searchStyles.suggestionsGrid}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} style={searchStyles.suggestionChip} onPress={() => setQuery(s)}>
                  <Text style={searchStyles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[searchStyles.sectionTitle, { marginTop: SIZES.lg }]}>RESULTADOS POPULARES</Text>
            <View style={searchStyles.popularGrid}>
              {popularItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={searchStyles.popularCard}
                  onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
                >
                  <View style={searchStyles.popularImage}>
                    <Text style={searchStyles.popularEmoji}>📦</Text>
                    <View style={searchStyles.popularBadge}>
                      <Text style={[
                        searchStyles.popularBadgeText,
                        item.badge === 'EN VIVO' && { color: COLORS.secondary }
                      ]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={searchStyles.popularName}>{item.nombreProducto}</Text>
                  <Text style={searchStyles.popularPrice}>${item.mejorPujaActual.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Resultados de búsqueda */}
        {showingResults && results.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={searchStyles.resultCard}
            onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
          >
            <View style={searchStyles.resultImage}>
              <Text style={{ fontSize: 30 }}>📦</Text>
            </View>
            <View style={searchStyles.resultInfo}>
              <Text style={searchStyles.resultName}>{item.nombreProducto}</Text>
              <Text style={searchStyles.resultPrice}>
                ${item.mejorPujaActual?.toLocaleString() || item.precioBase?.toLocaleString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal de Filtros */}
      <FiltersModal visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
  );
}

// ── Modal de Filtros ──────────────────────────────────────────────────────────
function FiltersModal({ visible, onClose }) {
  const [sort, setSort] = useState('relevancia');
  const sortOptions = [
    { key: 'relevancia', label: 'Relevancia' },
    { key: 'reciente', label: 'Más reciente' },
    { key: 'mayor_precio', label: 'Mayor precio' },
    { key: 'menor_precio', label: 'Menor precio' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={filterStyles.overlay}>
        <View style={filterStyles.sheet}>
          <View style={filterStyles.header}>
            <Text style={filterStyles.title}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={filterStyles.resetText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
          <View style={filterStyles.divider} />

          <Text style={filterStyles.sectionTitle}>Ordenar por</Text>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={filterStyles.optionRow}
              onPress={() => setSort(opt.key)}
            >
              <Text style={filterStyles.optionLabel}>{opt.label}</Text>
              <View style={[filterStyles.radio, sort === opt.key && filterStyles.radioActive]}>
                {sort === opt.key && <View style={filterStyles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          <View style={filterStyles.divider} />
          <TouchableOpacity style={filterStyles.categoriesRow}>
            <Text style={filterStyles.sectionTitle}>Categorías</Text>
            <Text style={filterStyles.chevron}>∨</Text>
          </TouchableOpacity>
          <Text style={filterStyles.allCategoriesText}>Todas las categorías</Text>

          <PrimaryButton
            title="Mostrar resultados"
            onPress={onClose}
            style={filterStyles.applyBtn}
          />
          <View style={filterStyles.handle} />
        </View>
      </View>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ESTILOS COMPARTIDOS
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: SIZES.lg, paddingVertical: SIZES.md,
  },
  headerIcon: { fontSize: 22 },
  pageTitleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: SIZES.lg, marginBottom: SIZES.md,
  },
  pageTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero },
  filterIcon: { fontSize: 22 },
  tabRow: {
    flexDirection: 'row', marginHorizontal: SIZES.lg,
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd,
    padding: 4, marginBottom: SIZES.md,
  },
  tab: { flex: 1, paddingVertical: SIZES.sm, alignItems: 'center', borderRadius: SIZES.radiusSm },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
  tabTextActive: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold },
  emptyState: { alignItems: 'center', paddingVertical: SIZES.xxl },
  emptyText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center' },
});

const activityStyles = StyleSheet.create({
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, overflow: 'hidden', marginBottom: SIZES.md },
  cardImage: { height: 180, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  cardImageEmoji: { fontSize: 60 },
  timerBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: SIZES.radiusFull, paddingHorizontal: 10, paddingVertical: 4 },
  timerText: { color: COLORS.error, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textSm },
  cardInfo: { padding: SIZES.md },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.xs },
  liveLabel: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  winningBadge: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.secondary, borderRadius: SIZES.radiusFull, paddingHorizontal: 10, paddingVertical: 2 },
  winningText: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs },
  loteText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginBottom: 2 },
  productName: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.sm },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  pujaLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  pujaValue: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXxl },
  arrowIcon: { color: COLORS.textMuted, fontSize: 28 },
  toastOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: SIZES.lg },
  toastCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: SIZES.lg },
  toastTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.sm },
  toastMsg: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, lineHeight: 22, marginBottom: SIZES.lg },
  toastBtn: { backgroundColor: COLORS.secondary, borderRadius: SIZES.radiusFull, paddingVertical: SIZES.md, alignItems: 'center' },
  toastBtnText: { color: COLORS.background, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, letterSpacing: 1 },
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
  cancelBtn: { alignItems: 'center', paddingVertical: SIZES.md, marginTop: SIZES.sm },
  cancelText: { color: COLORS.textMuted, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd },
});

const searchStyles = StyleSheet.create({
  searchHeader: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  backBtn: { padding: SIZES.xs },
  backIcon: { color: COLORS.textPrimary, fontSize: 24 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.input, borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  searchIcon: { fontSize: 16, marginRight: SIZES.sm },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  clearBtn: { color: COLORS.textMuted, fontSize: 16, padding: SIZES.xs },
  filterBtn: { padding: SIZES.sm },
  filterIcon: { fontSize: 22 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  sectionTitle: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 2 },
  clearAllBtn: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, gap: SIZES.md },
  recentIcon: { fontSize: 18 },
  recentText: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textLg },
  recentArrow: { color: COLORS.textMuted, fontSize: 20 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.md },
  suggestionChip: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  suggestionText: { color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  popularGrid: { flexDirection: 'row', gap: SIZES.md },
  popularCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, overflow: 'hidden' },
  popularImage: { height: 120, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  popularEmoji: { fontSize: 40 },
  popularBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: SIZES.radiusFull, paddingHorizontal: 8, paddingVertical: 2 },
  popularBadgeText: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs },
  popularName: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, padding: SIZES.sm, paddingBottom: 0 },
  popularPrice: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, padding: SIZES.sm, paddingTop: 2 },
  resultCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, marginBottom: SIZES.sm, overflow: 'hidden' },
  resultImage: { width: 80, height: 80, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, padding: SIZES.md, justifyContent: 'center' },
  resultName: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, marginBottom: 4 },
  resultPrice: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg },
});

const filterStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.background, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.lg, paddingBottom: SIZES.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  title: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl },
  resetText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  divider: { height: 1, backgroundColor: COLORS.card, marginVertical: SIZES.md },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, marginBottom: SIZES.sm },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.sm },
  optionLabel: { color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textLg },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.accent2, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.textPrimary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.textPrimary },
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chevron: { color: COLORS.textMuted, fontSize: 20 },
  allCategoriesText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, marginBottom: SIZES.lg },
  applyBtn: { marginTop: SIZES.md },
  handle: { width: 40, height: 4, backgroundColor: COLORS.accent2, borderRadius: 2, alignSelf: 'center', marginTop: SIZES.lg },
});
