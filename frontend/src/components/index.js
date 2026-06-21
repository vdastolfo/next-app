import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, View,
  ActivityIndicator, TextInput, Image
} from 'react-native';
import { MEDIA_URL } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

// ── LOGO NEXT (triángulo verde con texto) ────────────────────────────────────
export function NextLogo({ size = 80, showText = true }) {
  const s = size;
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={s} height={s * 0.9} viewBox="0 0 100 90">
        <Path
          d="M50 5 L95 80 Q95 88 87 88 L13 88 Q5 88 5 80 Z"
          fill="none"
          stroke={COLORS.secondary}
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
      {showText && (
        <Text style={[styles.logoText, { fontSize: s * 0.28 }]}>next</Text>
      )}
    </View>
  );
}

// ── BOTÓN PRIMARIO (verde con gradiente) ──────────────────────────────────────
export function PrimaryButton({ title, onPress, loading = false, disabled = false, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.btnWrapper, style]}
    >
      <LinearGradient
        colors={disabled ? ['#444', '#444'] : ['#00E676', '#00C853']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.btnGradient}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.btnText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── BOTÓN SECUNDARIO (outline) ────────────────────────────────────────────────
export function SecondaryButton({ title, onPress, style, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.btnSecondary, style]}
    >
      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
      <Text style={styles.btnSecondaryText}>{title}</Text>
    </TouchableOpacity>
  );
}

// ── INPUT ─────────────────────────────────────────────────────────────────────
export function Input({
  label, placeholder, value, onChangeText, secureTextEntry,
  keyboardType, error, rightIcon, onRightIconPress, autoCapitalize = 'none'
}) {
  const [focused, setFocused] = React.useState(false);

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        focused && styles.inputFocused,
        error && styles.inputError,
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.inputIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.inputErrorText}>{error}</Text>}
    </View>
  );
}

// ── TARJETA DE SUBASTA (Home) ─────────────────────────────────────────────────
export function AuctionCard({ item, onBid, onPress, isGuest = false, style }) {
  const [imgError, setImgError] = React.useState(false);

  const fotoId = item.fotoIds?.[0];
  const showImage = fotoId && !imgError;
  const isSold = item.subastado === 'si';

  return (
    <TouchableOpacity
      style={[styles.auctionCard, style, isSold && styles.auctionCardSold]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.auctionImageContainer}>
        {showImage ? (
          <Image
            source={{ uri: `${MEDIA_URL}/fotos/${fotoId}` }}
            style={styles.auctionImage}
            onError={() => setImgError(true)}
          />
        ) : (
          <View style={styles.auctionImagePlaceholder}>
            <Text style={styles.auctionImagePlaceholderText}>📦</Text>
          </View>
        )}
        {isSold && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldOverlayText}>VENDIDO</Text>
          </View>
        )}
      </View>
      <View style={styles.auctionCardBottom}>
        <View style={{ flex: 1 }}>
          <Text style={styles.auctionTitle} numberOfLines={1}>
            {item.nombreProducto || 'Ítem sin nombre'}
          </Text>
          {isGuest ? (
            <Text style={styles.guestPrice}>Iniciá sesión para ver precios</Text>
          ) : isSold ? (
            <>
              <Text style={styles.auctionLabel}>PRECIO FINAL</Text>
              <Text style={[styles.auctionPrice, { color: COLORS.textMuted }]}>
                ${item.mejorPujaActual?.toLocaleString() || '—'}
              </Text>
              {item.duenioActual && (
                <Text style={styles.soldOwner} numberOfLines={1}>
                  Adjudicado a {item.duenioActual}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.auctionLabel}>OFERTA ACTUAL</Text>
              <Text style={styles.auctionPrice}>
                ${item.mejorPujaActual?.toLocaleString() || item.precioBase?.toLocaleString() || '0'}
              </Text>
            </>
          )}
        </View>
        {!isSold && !isGuest && (
          <TouchableOpacity
            style={styles.bidButton}
            onPress={() => onBid && onBid(item)}
          >
            <Text style={styles.bidButtonText}>PUJAR</Text>
          </TouchableOpacity>
        )}
        {isSold && (
          <Text style={styles.soldArrow}>›</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ── TOAST DE NOTIFICACIÓN ─────────────────────────────────────────────────────
export function Toast({ visible, message, type = 'success' }) {
  if (!visible) return null;
  return (
    <View style={[styles.toast, type === 'error' && styles.toastError]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
}

// ── BADGE DE CATEGORÍA ────────────────────────────────────────────────────────
export function CategoryBadge({ categoria }) {
  const colors = {
    comun: '#75777E',
    especial: '#40C4FF',
    plata: '#B0BEC5',
    oro: '#FFD740',
    platino: '#E040FB',
  };
  return (
    <View style={[styles.badge, { borderColor: colors[categoria] || '#75777E' }]}>
      <Text style={[styles.badgeText, { color: colors[categoria] || '#75777E' }]}>
        {categoria?.toUpperCase()}
      </Text>
    </View>
  );
}

// ── LOADING SCREEN ────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <View style={styles.loadingScreen}>
      <NextLogo size={60} showText={true} />
      <ActivityIndicator color={COLORS.secondary} style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Logo
  logoText: {
    color: COLORS.secondary,
    fontFamily: FONTS.titleBold,
    letterSpacing: 2,
    marginTop: -8,
  },

  // Botón primario
  btnWrapper: { borderRadius: SIZES.radiusFull, overflow: 'hidden' },
  btnGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: SIZES.radiusFull,
  },
  btnText: {
    color: COLORS.background,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textMd,
    letterSpacing: 0.5,
  },

  // Botón secundario
  btnSecondary: {
    borderWidth: 1,
    borderColor: COLORS.accent2,
    borderRadius: SIZES.radiusFull,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    backgroundColor: COLORS.card,
  },
  btnSecondaryText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textMd,
  },

  // Input
  inputContainer: { marginBottom: SIZES.md },
  inputLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.input,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: COLORS.secondary },
  inputError: { borderColor: COLORS.error },
  input: {
    flex: 1,
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textMd,
    paddingVertical: 14,
  },
  inputIcon: { padding: 4 },
  inputErrorText: {
    color: COLORS.error,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    marginTop: 4,
  },

  // Tarjeta subasta
  auctionCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginRight: SIZES.md,
    width: 280,
  },
  auctionCardSold: {
    opacity: 0.85,
  },
  auctionImageContainer: { position: 'relative' },
  auctionImage: {
    height: 180,
    width: '100%',
  },
  auctionImagePlaceholder: {
    height: 180,
    backgroundColor: COLORS.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auctionImagePlaceholderText: { fontSize: 48 },
  soldOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldOverlayText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textXl,
    letterSpacing: 3,
    borderWidth: 2,
    borderColor: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: SIZES.radiusSm,
  },
  auctionCardBottom: {
    padding: SIZES.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  auctionTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textLg,
    marginBottom: 4,
  },
  auctionLabel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1,
  },
  guestPrice: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    fontStyle: 'italic',
    marginTop: 4,
  },
  auctionPrice: {
    color: COLORS.secondary,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textXl,
  },
  soldOwner: {
    color: COLORS.textMuted,
    fontFamily: FONTS.bodyRegular,
    fontSize: SIZES.textXs,
    marginTop: 2,
    fontStyle: 'italic',
  },
  soldArrow: {
    color: COLORS.textMuted,
    fontSize: 24,
    marginLeft: SIZES.sm,
  },
  bidButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bidButtonText: {
    color: COLORS.background,
    fontFamily: FONTS.titleBold,
    fontSize: SIZES.textSm,
    letterSpacing: 1,
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: COLORS.card,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    zIndex: 999,
  },
  toastError: { borderLeftColor: COLORS.error },
  toastText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bodyMedium,
    fontSize: SIZES.textMd,
  },

  // Badge
  badge: {
    borderWidth: 1,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: SIZES.textXs,
    letterSpacing: 1,
  },

  // Loading
  loadingScreen: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
