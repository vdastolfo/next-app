import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../services/AuthContext';
import { Input, PrimaryButton, NextLogo, SecondaryButton } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ── Validaciones ──────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El formato del correo no es válido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await login(email.trim().toLowerCase(), password);
      // La navegación la maneja el Navigator según el estado de auth
    } catch (error) {
      if (error.isNetworkError) {
        setErrors({ general: 'Sin conexión a internet. Verificá tu red.' });
      } else if (error.response?.status === 401) {
        setErrors({ general: 'Email o contraseña incorrectos.' });
      } else if (error.response?.status === 403) {
        setErrors({ general: 'Tu cuenta está desactivada. Contactá al soporte.' });
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <NextLogo size={100} showText={true} />
        </View>

        {/* Formulario */}
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
            error={errors.email}
            rightIcon={<Text style={styles.iconText}>@</Text>}
          />

          <Input
            label="CONTRASEÑA"
            placeholder="••••••••"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (errors.password) setErrors((e) => ({ ...e, password: null }));
            }}
            secureTextEntry={!showPassword}
            error={errors.password}
            rightIcon={
              <Text style={styles.iconText}>{showPassword ? '👁' : '🔒'}</Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          {/* Link ¿Olvidaste tu contraseña? */}
          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>¿OLVIDASTE TU CONTRASEÑA?</Text>
          </TouchableOpacity>

          {/* Error general */}
          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {errors.general}</Text>
            </View>
          )}

          {/* Botón login */}
          <PrimaryButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />

          {/* Divisor */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>O CONTINUAR CON</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social login */}
          <View style={styles.socialRow}>
            <SecondaryButton
              title="Google"
              onPress={() => {}}
              style={styles.socialBtn}
              icon={<Text style={{ fontSize: 18 }}>G</Text>}
            />
            <SecondaryButton
              title="Apple"
              onPress={() => {}}
              style={styles.socialBtn}
              icon={<Text style={{ fontSize: 18 }}>🍎</Text>}
            />
          </View>
        </View>

        {/* Imagen de fondo inferior + crear cuenta */}
        <View style={styles.footer}>
          <View style={styles.footerBg} />
          <Text style={styles.footerText}>
            ¿No tienes una cuenta?{' '}
            <Text style={styles.footerLink}>Crear cuenta</Text>
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
    paddingTop: SIZES.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  form: {
    flex: 1,
  },
  iconText: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.md,
    marginTop: -SIZES.sm,
  },
  forgotText: {
    color: COLORS.accent1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 0.8,
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
  loginBtn: {
    marginTop: SIZES.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardAlt,
  },
  dividerText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1.5,
    marginHorizontal: SIZES.md,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  socialBtn: {
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    marginTop: SIZES.lg,
  },
  footerBg: {
    position: 'absolute',
    bottom: 0, left: -SIZES.lg, right: -SIZES.lg,
    height: 120,
    backgroundColor: 'rgba(0,90,173,0.08)',
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
