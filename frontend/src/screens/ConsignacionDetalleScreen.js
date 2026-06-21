import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { consignacionesAPI } from '../services/api';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatFecha(str) {
  if (!str) return null;
  const [date] = str.split(' ');
  const [y, m, d] = date.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

function formatMoney(val) {
  if (!val && val !== 0) return null;
  return `$${parseFloat(val).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
}

const ESTADO_CONFIG = {
  pendiente: {
    label: 'EN REVISIÓN',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.12)',
    msg: 'Tu solicitud está siendo revisada por nuestro equipo. Te notificaremos cuando haya novedades.',
  },
  pendiente_envio: {
    label: 'ENVIAR ARTÍCULO',
    color: '#5B8DEF',
    bg: 'rgba(91,141,239,0.12)',
    msg: 'La empresa está interesada en tu artículo. Envialo a la dirección indicada para proceder con la inspección.',
  },
  en_inspeccion: {
    label: 'EN INSPECCIÓN',
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    msg: 'Tu artículo fue recibido y está siendo inspeccionado por nuestro equipo. Pronto recibirás una respuesta.',
  },
  aceptada: {
    label: 'ACEPTADA — PENDIENTE DE TU CONFIRMACIÓN',
    color: COLORS.success,
    bg: 'rgba(72,199,142,0.12)',
    msg: '¡Tu artículo fue aceptado! Revisá los términos propuestos y confirmá si los aceptás para incluirlo en subasta.',
  },
  programada: {
    label: 'PROGRAMADA',
    color: COLORS.success,
    bg: 'rgba(72,199,142,0.12)',
    msg: '¡Todo listo! Aceptaste los términos y tu artículo será incluido en la subasta indicada.',
  },
  rechazada: {
    label: 'RECHAZADA',
    color: COLORS.error,
    bg: 'rgba(255,82,82,0.12)',
    msg: 'Tu artículo no fue aceptado luego de la inspección. El bien será devuelto con los gastos indicados.',
  },
  devuelta_por_usuario: {
    label: 'DEVUELTA',
    color: COLORS.textMuted,
    bg: COLORS.card,
    msg: 'Rechazaste los términos propuestos. El artículo será devuelto. Se te informarán los gastos de envío.',
  },
};

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Seccion({ title, children }) {
  return (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ConsignacionDetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  const cargar = useCallback(() => {
    consignacionesAPI.detalle(id)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(cargar);

  const handleConfirmar = (acepta) => {
    const accion = acepta ? 'aceptar' : 'rechazar';
    Alert.alert(
      acepta ? 'Aceptar términos' : 'Rechazar términos',
      acepta
        ? '¿Confirmás que aceptás el valor base y las comisiones propuestas? Tu artículo será incluido en la subasta.'
        : '¿Confirmás que rechazás los términos? El artículo te será devuelto con los gastos correspondientes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: acepta ? 'Sí, acepto' : 'Sí, rechazo',
          style: acepta ? 'default' : 'destructive',
          onPress: async () => {
            setConfirmando(true);
            try {
              await consignacionesAPI.confirmar(id, acepta);
              setLoading(true);
              cargar();
            } catch {
              Alert.alert('Error', 'No se pudo procesar tu respuesta. Intentá de nuevo.');
            } finally {
              setConfirmando(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Solicitud</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.centered}><ActivityIndicator color={COLORS.secondary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const cfg = ESTADO_CONFIG[data.estado] || ESTADO_CONFIG.pendiente;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Solicitud #{data.id}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Banner de estado */}
        <View style={[styles.estadoBanner, { backgroundColor: cfg.bg, borderLeftColor: cfg.color }]}>
          <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[styles.estadoText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
          <Text style={[styles.estadoMsg, { color: cfg.color }]}>{cfg.msg}</Text>
        </View>

        {/* ── ESTADO: pendiente_envio — mostrar dirección ── */}
        {data.estado === 'pendiente_envio' && data.direccionEnvio && (
          <Seccion title="DIRECCIÓN DE ENVÍO">
            <View style={[styles.bodyCard, { borderLeftWidth: 3, borderLeftColor: '#5B8DEF' }]}>
              <Text style={[styles.bodyText, { color: COLORS.textPrimary }]}>{data.direccionEnvio}</Text>
            </View>
            <Text style={styles.hint}>
              Recordá que si el bien es inspeccionado y no es aceptado, la devolución corre por tu cuenta.
            </Text>
          </Seccion>
        )}

        {/* ── ESTADO: aceptada — términos + botones de confirmación ── */}
        {data.estado === 'aceptada' && (
          <Seccion title="TÉRMINOS PROPUESTOS">
            <View style={styles.terminosCard}>
              <InfoRow label="Valor base" value={formatMoney(data.valorBase)} />
              <InfoRow label="Comisión de la empresa" value={data.comision ? `${data.comision}%` : null} />
              <InfoRow label="Fecha de subasta" value={formatFecha(data.subastaFecha)} />
              <InfoRow label="Hora de inicio" value={data.subastaHora ? `${data.subastaHora}hs` : null} />
              <InfoRow label="Ubicación" value={data.subastaUbicacion} />
            </View>
            {!data.subastaFecha && (
              <Text style={styles.hint}>La fecha, hora y lugar de subasta serán informados próximamente.</Text>
            )}

            <View style={styles.botonesConfirmacion}>
              <TouchableOpacity
                style={[styles.btnConfirmar, confirmando && styles.btnDisabled]}
                onPress={() => handleConfirmar(true)}
                disabled={confirmando}
                activeOpacity={0.85}
              >
                {confirmando
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.btnConfirmarText}>Acepto los términos</Text>
                }
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnRechazar, confirmando && styles.btnDisabled]}
                onPress={() => handleConfirmar(false)}
                disabled={confirmando}
                activeOpacity={0.85}
              >
                <Text style={styles.btnRechazarText}>Rechazar términos</Text>
              </TouchableOpacity>
            </View>
          </Seccion>
        )}

        {/* ── ESTADO: programada — mostrar términos confirmados ── */}
        {data.estado === 'programada' && (
          <Seccion title="SUBASTA ASIGNADA">
            <View style={styles.terminosCard}>
              <InfoRow label="Valor base" value={formatMoney(data.valorBase)} />
              <InfoRow label="Comisión de la empresa" value={data.comision ? `${data.comision}%` : null} />
              <InfoRow label="Fecha de subasta" value={formatFecha(data.subastaFecha)} />
              <InfoRow label="Hora de inicio" value={data.subastaHora ? `${data.subastaHora}hs` : null} />
              <InfoRow label="Ubicación" value={data.subastaUbicacion} />
            </View>
          </Seccion>
        )}

        {/* ── Póliza de seguro (visible en aceptada y programada) ── */}
        {(data.estado === 'aceptada' || data.estado === 'programada') && data.nroPoliza && (
          <Seccion title="PÓLIZA DE SEGURO">
            <View style={styles.terminosCard}>
              <InfoRow label="N° de póliza" value={data.nroPoliza} />
              <InfoRow label="Compañía" value={data.companiaSeguro} />
              <InfoRow label="Importe asegurado" value={formatMoney(data.importeSeguro)} />
              <InfoRow label="Póliza combinada" value={data.polizaCombinada === 'si' ? 'Sí' : data.polizaCombinada === 'no' ? 'No' : null} />
            </View>
          </Seccion>
        )}

        {/* ── Ubicación del depósito (visible en aceptada y programada) ── */}
        {(data.estado === 'aceptada' || data.estado === 'programada') && data.ubicacionDeposito && (
          <Seccion title="DEPÓSITO">
            <View style={styles.bodyCard}>
              <Text style={styles.bodyText}>{data.ubicacionDeposito}</Text>
            </View>
          </Seccion>
        )}

        {/* ── ESTADO: rechazada — motivo + gastos ── */}
        {data.estado === 'rechazada' && (
          <>
            {data.motivoRechazo && (
              <Seccion title="MOTIVO DEL RECHAZO">
                <Text style={styles.motivoText}>{data.motivoRechazo}</Text>
              </Seccion>
            )}
            {data.gastosDevolucion && (
              <Seccion title="GASTOS DE DEVOLUCIÓN">
                <View style={[styles.terminosCard, { borderLeftWidth: 3, borderLeftColor: COLORS.error }]}>
                  <InfoRow label="Costo de envío de devolución" value={formatMoney(data.gastosDevolucion)} />
                </View>
              </Seccion>
            )}
          </>
        )}

        {/* ── ESTADO: devuelta_por_usuario — gastos ── */}
        {data.estado === 'devuelta_por_usuario' && data.gastosDevolucion && (
          <Seccion title="GASTOS DE DEVOLUCIÓN">
            <View style={styles.terminosCard}>
              <InfoRow label="Costo de envío de devolución" value={formatMoney(data.gastosDevolucion)} />
            </View>
          </Seccion>
        )}

        {/* Descripción */}
        <Seccion title="DESCRIPCIÓN DEL BIEN">
          <View style={styles.bodyCard}>
            <Text style={styles.bodyText}>{data.descripcion}</Text>
          </View>
        </Seccion>

        {/* Datos históricos */}
        {data.datosHistoricos ? (
          <Seccion title="DATOS HISTÓRICOS / RELEVANTES">
            <View style={styles.bodyCard}>
              <Text style={styles.bodyText}>{data.datosHistoricos}</Text>
            </View>
          </Seccion>
        ) : null}

        {/* Cuenta bancaria */}
        {data.cuentaVista ? (
          <Seccion title="CUENTA PARA COBRO">
            <View style={styles.bodyCard}>
              <Text style={styles.bodyText}>{data.cuentaVista}</Text>
            </View>
          </Seccion>
        ) : null}

        {/* Fotos */}
        {data.fotos && data.fotos.length > 0 && (
          <Seccion title={`FOTOS (${data.fotos.length})`}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {data.fotos.map((b64, idx) => (
                <Image
                  key={idx}
                  source={{ uri: `data:image/jpeg;base64,${b64}` }}
                  style={styles.fotoItem}
                />
              ))}
            </ScrollView>
          </Seccion>
        )}

        {/* Declaraciones */}
        <Seccion title="DECLARACIONES REALIZADAS">
          <View style={styles.declaracionesCard}>
            <View style={styles.decRow}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.decText}>Declaró que el bien le pertenece y no posee impedimentos legales</Text>
            </View>
            <View style={styles.decRow}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.decText}>Declaró origen lícito del bien y disponibilidad para acreditarlo</Text>
            </View>
          </View>
        </Seccion>

        <Text style={styles.fechaCreacion}>
          Solicitud enviada el {formatFecha(data.fechaCreacion)}
        </Text>

      </ScrollView>
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
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: SIZES.lg, paddingBottom: 60 },

  estadoBanner: {
    borderRadius: SIZES.radiusLg, padding: SIZES.lg,
    borderLeftWidth: 4, marginBottom: SIZES.lg,
  },
  estadoBadge: {
    alignSelf: 'flex-start', borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.sm + 2, paddingVertical: 3, marginBottom: SIZES.sm,
  },
  estadoText: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  estadoMsg: { fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, lineHeight: 20 },

  seccion: { marginBottom: SIZES.lg },
  seccionTitle: {
    color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs, letterSpacing: 1.5, marginBottom: SIZES.sm,
  },

  bodyCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md },
  bodyText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, lineHeight: 22 },
  hint: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: SIZES.xs, lineHeight: 18 },

  terminosCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: SIZES.xs + 2, borderBottomWidth: 1, borderBottomColor: COLORS.cardAlt,
  },
  infoLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  infoValue: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },

  motivoText: {
    color: COLORS.error, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd,
    lineHeight: 22, backgroundColor: 'rgba(255,82,82,0.08)',
    borderRadius: SIZES.radiusMd, padding: SIZES.md,
  },

  botonesConfirmacion: { marginTop: SIZES.lg, gap: SIZES.sm },
  btnConfirmar: {
    backgroundColor: COLORS.success, borderRadius: SIZES.radiusFull,
    padding: SIZES.md, alignItems: 'center',
  },
  btnConfirmarText: { color: '#fff', fontFamily: FONTS.titleBold, fontSize: SIZES.textMd },
  btnRechazar: {
    borderWidth: 1.5, borderColor: COLORS.error, borderRadius: SIZES.radiusFull,
    padding: SIZES.md, alignItems: 'center',
  },
  btnRechazarText: { color: COLORS.error, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textMd },
  btnDisabled: { opacity: 0.5 },

  fotoItem: { width: 140, height: 140, borderRadius: SIZES.radiusMd, marginRight: SIZES.sm },

  declaracionesCard: { backgroundColor: COLORS.card, borderRadius: COLORS.radiusMd, padding: SIZES.md },
  decRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SIZES.sm, marginBottom: SIZES.sm },
  checkIcon: { color: COLORS.success, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, lineHeight: 22 },
  decText: { flex: 1, color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, lineHeight: 20 },

  fechaCreacion: {
    color: COLORS.textMuted, fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs, textAlign: 'center', marginTop: SIZES.md,
  },
});
