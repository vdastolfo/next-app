import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { Input, PrimaryButton, NextLogo } from '../components';
import { authAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function CompleteRegistrationScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const codeInputs = useRef([]);

  const handleCodeChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);
    if (errors.code) setErrors((e) => ({ ...e, code: null }));

    if (digit && index < 5) {
      codeInputs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      codeInputs.current[index - 1]?.focus();
    }
  };

  const validate = () => {
    const e = {};

    if (!email.trim())
      e.email = 'El correo electrónico es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'El formato del correo no es válido';

    if (code.join('').length < 6)
      e.code = 'Ingresá los 6 dígitos del código que recibiste por mail';

    if (!password)
      e.password = 'La contraseña es obligatoria';
    else if (password.length < 6)
      e.password = 'La contraseña debe tener al menos 6 caracteres';

    if (!confirmPassword)
      e.confirmPassword = 'Confirmá tu contraseña';
    else if (password !== confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleComplete = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await authAPI.completeRegistration({
        email: email.trim().toLowerCase(),
        codigo: code.join(''),
        password,
      });

      const { token, ...userData } = response.data;
      await login(email.trim().toLowerCase(), null, { token, ...userData });
      navigation.reset({ index: 0, routes: [{ name: 'FirstPayment' }] });
    } catch (error) {
      if (error.isNetworkError) {
        setErrors({ general: 'Sin conexión a internet. Verificá tu red.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: error.response?.data?.error || 'Código incorrecto o expirado.' });
      } else {
        setErrors({ general: 'Ocurrió un error. Intentá de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <NextLogo size={70} showText={true} />
          <Text style={styles.title}>Completar registro</Text>
          <Text style={styles.subtitle}>
            Ingresá el código que recibiste por correo y creá tu contraseña personal.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="CORREO ELECTRÓNICO"
            placeholder="usuario@ejemplo.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (errors.email) setErrors((e) => ({ ...e, email: null }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            rightIcon={<Text style={styles.iconText}>@</Text>}
          />

          {/* Código de 6 dígitos */}
          <Text style={styles.codeLabel}>CÓDIGO DE VERIFICACIÓN</Text>
          <View style={styles.codeContainer}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={(ref) => (codeInputs.current[i] = ref)}
                style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
                value={digit}
                onChangeText={(t) => handleCodeChange(t, i)}
                onKeyPress={(e) => handleCodeKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>
          {errors.code && <Text style={styles.codeError}>{errors.code}</Text>}

          <Input
            label="CONTRASEÑA"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: null }));
            }}
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={<Text style={styles.iconText}>{showPassword ? '👁' : '🔒'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="CONFIRMAR CONTRASEÑA"
            placeholder="Repetí tu contraseña"
            value={confirmPassword}
            onChangeText={(t) => {
              setConfirmPassword(t);
              if (errors.confirmPassword) setErrors((e) => ({ ...e, confirmPassword: null }));
            }}
            secureTextEntry={!showConfirm}
            error={errors.confirmPassword}
            rightIcon={<Text style={styles.iconText}>{showConfirm ? '👁' : '🔒'}</Text>}
            onRightIconPress={() => setShowConfirm(!showConfirm)}
          />

          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {errors.general}</Text>
            </View>
          )}

          <PrimaryButton
            title="Activar cuenta"
            onPress={handleComplete}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xl,
  },
  backBtn: {
    marginBottom: SIZES.md,
  },
  backText: {
    color: COLORS.accent1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
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
    marginTop: SIZES.xs,
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  iconText: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  codeLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1.5,
    marginBottom: SIZES.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  codeInput: {
    flex: 1,
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
  codeError: {
    color: COLORS.error,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    marginBottom: SIZES.md,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,82,82,0.15)',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorBannerText: {
    color: COLORS.error,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm,
  },
  submitBtn: {
    marginTop: SIZES.sm,
  },
});
