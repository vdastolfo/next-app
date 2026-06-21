import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar la app, verificar si hay sesión guardada
  useEffect(() => {
    checkStoredSession();
  }, []);

  const checkStoredSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (e) {
      console.log('Error al leer sesión guardada:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, preAuthData = null) => {
    let token, userData;

    if (preAuthData) {
      ({ token, ...userData } = preAuthData);
    } else {
      const response = await authAPI.login(email, password);
      ({ token, ...userData } = response.data);
    }

    try {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (e) {
      console.log('AsyncStorage no disponible:', e);
    }

    setUser(userData);
    return userData;
  };

  const updateUser = async (updatedFields) => {
    const updated = { ...user, ...updatedFields };
    try {
      await AsyncStorage.setItem('user', JSON.stringify(updated));
    } catch (e) {}
    setUser(updated);
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (e) {
      console.log('AsyncStorage no disponible:', e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
