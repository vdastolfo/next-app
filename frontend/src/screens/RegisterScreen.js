import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Input, PrimaryButton, NextLogo } from '../components';
import { authAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

export default function RegisterScreen({ navigation }) {

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    documento: '',
    email: '',
    domicilio: '',
    pais: '',
  });
  const [fotoFrente, setFotoFrente] = useState(null);
  const [fotoDorso, setFotoDorso] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
  };

  const pickImage = async (side) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setErrors((e) => ({ ...e, general: 'Se necesita permiso para acceder a la galería.' }));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const base64 = `data:image/jpeg;base64,${asset.base64}`;
      if (side === 'frente') {
        setFotoFrente(base64);
        if (errors.fotoFrente) setErrors((e) => ({ ...e, fotoFrente: null }));
      } else {
        setFotoDorso(base64);
        if (errors.fotoDorso) setErrors((e) => ({ ...e, fotoDorso: null }));
      }
    }
  };

  const validate = () => {
    const e = {};

    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio';
    if (!form.documento.trim()) e.documento = 'El documento es obligatorio';

    if (!form.email.trim())
      e.email = 'El correo electrónico es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'El formato del correo no es válido';

    if (!form.domicilio.trim()) e.domicilio = 'El domicilio legal es obligatorio';
    if (!form.pais.trim()) e.pais = 'El país de origen es obligatorio';
    if (!fotoFrente) e.fotoFrente = 'La foto del frente del documento es obligatoria';
    if (!fotoDorso) e.fotoDorso = 'La foto del dorso del documento es obligatoria';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await authAPI.register({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        documento: form.documento.trim(),
        email: form.email.trim().toLowerCase(),
        domicilio: form.domicilio.trim(),
        pais: form.pais.trim(),
        fotoDocFrente: fotoFrente,
        fotoDocDorso: fotoDorso,
      });

      navigation.navigate('RegistrationPending');
    } catch (error) {
      if (error.isNetworkError) {
        setErrors({ general: 'Sin conexión a internet. Verificá tu red.' });
      } else if (error.response?.status === 409) {
        setErrors({ email: 'Ya existe una solicitud con ese correo.' });
      } else if (error.response?.status === 400) {
        setErrors({ general: 'Datos inválidos. Revisá el formulario.' });
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Volver</Text>
          </TouchableOpacity>
          <NextLogo size={70} showText={true} />
          <Text style={styles.title}>Solicitar registro</Text>
          <Text style={styles.subtitle}>
            Completá tus datos para iniciar el proceso de registro. Nuestro equipo los verificará antes de habilitarte.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>

          {/* Nombre y Apellido en fila */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Input
                label="NOMBRE"
                placeholder="Juan"
                value={form.nombre}
                onChangeText={(t) => setField('nombre', t)}
                error={errors.nombre}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.halfField}>
              <Input
                label="APELLIDO"
                placeholder="Pérez"
                value={form.apellido}
                onChangeText={(t) => setField('apellido', t)}
                error={errors.apellido}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Input
            label="DOCUMENTO (DNI / PASAPORTE)"
            placeholder="12345678"
            value={form.documento}
            onChangeText={(t) => setField('documento', t)}
            error={errors.documento}
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
            label="DOMICILIO LEGAL"
            placeholder="Av. Corrientes 1234, CABA"
            value={form.domicilio}
            onChangeText={(t) => setField('domicilio', t)}
            error={errors.domicilio}
            autoCapitalize="words"
          />

          <Input
            label="PAÍS DE ORIGEN"
            placeholder="Argentina"
            value={form.pais}
            onChangeText={(t) => setField('pais', t)}
            error={errors.pais}
            autoCapitalize="words"
          />

          {/* Fotos del documento */}
          <Text style={styles.sectionLabel}>FOTO DEL DOCUMENTO</Text>

          <View style={styles.photoRow}>
            <View style={styles.photoSlot}>
              <TouchableOpacity
                style={[styles.photoBtn, errors.fotoFrente && styles.photoBtnError]}
                onPress={() => pickImage('frente')}
              >
                {fotoFrente ? (
                  <Image source={{ uri: fotoFrente }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>📄</Text>
                    <Text style={styles.photoLabel}>FRENTE</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.fotoFrente && (
                <Text style={styles.photoError}>{errors.fotoFrente}</Text>
              )}
            </View>

            <View style={styles.photoSlot}>
              <TouchableOpacity
                style={[styles.photoBtn, errors.fotoDorso && styles.photoBtnError]}
                onPress={() => pickImage('dorso')}
              >
                {fotoDorso ? (
                  <Image source={{ uri: fotoDorso }} style={styles.photoPreview} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Text style={styles.photoIcon}>📄</Text>
                    <Text style={styles.photoLabel}>DORSO</Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.fotoDorso && (
                <Text style={styles.photoError}>{errors.fotoDorso}</Text>
              )}
            </View>
          </View>

          {errors.general && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {errors.general}</Text>
            </View>
          )}

          <PrimaryButton
            title="Enviar solicitud"
            onPress={handleRegister}
            loading={loading}
            style={styles.submitBtn}
          />
        </View>

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
    textAlign: 'center',
    lineHeight: 20,
  },
  form: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  halfField: {
    flex: 1,
  },
  iconText: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1.5,
    marginBottom: SIZES.sm,
    marginTop: SIZES.xs,
  },
  photoRow: {
    flexDirection: 'row',
    gap: SIZES.md,
    marginBottom: SIZES.md,
  },
  photoSlot: {
    flex: 1,
  },
  photoBtn: {
    height: 120,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.cardAlt,
    borderStyle: 'dashed',
    backgroundColor: COLORS.card,
    overflow: 'hidden',
  },
  photoBtnError: {
    borderColor: COLORS.error,
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoIcon: {
    fontSize: 28,
  },
  photoLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1.5,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoError: {
    color: COLORS.error,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    marginTop: 4,
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
