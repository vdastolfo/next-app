import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { useAuth } from '../services/AuthContext';

export default function SearchScreen({ navigation, route }) {
  const { user } = useAuth();
  const [query, setQuery] = useState(route.params?.query || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches] = useState(['Rolex Oyster Perpetual', 'Esculturas de mármol']);
  const [suggestions] = useState(['Relojes de lujo', 'Arte contemporáneo', 'Coches clásicos', 'Joyas reales']);
  const [popularItems] = useState([
    { id: 1, nombreProducto: 'PATEK PHILIPPE', mejorPujaActual: 42000, badge: 'EN VIVO' },
    { id: 2, nombreProducto: 'BLUE GENESIS #4', mejorPujaActual: 18500, badge: '2D 14H' },
  ]);

  useEffect(() => {
    if (query) handleSearch();
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { auctionsAPI } = require('../services/api');
      const res = await auctionsAPI.search(query);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const showingResults = query.trim().length > 0 && results.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={searchStyles.searchHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={searchStyles.backBtn}>
          <Text style={searchStyles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={searchStyles.searchInputContainer}>
          <Text style={searchStyles.searchIcon}>🔍</Text>
          <TextInput
            style={searchStyles.searchInput}
            placeholder="Buscar lotes curados..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={searchStyles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={searchStyles.filterBtn}>
          <Text style={searchStyles.filterIcon}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: SIZES.lg }}>

        {!showingResults && (
          <>
            <View style={searchStyles.sectionRow}>
              <Text style={searchStyles.sectionTitle}>BÚSQUEDAS RECIENTES</Text>
              <TouchableOpacity><Text style={searchStyles.clearAllBtn}>BORRAR</Text></TouchableOpacity>
            </View>
            {recentSearches.map((s, i) => (
              <TouchableOpacity key={i} style={searchStyles.recentItem} onPress={() => setQuery(s)}>
                <Text style={searchStyles.recentIcon}>🕐</Text>
                <Text style={searchStyles.recentText}>{s}</Text>
                <Text style={searchStyles.recentArrow}>↗</Text>
              </TouchableOpacity>
            ))}

            <Text style={[searchStyles.sectionTitle, { marginTop: SIZES.lg }]}>SUGERENCIAS</Text>
            <View style={searchStyles.suggestionsGrid}>
              {suggestions.map((s, i) => (
                <TouchableOpacity key={i} style={searchStyles.suggestionChip} onPress={() => setQuery(s)}>
                  <Text style={searchStyles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[searchStyles.sectionTitle, { marginTop: SIZES.lg }]}>RESULTADOS POPULARES</Text>
            <View style={searchStyles.popularGrid}>
              {popularItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={searchStyles.popularCard}
                  onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
                >
                  <View style={searchStyles.popularImage}>
                    <Text style={searchStyles.popularEmoji}>📦</Text>
                    <View style={searchStyles.popularBadge}>
                      <Text style={[
                        searchStyles.popularBadgeText,
                        item.badge === 'EN VIVO' && { color: COLORS.secondary }
                      ]}>
                        {item.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={searchStyles.popularName}>{item.nombreProducto}</Text>
                  {user
                    ? <Text style={searchStyles.popularPrice}>${item.mejorPujaActual.toLocaleString()}</Text>
                    : <Text style={searchStyles.guestPrice}>Iniciá sesión para ver el precio</Text>
                  }
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {showingResults && results.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={searchStyles.resultCard}
            onPress={() => navigation.navigate('ProductDetail', { itemId: item.id })}
          >
            <View style={searchStyles.resultImage}>
              <Text style={{ fontSize: 30 }}>📦</Text>
            </View>
            <View style={searchStyles.resultInfo}>
              <Text style={searchStyles.resultName}>{item.nombreProducto}</Text>
              {user
                ? <Text style={searchStyles.resultPrice}>${item.mejorPujaActual?.toLocaleString() || item.precioBase?.toLocaleString()}</Text>
                : <Text style={searchStyles.guestPrice}>Iniciá sesión para ver el precio</Text>
              }
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FiltersModal visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
  );
}

function FiltersModal({ visible, onClose }) {
  const [sort, setSort] = useState('relevancia');
  const sortOptions = [
    { key: 'relevancia', label: 'Relevancia' },
    { key: 'reciente', label: 'Más reciente' },
    { key: 'mayor_precio', label: 'Mayor precio' },
    { key: 'menor_precio', label: 'Menor precio' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={filterStyles.overlay}>
        <View style={filterStyles.sheet}>
          <View style={filterStyles.header}>
            <Text style={filterStyles.title}>Filtros</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={filterStyles.resetText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
          <View style={filterStyles.divider} />

          <Text style={filterStyles.sectionTitle}>Ordenar por</Text>
          {sortOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={filterStyles.optionRow}
              onPress={() => setSort(opt.key)}
            >
              <Text style={filterStyles.optionLabel}>{opt.label}</Text>
              <View style={[filterStyles.radio, sort === opt.key && filterStyles.radioActive]}>
                {sort === opt.key && <View style={filterStyles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}

          <View style={filterStyles.divider} />
          <TouchableOpacity style={filterStyles.categoriesRow}>
            <Text style={filterStyles.sectionTitle}>Categorías</Text>
            <Text style={filterStyles.chevron}>∨</Text>
          </TouchableOpacity>
          <Text style={filterStyles.allCategoriesText}>Todas las categorías</Text>

          <PrimaryButton
            title="Mostrar resultados"
            onPress={onClose}
            style={filterStyles.applyBtn}
          />
          <View style={filterStyles.handle} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
});

const searchStyles = StyleSheet.create({
  searchHeader: { flexDirection: 'row', alignItems: 'center', padding: SIZES.md, gap: SIZES.sm },
  backBtn: { padding: SIZES.xs },
  backIcon: { color: COLORS.textPrimary, fontSize: 24 },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.input, borderRadius: SIZES.radiusFull, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  searchIcon: { fontSize: 16, marginRight: SIZES.sm },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  clearBtn: { color: COLORS.textMuted, fontSize: 16, padding: SIZES.xs },
  filterBtn: { padding: SIZES.sm },
  filterIcon: { fontSize: 22 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  sectionTitle: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 2 },
  clearAllBtn: { color: COLORS.primary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1 },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SIZES.md, gap: SIZES.md },
  recentIcon: { fontSize: 18 },
  recentText: { flex: 1, color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textLg },
  recentArrow: { color: COLORS.textMuted, fontSize: 20 },
  suggestionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.sm, marginBottom: SIZES.md },
  suggestionChip: { backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.md, paddingVertical: SIZES.sm },
  suggestionText: { color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  popularGrid: { flexDirection: 'row', gap: SIZES.md },
  popularCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, overflow: 'hidden' },
  popularImage: { height: 120, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  popularEmoji: { fontSize: 40 },
  popularBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: SIZES.radiusFull, paddingHorizontal: 8, paddingVertical: 2 },
  popularBadgeText: { color: COLORS.textPrimary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs },
  popularName: { color: COLORS.textSecondary, fontFamily: FONTS.bodySemiBold, fontSize: SIZES.textXs, letterSpacing: 1, padding: SIZES.sm, paddingBottom: 0 },
  popularPrice: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, padding: SIZES.sm, paddingTop: 2 },
  resultCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: SIZES.radiusMd, marginBottom: SIZES.sm, overflow: 'hidden' },
  resultImage: { width: 80, height: 80, backgroundColor: COLORS.cardAlt, alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, padding: SIZES.md, justifyContent: 'center' },
  resultName: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textMd, marginBottom: 4 },
  resultPrice: { color: COLORS.secondary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg },
  guestPrice: { color: COLORS.textMuted, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textXs, fontStyle: 'italic' },
});

const filterStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: COLORS.background, borderTopLeftRadius: SIZES.radiusXl, borderTopRightRadius: SIZES.radiusXl, padding: SIZES.lg, paddingBottom: SIZES.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.md },
  title: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textXl },
  resetText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd },
  divider: { height: 1, backgroundColor: COLORS.card, marginVertical: SIZES.md },
  sectionTitle: { color: COLORS.textPrimary, fontFamily: FONTS.titleBold, fontSize: SIZES.textLg, marginBottom: SIZES.sm },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SIZES.sm },
  optionLabel: { color: COLORS.textPrimary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textLg },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: COLORS.accent2, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.textPrimary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.textPrimary },
  categoriesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chevron: { color: COLORS.textMuted, fontSize: 20 },
  allCategoriesText: { color: COLORS.textSecondary, fontFamily: FONTS.bodyRegular, fontSize: SIZES.textMd, marginBottom: SIZES.lg },
  applyBtn: { marginTop: SIZES.md },
  handle: { width: 40, height: 4, backgroundColor: COLORS.accent2, borderRadius: 2, alignSelf: 'center', marginTop: SIZES.lg },
});
