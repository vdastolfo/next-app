import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  // Animaciones
  const ellipseOpacity = useRef(new Animated.Value(0)).current;
  const triangleScale = useRef(new Animated.Value(0.1)).current;
  const triangleOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Frame 00: elipse aparece
      Animated.timing(ellipseOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
      // Frame 01-03: triángulo crece desde pequeño
      Animated.parallel([
        Animated.timing(triangleScale, {
          toValue: 1, duration: 600, useNativeDriver: true,
        }),
        Animated.timing(triangleOpacity, {
          toValue: 1, duration: 400, useNativeDriver: true,
        }),
        Animated.timing(ellipseOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true,
        }),
      ]),
      // Frame 04: texto "next" aparece
      Animated.timing(textOpacity, {
        toValue: 1, duration: 400, useNativeDriver: true,
      }),
      // Barra de progreso
      Animated.timing(progressWidth, {
        toValue: 1, duration: 800, useNativeDriver: false,
      }),
      Animated.delay(300),
      // Fade out total
      Animated.timing(fadeOut, {
        toValue: 0, duration: 400, useNativeDriver: true,
      }),
    ]).start(() => onFinish && onFinish());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      {/* Elipse sombra (frame 00) */}
      <Animated.View style={[styles.ellipse, { opacity: ellipseOpacity }]} />

      {/* Triángulo logo */}
      <Animated.View style={{
        opacity: triangleOpacity,
        transform: [{ scale: triangleScale }],
        alignItems: 'center',
      }}>
        {/* Triángulo SVG manual con View */}
        <View style={styles.triangleOuter}>
          <View style={styles.triangleInner} />
          {/* Texto "next" dentro del triángulo */}
          <Animated.Text style={[styles.nextText, { opacity: textOpacity }]}>
            next
          </Animated.Text>
        </View>
      </Animated.View>

      {/* Barra de progreso (frame 09 / 16) */}
      <Animated.View style={styles.progressContainer}>
        <Animated.View style={[
          styles.progressBar,
          {
            width: progressWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }
        ]} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ellipse: {
    position: 'absolute',
    width: 200,
    height: 40,
    backgroundColor: '#001B3A',
    borderRadius: 100,
    top: height * 0.52,
  },
  triangleOuter: {
    width: 140,
    height: 140,
    borderWidth: 10,
    borderColor: COLORS.secondary,
    borderRadius: 20,
    transform: [{ rotate: '0deg' }],
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 12,
    // Forma de triángulo redondeado usando border
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    // clip triangular usando skew no es posible sin SVG
    // usamos la silueta visual del logo
  },
  triangleInner: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  nextText: {
    color: COLORS.secondary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: height * 0.15,
    left: width * 0.2,
    right: width * 0.2,
    height: 4,
    backgroundColor: '#2A2D3A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
});
