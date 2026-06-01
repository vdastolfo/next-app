import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, RefreshControl, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../services/AuthContext';
import { auctionsAPI } from '../services/api';
import { AuctionCard, NextLogo, LoadingScreen } from '../components';
import { COLORS, FONTS, SIZES } from '../constants/theme';

const CATEGORIES = ['Todo', 'Arte', 'Tecnología', 'Moda', 'Joyas', 'Relojes'];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todo');
  const [searchText, setSearchText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setError(null);
      const response = await auctionsAPI.list();
      setItems(response.data || []);
    } catch (err) {
      if (err.isNetworkError) {
        setError('Sin conexión a internet. Verificá tu red.');
      } else {
        setError('No se pudieron cargar las subastas.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadItems();
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      navigation.navigate('Search', { query: searchText });
    }
  };

  if (loading) return <LoadingScreen />;

  // Datos mock para mostrar mientras el backend no tenga imágenes reales
  const mockItems = items.length > 0 ? items : [
    { id: 1, nombreProducto: 'Neo-Abstracto #42', mejorPujaActual: 12400, precioBase: 10000 },
    { id: 2, nombreProducto: 'Chronos Heirloom', mejorPujaActual: 45000, precioBase: 40000 },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.secondary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <NextLogo size={40} showText={true} />
          <TouchableOpacity style={styles.bellBtn}>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Buscador */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search')}
          activeOpacity={0.8}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Buscar lotes curados...</Text>
        </TouchableOpacity>

        {/* Filtros de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === cat && styles.categoryTextActive,
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity onPress={loadItems}>
              <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sección: Termina pronto */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Termina pronto</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>VER TODO</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={mockItems}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => String(item.id || item.identificador)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <AuctionCard
              item={item}
              onPress={() => navigation.navigate('ProductDetail', {
                itemId: item.id || item.identificador
              })}
              onBid={() => navigation.navigate('ProductDetail', {
                itemId: item.id || item.identificador
              })}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No hay subastas disponibles para tu categoría.
              </Text>
            </View>
          }
        />

        <View style={{ height: SIZES.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
  },
  bellBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: { fontSize: 22 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm + 4,
    marginBottom: SIZES.md,
  },
  searchIcon: { fontSize: 16, marginRight: SIZES.sm },
  searchPlaceholder: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
  },
  categoriesContainer: { marginBottom: SIZES.md },
  categoriesContent: {
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
  },
  categoryChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.card,
    marginRight: SIZES.sm,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm,
  },
  categoryTextActive: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodySemiBold,
  },
  errorBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,82,82,0.12)',
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textSm,
    flex: 1,
  },
  retryText: {
    color: COLORS.accent1,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textXxl,
  },
  seeAllText: {
    color: COLORS.primary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textSm,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.md,
  },
  emptyState: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    textAlign: 'center',
  },
});
