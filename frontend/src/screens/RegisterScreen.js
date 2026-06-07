import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Input, PrimaryButton, NextLogo } from '../components';
import { authAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function RegisterScreen({ navigation }) {

  const [form, setForm] = useState({
    nombre: '',
    documento: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Helpers ───────────────────────────────────────────────────────────────
  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  // ── Validaciones ──────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};

    if (!form.nombre.trim())
      e.nombre = 'El nombre es obligatorio';

    if (!form.documento.trim())
      e.documento = 'El documento es obligatorio';

    if (!form.email.trim())
      e.email = 'El correo electrónico es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'El formato del correo no es válido';

    if (!form.password)
      e.password = 'La contraseña es obligatoria';
    else if (form.password.length < 6)
      e.password = 'La contraseña debe tener al menos 6 caracteres';

    if (!form.confirmPassword)
      e.confirmPassword = 'Confirmá tu contraseña';
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await authAPI.register({
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      navigation.navigate('Verify', { email: form.email.trim().toLowerCase() });
    } catch (error) {
      if (error.isNetworkError) {
        setErrors({ general: 'Sin conexión a internet. Verificá tu red.' });
      } else if (error.response?.status === 409) {
        setErrors({ email: 'Ya existe una cuenta con ese correo.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Datos inválidos. Revisá el formulario.' });
      } else {
        setErrors({ general: 'Ocurrió un error. Intentá de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <NextLogo size={70} showText={true} />
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Completá tus datos para registrarte</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <Input
            label="NOMBRE COMPLETO"
            placeholder="Juan Pérez"
            value={form.nombre}
            onChangeText={(t) => setField('nombre', t)}
            error={errors.nombre}
            rightIcon={<Text style={styles.iconText}>👤</Text>}
          />

          <Input
            label="DOCUMENTO (DNI / PASAPORTE)"
            placeholder="12345678"
            value={form.documento}
            onChangeText={(t) => setField('documento', t)}
            keyboardType="default"
            error={errors.documento}
            rightIcon={<Text style={styles.iconText}>🪪</Text>}
          />

          <Input
            label="CORREO ELECTRÓNICO"
            placeholder="usuario@ejemplo.com"
            value={form.email}
            onChangeText={(t) => setField('email', t)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            rightIcon={<Text style={styles.iconText}>@</Text>}
          />

          <Input
            label="CONTRASEÑA"
            placeholder="Mínimo 6 caracteres"
            value={form.password}
            onChangeText={(t) => setField('password', t)}
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={<Text style={styles.iconText}>{showPassword ? '👁' : '🔒'}</Text>}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Input
            label="CONFIRMAR CONTRASEÑA"
            placeholder="Repetí tu contraseña"
            value={form.confirmPassword}
            onChangeText={(t) => setField('confirmPassword', t)}
            secureTextEntry={!showConfirm}
            error={errors.confirmPassword}
            rightIcon={<Text style={styles.iconText}>{showConfirm ? '👁' : '🔒'}</Text>}
            onRightIconPress={() => setShowConfirm(!showConfirm)}
          />

          {/* Error general */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {errors.general}</Text>
            </View>
          )}

          <PrimaryButton
            title="Crear cuenta"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿Ya tenés cuenta?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.goBack()}>
              Iniciar sesión
            </Text>
          </Text>
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
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: SIZES.md,
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
    marginTop: SIZES.xs,
  },
  form: {
    flex: 1,
  },
  iconText: {
    color: COLORS.textMuted,
    fontSize: 18,
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
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textSm,
  },
  footerLink: {
    color: COLORS.secondary,
    fontFamily: FONTS.bodySemiBold,
  },
});