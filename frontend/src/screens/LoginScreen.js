import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../services/AuthContext';
import { Input, PrimaryButton, NextLogo } from '../components';
import { paymentAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

      // Si no tiene medios de pago, lo mandamos a registrar el primero
      try {
        const res = await paymentAPI.list();
        if (!res.data || res.data.length === 0) {
          navigation.reset({ index: 0, routes: [{ name: 'FirstPayment' }] });
          return;
        }
      } catch {
        // Si falla la consulta, dejamos pasar a Main igual
      }

      navigation.navigate('Main');
    } catch (error) {
      if (error.isNetworkError) {
        setErrors({ general: 'Sin conexión a internet. Verificá tu red.' });
      } else if (error.response?.status === 401) {
        setErrors({ general: 'Email o contraseña incorrectos.' });
      } else if (error.response?.status === 403) {
        setErrors({ general: error.response?.data?.error || 'Tu cuenta no está activa aún.' });
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
        <View style={styles.logoContainer}>
          <NextLogo size={100} showText={true} />
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

          <TouchableOpacity
            style={styles.forgotContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>¿OLVIDASTE TU CONTRASEÑA?</Text>
          </TouchableOpacity>

          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {errors.general}</Text>
            </View>
          )}

          <PrimaryButton
            title="Iniciar Sesión"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginBtn}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBg} />
          <Text style={styles.footerText}>
            ¿No tenés cuenta?{' '}
            <Text style={styles.footerLink} onPress={() => navigation.navigate('Register')}>
              Solicitar registro
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.completeRegLink}
            onPress={() => navigation.navigate('CompleteRegistration')}
          >
            <Text style={styles.completeRegText}>
              ¿Ya recibiste el mail de aprobación?{' '}
              <Text style={styles.completeRegLinkText}>Completar registro</Text>
            </Text>
          </TouchableOpacity>
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
  footer: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    marginTop: SIZES.lg,
    gap: SIZES.md,
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
  completeRegLink: {
    padding: SIZES.xs,
  },
  completeRegText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    textAlign: 'center',
  },
  completeRegLinkText: {
    color: COLORS.accent1,
    fontFamily: FONTS.bodySemiBold,
  },
});
