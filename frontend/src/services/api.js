import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiá esta IP por la de tu computadora cuando pruebes en el celular
// Para el emulador/Expo Go en la misma red: usá tu IP local (ej: 192.168.1.x)
// Para web/emulador Android: http://10.0.2.2:8080
const BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega el token JWT a cada request automáticamente
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // AsyncStorage no disponible — continuar sin token
  }
  return config;
});

// Interceptor: manejo global de errores de red
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({
        message: 'Sin conexión a internet. Verificá tu red.',
        isNetworkError: true,
      });
    }
    return Promise.reject(error);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// ── SUBASTAS ──────────────────────────────────────────────────────────────────
export const auctionsAPI = {
  list: () => api.get('/auctions'),
  search: (q, sort, category) =>
    api.get('/auctions/search', { params: { q, sort, category } }),
  getItem: (itemId) => api.get(`/auctions/items/${itemId}`),
  getBidPreview: (itemId, amount) =>
    api.get(`/auctions/items/${itemId}/bid-preview`, { params: { amount } }),
  placeBid: (itemId, importe, medioDePagoId) =>
    api.post(`/auctions/items/${itemId}/bids`, { importe, medioDePagoId }),
};

// ── ACTIVIDAD ─────────────────────────────────────────────────────────────────
export const activityAPI = {
  getBidding: () => api.get('/user/activity/bidding'),
  getWon: () => api.get('/user/activity/won'),
};

// ── MÉTODOS DE PAGO ───────────────────────────────────────────────────────────
export const paymentAPI = {
  list: () => api.get('/user/payment-methods'),
  addCard: (data) => api.post('/user/payment-methods/card', data),
  addBankAccount: (data) => api.post('/user/payment-methods/bank-account', data),
  addCheck: (data) => api.post('/user/payment-methods/check', data),
  remove: (id) => api.delete(`/user/payment-methods/${id}`),
};

export default api;
