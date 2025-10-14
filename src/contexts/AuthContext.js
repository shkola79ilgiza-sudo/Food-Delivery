import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, getToken, removeToken } from '../api/backend';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (err) {
        console.error('Auth check failed:', err);
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Регистрация
  const register = async (userData) => {
    try {
      setError(null);
      const data = await authAPI.register(userData);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Логин
  const login = async (email, password) => {
    try {
      setError(null);
      const data = await authAPI.login(email, password);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Логаут
  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  // Обновление профиля
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isClient: user?.role === 'CLIENT',
    isChef: user?.role === 'CHEF',
    isAdmin: user?.role === 'ADMIN',
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

