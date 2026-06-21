import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambiá esta IP por la de tu computadora cuando pruebes en el celular
// Para el emulador/Expo Go en la misma red: usá tu IP local (ej: 192.168.1.x)
// Para web/emulador Android: http://10.0.2.2:8080
const BASE_URL = 'http://10.0.2.2:8080/api';
export const MEDIA_URL = 'http://10.0.2.2:8080';

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
  register: (data) =>
    api.post('/auth/register', data),
  completeRegistration: (data) =>
    api.post('/auth/complete-registration', data),
  verify: (email, codigo) =>
    api.post('/auth/verify', { email, codigo }),
  resendCode: (email) =>
    api.post('/auth/resend-code', { email }),
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  verifyResetCode: (email, codigo) =>
    api.post('/auth/verify-reset-code', { email, codigo }),
  resetPassword: (email, codigo, password) =>
    api.post('/auth/reset-password', { email, codigo, password }),
};

// ── SUBASTAS ──────────────────────────────────────────────────────────────────
export const auctionsAPI = {
  getAuctions: () => api.get('/auctions'),
  getAuctionItems: (subastaId) => api.get(`/auctions/${subastaId}/items`),
  list: () => api.get('/auctions/items'),
  search: (q, sort, category) =>
    api.get('/auctions/search', { params: { q, sort, category } }),
  getItem: (itemId) => api.get(`/auctions/items/${itemId}`),
  getBidPreview: (itemId, amount) =>
    api.get(`/auctions/items/${itemId}/bid-preview`, { params: { amount } }),
  placeBid: (itemId, importe, medioDePagoId) =>
    api.post(`/auctions/items/${itemId}/bids`, { importe, medioDePagoId }),
  setActiveItem: (subastaId, itemId) =>
    api.put(`/auctions/${subastaId}/active-item`, { itemId }),
};

// ── ACTIVIDAD ─────────────────────────────────────────────────────────────────
export const activityAPI = {
  getBidding: () => api.get('/user/activity/bidding'),
  getWon: () => api.get('/user/activity/won'),
  payWon: (pujaId, medioDePagoId) => api.post(`/user/activity/won/${pujaId}/pay`, { medioDePagoId }),
  getParticipaciones: () => api.get('/user/activity/participaciones'),
};

// ── MÉTODOS DE PAGO ───────────────────────────────────────────────────────────
export const paymentAPI = {
  list: () => api.get('/user/payment-methods'),
  addCard: (data) => api.post('/user/payment-methods/card', data),
  addBankAccount: (data) => api.post('/user/payment-methods/bank-account', data),
  addCheck: (data) => api.post('/user/payment-methods/check', data),
  remove: (id) => api.delete(`/user/payment-methods/${id}`),
};

export const profileAPI = {
  getPhoto: () => api.get('/user/profile/photo'),
  updatePhoto: (foto) => api.put('/user/profile/photo', { foto }, { timeout: 30000 }),
};

export const consignacionesAPI = {
  crear: (data) => api.post('/user/consignaciones', data, { timeout: 60000 }),
  listar: () => api.get('/user/consignaciones'),
  detalle: (id) => api.get(`/user/consignaciones/${id}`, { timeout: 30000 }),
  confirmar: (id, acepta) => api.post(`/user/consignaciones/${id}/confirmar`, { acepta }),
};

export default api;
