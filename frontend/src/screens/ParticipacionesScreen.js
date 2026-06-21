import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { activityAPI } from '../services/api';
import { useAuth } from '../services/AuthContext';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const CATEGORY_ORDER = ['comun', 'especial', 'plata', 'oro', 'platino'];
const CATEGORY_LABELS = {
  comun: 'Común', especial: 'Especial', plata: 'Plata', oro: 'Oro', platino: 'Platino',
};
const CATEGORY_COLORS = {
  comun: COLORS.textMuted, especial: COLORS.accent1,
  plata: '#C0C0C0', oro: COLORS.warning, platino: '#E8E8FF',
};
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

function formatDate(d) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${parseInt(day)} ${MONTHS[parseInt(m) - 1]} ${y}`;
}

function formatMoney(amount, moneda) {
  if (!amount && amount !== 0) return '—';
  const n = parseFloat(amount);
  if (n === 0) return moneda === 'dolares' ? 'USD 0' : '$0';
  if (n >= 1000000) return `${moneda === 'dolares' ? 'USD ' : '$'}${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${moneda === 'dolares' ? 'USD ' : '$'}${(n / 1000).toFixed(0)}K`;
  return `${moneda === 'dolares' ? 'USD ' : '$'}${n.toFixed(0)}`;
}

function ProgresoCategoria({ categoriaActual, ganadosEnCategoria }) {
  const idx = CATEGORY_ORDER.indexOf(categoriaActual);
  const siguiente = idx >= 0 && idx < CATEGORY_ORDER.length - 1
    ? CATEGORY_ORDER[idx + 1] : null;

  if (!siguiente) {
    return (
      <View style={prog.container}>
        <Text style={prog.title}>NIVEL MÁXIMO ALCANZADO</Text>
        <Text style={prog.sub}>Sos miembro {CATEGORY_LABELS[categoriaActual]}. El nivel más alto.</Text>
      </View>
    );
  }

  const progreso = Math.min(ganadosEnCategoria, 3);
  const pct = (progreso / 3) * 100;

  return (
    <View style={prog.container}>
      <View style={prog.row}>
        <Text style={prog.title}>PROGRESO HACIA {CATEGORY_LABELS[siguiente]?.toUpperCase()}</Text>
        <Text style={prog.count}>{progreso}/3 lotes</Text>
      </View>
      <View style={prog.barBg}>
        <View style={[prog.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={prog.hint}>
        Necesitás ganar 3 lotes en subastas {CATEGORY_LABELS[categoriaActual]} y tener al menos 3 medios de pago verificados.
      </Text>
    </View>
  );
}

export default function ParticipacionesScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    activityAPI.getParticipaciones()
      .then(r => {
        const d = r.data;
        setData(d);
        if (d.categoriaActual && d.categoriaActual !== user?.categoria) {
          updateUser({ categoria: d.categoriaActual });
        }
        if (d.subioCategoria) {
          Alert.alert(
            '¡Subiste de categoría!',
            `Ahora sos miembro ${CATEGORY_LABELS[d.categoriaActual]}. Tenés acceso a nuevas subastas.`,
            [{ text: 'Genial' }]
          );
        }
      })
      .catch(() => setError('No se pudieron cargar las métricas.'))
      .finally(() => setLoading(false));
  }, []);

  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Mis Participaciones</Text>
      <View style={{ width: 44 }} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.centered}><ActivityIndicator color={COLORS.secondary} size="large" /></View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || 'Error al cargar.'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sinActividad = data.subastasAsistidas === 0;

  // Lotes ganados en la categoría actual (para barra de progreso)
  const catActual = data.categoriaActual || user?.categoria || 'comun';
  const ganadosEnCatActual = (data.porCategoria || [])
    .find(c => c.categoria === catActual)?.itemsGanados ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />

      {sinActividad ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Sin participaciones aún</Text>
          <Text style={styles.emptySubtitle}>Empezá a pujar para ver tus métricas aquí.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>

          {/* Categoría actual + progreso */}
          <View style={styles.catHeader}>
            <Text style={styles.catHeaderLabel}>MIEMBRO</Text>
            <Text style={[styles.catHeaderValue, { color: CATEGORY_COLORS[catActual] || COLORS.textMuted }]}>
              {CATEGORY_LABELS[catActual]?.toUpperCase()}
            </Text>
          </View>

          <ProgresoCategoria
            categoriaActual={catActual}
            ganadosEnCategoria={ganadosEnCatActual}
          />

          {/* Resumen global */}
          <Text style={styles.sectionTitle}>RESUMEN GENERAL</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.subastasAsistidas}</Text>
              <Text style={styles.statLabel}>SUBASTAS{'\n'}ASISTIDAS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.itemsGanados}</Text>
              <Text style={styles.statLabel}>LOTES{'\n'}GANADOS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: COLORS.secondary }]}>
                {data.winRate}%
              </Text>
              <Text style={styles.statLabel}>WIN{'\n'}RATE</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.itemsPujados}</Text>
              <Text style={styles.statLabel}>LOTES{'\n'}PUJADOS</Text>
            </View>
          </View>

          {/* Totales monetarios */}
          <View style={styles.moneyRow}>
            <View style={[styles.moneyCard, { flex: 1 }]}>
              <Text style={styles.moneyLabel}>TOTAL OFERTADO</Text>
              <Text style={styles.moneyValue}>{formatMoney(data.totalOfertado, 'pesos')}</Text>
            </View>
            <View style={[styles.moneyCard, { flex: 1 }]}>
              <Text style={styles.moneyLabel}>TOTAL PAGADO</Text>
              <Text style={[styles.moneyValue, { color: COLORS.success }]}>
                {formatMoney(data.totalPagado, 'pesos')}
              </Text>
            </View>
          </View>

          {/* Por categoría */}
          {data.porCategoria && data.porCategoria.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>POR CATEGORÍA</Text>
              <View style={styles.card}>
                {data.porCategoria.map((cat, i) => {
                  const color = CATEGORY_COLORS[cat.categoria] || COLORS.textMuted;
                  const label = CATEGORY_LABELS[cat.categoria] || cat.categoria;
                  return (
                    <View
                      key={cat.categoria}
                      style={[styles.catRow, i < data.porCategoria.length - 1 && styles.catRowBorder]}
                    >
                      <View style={[styles.catDot, { backgroundColor: color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.catName, { color }]}>{label.toUpperCase()}</Text>
                        <Text style={styles.catSub}>
                          {cat.subastasAsistidas} {cat.subastasAsistidas === 1 ? 'subasta' : 'subastas'} · {cat.itemsPujados} lotes pujados
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.catWon}>{cat.itemsGanados} ganados</Text>
                        <Text style={styles.catMoney}>{formatMoney(cat.totalOfertado, 'pesos')}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {/* Historial de subastas */}
          {data.historial && data.historial.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>HISTORIAL DE SUBASTAS</Text>
              {data.historial.map((h) => {
                const color = CATEGORY_COLORS[h.categoria] || COLORS.textMuted;
                const label = CATEGORY_LABELS[h.categoria] || h.categoria;
                return (
                  <View key={h.subastaId} style={styles.histCard}>
                    <View style={styles.histHeader}>
                      <View style={[styles.catChip, { borderColor: color }]}>
                        <Text style={[styles.catChipText, { color }]}>{label}</Text>
                      </View>
                      <Text style={styles.histDate}>{formatDate(h.fecha)}</Text>
                    </View>
                    <Text style={styles.histUbicacion} numberOfLines={1}>{h.ubicacion}</Text>
                    <View style={styles.histStats}>
                      <View style={styles.histStat}>
                        <Text style={styles.histStatVal}>{h.pujasRealizadas}</Text>
                        <Text style={styles.histStatLabel}>pujas</Text>
                      </View>
                      <View style={styles.histStatDivider} />
                      <View style={styles.histStat}>
                        <Text style={styles.histStatVal}>{h.itemsPujados}</Text>
                        <Text style={styles.histStatLabel}>lotes</Text>
                      </View>
                      <View style={styles.histStatDivider} />
                      <View style={styles.histStat}>
                        <Text style={[styles.histStatVal, h.itemsGanados > 0 && { color: COLORS.success }]}>
                          {h.itemsGanados}
                        </Text>
                        <Text style={styles.histStatLabel}>ganados</Text>
                      </View>
                      <View style={styles.histStatDivider} />
                      <View style={styles.histStat}>
                        <Text style={styles.histStatVal}>{formatMoney(h.totalOfertado, h.moneda)}</Text>
                        <Text style={styles.histStatLabel}>ofertado</Text>
                      </View>
                      {parseFloat(h.totalPagado) > 0 && (
                        <>
                          <View style={styles.histStatDivider} />
                          <View style={styles.histStat}>
                            <Text style={[styles.histStatVal, { color: COLORS.success }]}>
                              {formatMoney(h.totalPagado, h.moneda)}
                            </Text>
                            <Text style={styles.histStatLabel}>pagado</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const prog = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, marginBottom: SIZES.xs,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.xs },
  title: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  count: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textSm },
  barBg: { height: 6, backgroundColor: COLORS.cardAlt, borderRadius: 3, marginBottom: SIZES.xs },
  barFill: { height: 6, backgroundColor: COLORS.secondary, borderRadius: 3 },
  hint: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs },
  sub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginTop: 4 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm,
    borderBottomWidth: 1, borderBottomColor: COLORS.card,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  backIcon: { color: COLORS.textPrimary, fontSize: 22 },
  headerTitle: {
    flex: 1, textAlign: 'center',
    color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.xl },
  errorText: { color: COLORS.error, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: SIZES.md },
  emptyTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl, marginBottom: SIZES.xs },
  emptySubtitle: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, textAlign: 'center' },

  content: { padding: SIZES.lg },
  sectionTitle: {
    color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs, letterSpacing: 1.5,
    marginBottom: SIZES.sm, marginTop: SIZES.lg,
  },

  catHeader: { alignItems: 'center', paddingVertical: SIZES.md },
  catHeaderLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 2 },
  catHeaderValue: { fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero, marginTop: 2 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm },
  statCard: {
    flex: 1, minWidth: '45%',
    backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd,
    padding: SIZES.md, alignItems: 'center',
  },
  statValue: { color: COLORS.textPrimary, fontFamily: FONTS.titleExtraBold, fontSize: SIZES.textHero, marginBottom: 4 },
  statLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, textAlign: 'center' },

  moneyRow: { flexDirection: 'row', gap: SIZES.sm, marginTop: SIZES.sm },
  moneyCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md },
  moneyLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, marginBottom: 4 },
  moneyValue: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl },

  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, overflow: 'hidden' },
  catRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  catRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardAlt },
  catDot: { width: 8, height: 8, borderRadius: 4 },
  catName: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  catSub: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: 2 },
  catWon: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textSm },
  catMoney: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, marginTop: 2 },

  catChip: { borderWidth: 1, borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.sm, paddingVertical: 2 },
  catChipText: { fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },

  histCard: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, padding: SIZES.md, marginBottom: SIZES.sm },
  histHeader: { flexDirection: 'row', alignItems: 'center', gap: SIZES.sm, marginBottom: SIZES.xs },
  histDate: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm },
  histUbicacion: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textSm, marginBottom: SIZES.sm },
  histStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardAlt, borderRadius: SIZES.radiusSm,
    padding: SIZES.sm, flexWrap: 'wrap', gap: 4,
  },
  histStat: { alignItems: 'center', paddingHorizontal: SIZES.xs },
  histStatVal: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd },
  histStatLabel: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs },
  histStatDivider: { width: 1, height: 28, backgroundColor: COLORS.card },
});
