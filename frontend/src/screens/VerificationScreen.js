import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { PrimaryButton, NextLogo } from '../components';
import { authAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function VerificationScreen({ route, navigation }) {
  const { email } = route.params;
  const { login } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [resendMsg, setResendMsg] = useState(null);

  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    setError(null);

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Ingresá los 6 dígitos del código.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.verify(email, fullCode);
      const { token, ...userData } = response.data;
      await login(email, null, { token, ...userData });
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (err) {
      if (err.response?.status === 400) {
        setError(err.response.data?.error || 'Código incorrecto o expirado.');
      } else {
        setError('Ocurrió un error. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg(null);
    setError(null);
    try {
      await authAPI.resendCode(email);
      setResendMsg('Código reenviado. Revisá tu correo.');
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (err) {
      setError('No se pudo reenviar el código. Intentá de nuevo.');
    } finally {
      setResending(false);
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <NextLogo size={70} showText={true} />

        <Text style={styles.title}>Verificá tu cuenta</Text>
        <Text style={styles.subtitle}>
          Ingresá el código de 6 dígitos que enviamos a{'\n'}
          <Text style={styles.emailText}>{maskedEmail}</Text>
        </Text>

        {/* Inputs del código */}
        <View style={styles.codeContainer}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => (inputs.current[i] = ref)}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {resendMsg && <Text style={styles.successText}>{resendMsg}</Text>}

        <PrimaryButton
          title="Verificar cuenta"
          onPress={handleVerify}
          loading={loading}
          style={styles.submitBtn}
        />

        <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendBtn}>
          <Text style={styles.resendText}>
            {resending ? 'Reenviando...' : '¿No recibiste el código? Reenviar'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: SIZES.lg,
  },
  backText: {
    color: COLORS.accent1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: SIZES.textXl,
    marginTop: SIZES.md,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
    textAlign: 'center',
    marginTop: SIZES.sm,
    marginBottom: SIZES.xl,
    lineHeight: 22,
  },
  emailText: {
    color: COLORS.secondary,
    fontFamily: FONTS.bodySemiBold,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  codeInput: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    borderColor: COLORS.cardAlt,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.card,
    color: COLORS.textPrimary,
    fontFamily: FONTS.headingBold,
    fontSize: SIZES.textXl,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: COLORS.secondary,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  successText: {
    color: COLORS.secondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  submitBtn: {
    width: '100%',
    marginBottom: SIZES.md,
  },
  resendBtn: {
    padding: SIZES.sm,
  },
  resendText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
    textDecorationLine: 'underline',
  },
});
