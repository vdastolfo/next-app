import React, { useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { consignacionesAPI } from '../services/api';
import { LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const ESTADO_CONFIG = {
  pendiente:            { label: 'EN REVISIÓN',     color: '#F59E0B',        bg: 'rgba(245,158,11,0.12)' },
  pendiente_envio:      { label: 'ENVIAR ARTÍCULO', color: '#5B8DEF',        bg: 'rgba(91,141,239,0.12)' },
  en_inspeccion:        { label: 'EN INSPECCIÓN',   color: '#8B5CF6',        bg: 'rgba(139,92,246,0.12)' },
  aceptada:             { label: 'ACEPTADA',         color: COLORS.success,   bg: 'rgba(72,199,142,0.12)' },
  programada:           { label: 'PROGRAMADA',       color: COLORS.success,   bg: 'rgba(72,199,142,0.12)' },
  rechazada:            { label: 'RECHAZADA',        color: COLORS.error,     bg: 'rgba(255,82,82,0.12)' },
  devuelta_por_usuario: { label: 'DEVUELTA',         color: COLORS.textMuted, bg: COLORS.cardAlt },
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatFecha(str) {
  if (!str) return '';
  const [date] = str.split(' ');
  const [y, m, d] = date.split('-');
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

function SolicitudCard({ item, onPress }) {
  const cfg = ESTADO_CONFIG[item.estado] || ESTADO_CONFIG.pendiente;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.estadoBadge, { backgroundColor: cfg.bg }]}>
          <Text style={[styles.estadoText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <Text style={styles.fecha}>{formatFecha(item.fechaCreacion)}</Text>
      </View>
      <Text style={styles.descripcion} numberOfLines={2}>{item.descripcion}</Text>
      <Text style={styles.fotos}>{item.cantidadFotos} fotos adjuntas</Text>
    </TouchableOpacity>
  );
}

export default function ConsignacionesScreen({ navigation }) {
  const [solicitudes, setSolicitudes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const cargar = async () => {
    try {
      const res = await consignacionesAPI.listar();
      setSolicitudes(res.data || []);
    } catch {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { cargar(); }, []));

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Consignaciones</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NuevaConsignacion')}
        >
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={solicitudes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); cargar(); }} tintColor={COLORS.secondary} />
        }
        renderItem={({ item }) => (
          <SolicitudCard
            item={item}
            onPress={() => navigation.navigate('ConsignacionDetalle', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin solicitudes aún</Text>
            <Text style={styles.emptyText}>
              Tocá + para consignar un artículo y que la empresa lo evalúe para subastar.
            </Text>
          </View>
        }
      />
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
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  addIcon: { color: '#fff', fontSize: 24, lineHeight: 28 },
  list: { padding: SIZES.lg, paddingBottom: 100 },
  card: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusLg,
    padding: SIZES.lg, marginBottom: SIZES.md,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.sm },
  estadoBadge: { borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.sm + 2, paddingVertical: 3 },
  estadoText: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  fecha: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs },
  descripcion: { color: COLORS.textPrimary, fontFamily: FONTS.bodyMedium, fontSize: SIZES.textMd, marginBottom: SIZES.xs },
  fotos: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs },
  empty: { paddingTop: SIZES.xxl + SIZES.xl, alignItems: 'center', paddingHorizontal: SIZES.xl },
  emptyTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.sm },
  emptyText: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center', lineHeight: 22 },
});
