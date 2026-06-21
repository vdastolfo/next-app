import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { consignacionesAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const MIN_FOTOS = 6;
const MAX_FOTOS = 12;

function Checkbox({ value, onToggle, label }) {
  return (
    <TouchableOpacity style={cbStyles.row} onPress={onToggle} activeOpacity={0.8}>
      <View style={[cbStyles.box, value && cbStyles.boxChecked]}>
        {value && <Text style={cbStyles.tick}>✓</Text>}
      </View>
      <Text style={cbStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const cbStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm, marginBottom: SIZES.md },
  box: {
    width: 22, height: 22, borderRadius: 5, borderWidth: 2,
    borderColor: COLORS.textMuted, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  boxChecked: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  tick: { color: '#fff', fontSize: 13, fontFamily: FONTS.bodySemiBold },
  label: { flex: 1, color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, lineHeight: 20 },
});

export default function NuevaConsignacionScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [datosHistoricos, setDatosHistoricos] = useState('');
  const [cuentaVista, setCuentaVista] = useState('');
  const [fotos, setFotos] = useState([]);
  const [declaraPropiedad, setDeclaraPropiedad] = useState(false);
  const [declaraOrigenLicito, setDeclaraOrigenLicito] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const agregarFoto = async () => {
    if (fotos.length >= MAX_FOTOS) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para adjuntar fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.4,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      setFotos([...fotos, result.assets[0].base64]);
    }
  };

  const quitarFoto = (idx) => setFotos(fotos.filter((_, i) => i !== idx));

  const avanzar = () => {
    if (step === 1) {
      if (!descripcion.trim()) {
        Alert.alert('Campo requerido', 'Ingresá una descripción del bien.');
        return;
      }
    }
    if (step === 2) {
      if (fotos.length < MIN_FOTOS) {
        Alert.alert('Fotos insuficientes', `Debés adjuntar al menos ${MIN_FOTOS} fotos.`);
        return;
      }
    }
    setStep(step + 1);
  };

  const enviar = async () => {
    if (!declaraPropiedad || !declaraOrigenLicito) {
      Alert.alert('Declaraciones requeridas', 'Debés aceptar ambas declaraciones para continuar.');
      return;
    }
    setEnviando(true);
    try {
      await consignacionesAPI.crear({
        descripcion: descripcion.trim(),
        datosHistoricos: datosHistoricos.trim() || null,
        cuentaVista: cuentaVista.trim() || null,
        declaraPropiedad,
        declaraOrigenLicito,
        fotos,
      });
      Alert.alert(
        'Solicitud enviada',
        'Tu solicitud fue enviada correctamente. Te notificaremos cuando sea revisada.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intentá de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Consignar artículo</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Indicador de pasos */}
      <View style={styles.stepRow}>
        {[1, 2, 3].map(n => (
          <View key={n} style={styles.stepItem}>
            <View style={[styles.stepDot, step >= n && styles.stepDotActive]}>
              <Text style={[styles.stepNum, step >= n && styles.stepNumActive]}>{n}</Text>
            </View>
            <Text style={[styles.stepLabel, step >= n && styles.stepLabelActive]}>
              {n === 1 ? 'Datos' : n === 2 ? 'Fotos' : 'Confirmación'}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* ── PASO 1: Datos del bien ── */}
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Datos del bien</Text>

            <Text style={styles.label}>Descripción <Text style={styles.req}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Describí el bien a subastar: tipo, características, estado, etc."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Datos históricos / relevantes <Text style={styles.opt}>(opcional)</Text></Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              value={datosHistoricos}
              onChangeText={setDatosHistoricos}
              placeholder="Procedencia, historia, certificados, valuaciones previas, etc."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Cuenta bancaria para cobro <Text style={styles.opt}>(opcional)</Text></Text>
            <TextInput
              style={styles.input}
              value={cuentaVista}
              onChangeText={setCuentaVista}
              placeholder="CBU / IBAN / SWIFT — puede completarse después"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        )}

        {/* ── PASO 2: Fotos ── */}
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Fotos del bien</Text>
            <Text style={styles.sectionSub}>
              Adjuntá al menos {MIN_FOTOS} fotos. Incluí diferentes ángulos y detalles.
            </Text>

            <View style={styles.photoGrid}>
              {fotos.map((b64, idx) => (
                <View key={idx} style={styles.photoSlot}>
                  <Image source={{ uri: `data:image/jpeg;base64,${b64}` }} style={styles.photo} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => quitarFoto(idx)}>
                    <Text style={styles.removeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {fotos.length < MAX_FOTOS && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={agregarFoto} activeOpacity={0.7}>
                  <Text style={styles.addPhotoIcon}>+</Text>
                  <Text style={styles.addPhotoText}>Agregar</Text>
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.photoCount}>
              {fotos.length}/{MIN_FOTOS} mínimo
              {fotos.length >= MIN_FOTOS ? '  ✓' : ''}
            </Text>
          </View>
        )}

        {/* ── PASO 3: Declaraciones ── */}
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Declaraciones</Text>
            <Text style={styles.sectionSub}>
              Antes de enviar, confirmá las siguientes declaraciones.
            </Text>

            <View style={styles.declarationsCard}>
              <Checkbox
                value={declaraPropiedad}
                onToggle={() => setDeclaraPropiedad(!declaraPropiedad)}
                label="Declaro que el bien me pertenece y no posee ningún impedimento legal para ser subastado."
              />
              <Checkbox
                value={declaraOrigenLicito}
                onToggle={() => setDeclaraOrigenLicito(!declaraOrigenLicito)}
                label="Declaro que el bien es de origen lícito y puedo acreditar su procedencia en caso de ser requerido."
              />
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>RESUMEN</Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Descripción: </Text>
                <Text style={styles.summaryValue}>{descripcion.substring(0, 60)}{descripcion.length > 60 ? '...' : ''}</Text>
              </Text>
              <Text style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fotos: </Text>
                <Text style={styles.summaryValue}>{fotos.length}</Text>
              </Text>
              {cuentaVista ? (
                <Text style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Cuenta: </Text>
                  <Text style={styles.summaryValue}>{cuentaVista.substring(0, 30)}...</Text>
                </Text>
              ) : null}
            </View>

            <View style={styles.devolInfo}>
              <Text style={styles.devolText}>
                Al enviar aceptás que, en caso de que la empresa no acepte el bien una vez inspeccionado, la devolución correrá por tu cuenta.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Botón de acción */}
      <View style={styles.footer}>
        {step < 3 ? (
          <TouchableOpacity style={styles.btn} onPress={avanzar} activeOpacity={0.85}>
            <Text style={styles.btnText}>Continuar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, enviando && styles.btnDisabled]}
            onPress={enviar}
            disabled={enviando}
            activeOpacity={0.85}
          >
            {enviando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>Enviar solicitud</Text>
            }
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.card,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: COLORS.textPrimary, fontSize: 22 },
  title: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg },

  stepRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: SIZES.xl, paddingVertical: SIZES.md,
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.cardAlt,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2,
    borderColor: COLORS.textMuted, alignItems: 'center', justifyContent: 'center',
  },
  stepDotActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  stepNum: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  stepNumActive: { color: '#fff' },
  stepLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs },
  stepLabelActive: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold },

  content: { padding: SIZES.lg, paddingBottom: 120 },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.xs },
  sectionSub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginBottom: SIZES.lg, lineHeight: 20 },

  label: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm, marginBottom: SIZES.xs, marginTop: SIZES.md },
  req: { color: COLORS.error },
  opt: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular },
  input: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm + 2,
    color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd,
  },
  inputMulti: { minHeight: 100, paddingTop: SIZES.sm + 2 },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.sm },
  photoSlot: { width: 100, height: 100, borderRadius: SIZES.radiusMd, overflow: 'hidden', position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 11, fontFamily: FONTS.bodySemiBold },
  addPhotoBtn: {
    width: 100, height: 100, borderRadius: SIZES.radiusMd,
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  addPhotoIcon: { color: COLORS.primary, fontSize: 28, fontFamily: FONTS.titleBold },
  addPhotoText: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, marginTop: 2 },
  photoCount: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, textAlign: 'center' },

  declarationsCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg, padding: SIZES.lg, marginBottom: SIZES.lg },
  summaryCard: { backgroundColor: COLORS.cardAlt, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.md },
  summaryTitle: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, marginBottom: SIZES.sm },
  summaryRow: { marginBottom: 4 },
  summaryLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  summaryValue: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  devolInfo: {
    backgroundColor: 'rgba(245,158,11,0.10)', borderRadius: SIZES.radiusMd,
    padding: SIZES.md, borderLeftWidth: 3, borderLeftColor: '#F59E0B',
  },
  devolText: { color: '#F59E0B', fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, lineHeight: 20 },

  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.lg, backgroundColor: COLORS.background },
  btn: { backgroundColor: COLORS.primary, borderRadius: SIZES.radiusFull, padding: SIZES.md + 2, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontFamily: FONTS.titleBold, fontSize: SIZES.textMd },
});
