import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NextLogo, PrimaryButton } from '../components';
import { AddPaymentModal } from './PaymentMethodsScreen';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const TIPO_ICON = { tarjeta: '💳', cuenta: '🏦', cheque: '📄' };
const TIPO_LABEL = { tarjeta: 'Tarjeta de crédito', cuenta: 'Cuenta bancaria', cheque: 'Cheque certificado' };

export default function FirstPaymentScreen({ navigation }) {
  const [methods, setMethods] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = (display, tipo) => {
    setMethods((prev) => [...prev, { display, tipo }]);
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <NextLogo size={60} showText={true} />

        <Text style={styles.title}>Medios de pago</Text>
        <Text style={styles.subtitle}>
          Para participar en subastas necesitás registrar al menos un medio de pago. Podés agregar más desde tu perfil en cualquier momento.
        </Text>

        {/* Lista de métodos ya agregados */}
        {methods.length > 0 && (
          <View style={styles.methodsList}>
            {methods.map((m, i) => (
              <View key={i} style={styles.methodRow}>
                <Text style={styles.methodIcon}>{TIPO_ICON[m.tipo] || '💳'}</Text>
                <View>
                  <Text style={styles.methodType}>{TIPO_LABEL[m.tipo] || m.tipo}</Text>
                  <Text style={styles.methodDisplay}>{m.display}</Text>
                </View>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ AGREGAR MEDIO DE PAGO</Text>
        </TouchableOpacity>

        {methods.length === 0 && (
          <Text style={styles.hint}>Podés agregar tarjetas, cuentas bancarias o cheques certificados.</Text>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          title="Continuar a la app"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Main' }] })}
          disabled={methods.length === 0}
        />
        {methods.length === 0 && (
          <Text style={styles.footerHint}>Agregá al menos un método para continuar</Text>
        )}
      </View>

      <AddPaymentModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={(display, tipo) => handleSuccess(display, tipo)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    alignItems: 'center',
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: SIZES.textXl,
    marginTop: SIZES.lg,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  methodsList: {
    width: '100%',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    gap: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  methodIcon: {
    fontSize: 24,
  },
  methodType: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1,
  },
  methodDisplay: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textMd,
  },
  checkIcon: {
    marginLeft: 'auto',
    color: COLORS.secondary,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addBtn: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  addBtnText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
    letterSpacing: 1,
  },
  hint: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    textAlign: 'center',
    marginTop: SIZES.xs,
  },
  footer: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.lg,
    gap: SIZES.sm,
  },
  footerHint: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    textAlign: 'center',
  },
});
