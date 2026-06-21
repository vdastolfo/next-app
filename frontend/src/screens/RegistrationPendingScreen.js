import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NextLogo } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function RegistrationPendingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <NextLogo size={80} showText={true} />

      <View style={styles.iconContainer}>
        <Text style={styles.icon}>✉️</Text>
      </View>

      <Text style={styles.title}>Solicitud enviada</Text>

      <Text style={styles.body}>
        Recibimos tus datos. Nuestro equipo los verificará y, si todo es correcto, te enviaremos un correo para que puedas completar tu registro y crear tu contraseña.
      </Text>

      <Text style={styles.note}>
        Este proceso puede demorar algunos días hábiles.
      </Text>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.backText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.xl,
  },
  iconContainer: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.md,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: SIZES.textXl,
    marginBottom: SIZES.md,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  body: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.lg,
  },
  note: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  backBtn: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: SIZES.radiusFull,
  },
  backText: {
    color: COLORS.secondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
    letterSpacing: 0.5,
  },
});
