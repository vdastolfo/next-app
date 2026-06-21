import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, Alert,
} from 'react-native';
import { authAPI } from '../services/api';
import { PrimaryButton, NextLogo } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const STEPS = ['email', 'codigo', 'password'];

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const codigoRef = useRef(null);

  const clearError = () => setError('');

  // Paso 1: solicitar código
  const handleSolicitarCodigo = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingresá un correo electrónico válido.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setStep(1);
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo enviar el código. Verificá el correo ingresado.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: verificar código contra el backend antes de avanzar
  const handleVerificarCodigo = async () => {
    if (codigo.length !== 6) {
      setError('El código tiene 6 dígitos.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await authAPI.verifyResetCode(email.trim().toLowerCase(), codigo);
      setStep(2);
    } catch (e) {
      const msg = e.response?.data?.error || 'Código incorrecto. Revisá y volvé a intentarlo.';
      setError(msg);
      if (msg.toLowerCase().includes('expiró')) {
        setCodigo('');
      }
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: restablecer contraseña
  const handleRestablecerPassword = async () => {
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    clearError();
    try {
      await authAPI.resetPassword(email.trim().toLowerCase(), codigo, password);
      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña fue restablecida exitosamente. Ya podés iniciar sesión.',
        [{ text: 'Iniciar sesión', onPress: () => navigation.replace('Login') }]
      );
    } catch (e) {
      const msg = e.response?.data?.error || '';
      if (msg.toLowerCase().includes('código') || msg.toLowerCase().includes('expiró')) {
        setError(msg + ' Volvé al paso anterior para solicitar uno nuevo.');
        setStep(1);
      } else {
        setError(msg || 'Ocurrió un error. Intentá de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoading(true);
    clearError();
    try {
      await authAPI.forgotPassword(email.trim().toLowerCase());
      setCodigo('');
      Alert.alert('Código reenviado', 'Revisá tu correo, te enviamos un nuevo código.');
    } catch {
      setError('No se pudo reenviar el código.');
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
        <View style={styles.logoContainer}>
          <NextLogo size={80} showText={true} />
        </View>

        {/* Indicador de pasos */}
        <View style={styles.stepsRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                i === step && styles.stepDotActive,
                i < step && styles.stepDotDone,
              ]}
            />
          ))}
        </View>

        {/* ── Paso 1: email ── */}
        {step === 0 && (
          <View style={styles.form}>
            <Text style={styles.titulo}>Olvidaste tu contraseña</Text>
            <Text style={styles.subtitulo}>
              Ingresá el correo asociado a tu cuenta y te enviaremos un código para restablecerla.
            </Text>

            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              placeholder="usuario@ejemplo.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={(t) => { setEmail(t); clearError(); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}

            <PrimaryButton
              title="Enviar código"
              onPress={handleSolicitarCodigo}
              loading={loading}
              style={styles.btn}
            />
          </View>
        )}

        {/* ── Paso 2: código ── */}
        {step === 1 && (
          <View style={styles.form}>
            <Text style={styles.titulo}>Revisá tu correo</Text>
            <Text style={styles.subtitulo}>
              Enviamos un código de 6 dígitos a{' '}
              <Text style={styles.emailDestacado}>{email}</Text>
            </Text>

            <Text style={styles.label}>CÓDIGO DE VERIFICACIÓN</Text>
            <TextInput
              ref={codigoRef}
              style={[styles.input, styles.inputCodigo]}
              placeholder="000000"
              placeholderTextColor={COLORS.textMuted}
              value={codigo}
              onChangeText={(t) => { setCodigo(t.replace(/\D/g, '').slice(0, 6)); clearError(); }}
              keyboardType="number-pad"
              maxLength={6}
            />

            {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}

            <PrimaryButton
              title="Continuar"
              onPress={handleVerificarCodigo}
              loading={loading}
              style={styles.btn}
            />

            <TouchableOpacity style={styles.reenviarBtn} onPress={handleReenviar} disabled={loading}>
              <Text style={styles.reenviarText}>¿No recibiste el código? Reenviar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.volverBtn} onPress={() => { setStep(0); clearError(); }}>
              <Text style={styles.volverText}>← Cambiar correo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Paso 3: nueva contraseña ── */}
        {step === 2 && (
          <View style={styles.form}>
            <Text style={styles.titulo}>Nueva contraseña</Text>
            <Text style={styles.subtitulo}>
              Elegí una contraseña segura de al menos 6 caracteres.
            </Text>

            <Text style={styles.label}>NUEVA CONTRASEÑA</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.inputFlex]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={(t) => { setPassword(t); clearError(); }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '👁' : '🔒'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>REPETIR CONTRASEÑA</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearError(); }}
              secureTextEntry={!showPassword}
            />

            {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}

            <PrimaryButton
              title="Restablecer contraseña"
              onPress={handleRestablecerPassword}
              loading={loading}
              style={styles.btn}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.cancelarBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelarText}>Cancelar y volver al inicio de sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.lg, paddingTop: SIZES.xxl, paddingBottom: SIZES.xxl },
  logoContainer: { alignItems: 'center', marginBottom: SIZES.lg },

  stepsRow: { flexDirection: 'row', justifyContent: 'center', gap: SIZES.sm, marginBottom: SIZES.xl },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.cardAlt,
  },
  stepDotActive: { backgroundColor: COLORS.secondary, width: 24, borderRadius: 4 },
  stepDotDone: { backgroundColor: COLORS.success },

  form: { flex: 1 },
  titulo: {
    color: COLORS.textPrimary, fontFamily: FONTS.titleBold,
    fontSize: SIZES.textXl, marginBottom: SIZES.sm,
  },
  subtitulo: {
    color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd, lineHeight: 22, marginBottom: SIZES.xl,
  },
  emailDestacado: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold },

  label: {
    color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs, letterSpacing: 1.2, marginBottom: SIZES.xs,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    marginBottom: SIZES.lg,
    borderWidth: 1,
    borderColor: COLORS.cardAlt,
  },
  inputCodigo: {
    textAlign: 'center', letterSpacing: 8,
    fontSize: SIZES.textXl, fontFamily: FONTS.titleBold,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.lg },
  inputFlex: { flex: 1, marginBottom: 0 },
  eyeBtn: { paddingHorizontal: SIZES.sm, paddingVertical: SIZES.md },
  eyeIcon: { fontSize: 18, color: COLORS.textMuted },

  errorText: {
    color: COLORS.error, fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm, marginBottom: SIZES.md,
    backgroundColor: 'rgba(255,82,82,0.1)',
    borderRadius: SIZES.radiusMd, padding: SIZES.sm,
    borderLeftWidth: 3, borderLeftColor: COLORS.error,
  },

  btn: { marginTop: SIZES.xs },
  reenviarBtn: { alignItems: 'center', marginTop: SIZES.lg },
  reenviarText: { color: COLORS.secondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  volverBtn: { alignItems: 'center', marginTop: SIZES.md },
  volverText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  cancelarBtn: { alignItems: 'center', marginTop: SIZES.xl },
  cancelarText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs },
});
