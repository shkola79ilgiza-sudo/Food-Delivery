import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getProfile as apiGetProfile } from '../api/adapter';
import { 
  getCurrentUser, 
  secureLogout, 
  isAuthenticated, 
  getUserRole,
  getDemoUser,
  setDemoUser,
  clearDemoUser 
} from '../utils/auth';

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
      try {
        // Сначала пытаемся получить пользователя через безопасные cookies
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          // Пользователь аутентифицирован через cookies
          setUser(currentUser);
          setLoading(false);
          return;
        }
        
        // Fallback: проверяем демо-пользователя (для случая, когда backend недоступен)
        const demoUser = getDemoUser();
        if (demoUser) {
          console.log('🔒 Используем демо-режим аутентификации');
          setUser(demoUser);
          setLoading(false);
          return;
        }
        
        // Никакая аутентификация не найдена
        setUser(null);
      } catch (error) {
        console.error('Ошибка проверки аутентификации:', error);
        
        // Fallback: проверяем демо-пользователя при ошибке
        const demoUser = getDemoUser();
        if (demoUser) {
          console.log('🔒 Fallback на демо-режим при ошибке');
          setUser(demoUser);
        } else {
          setUser(null);
        }
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
      const response = await apiRegister(userData);
      if (response.success) {
        const user = response.user || {
          id: userData.email,
          email: userData.email,
          role: userData.role?.toUpperCase() || 'CLIENT',
        };
        setUser(user);
        return { user };
      } else {
        throw new Error(response.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Логин
  const login = async (email, password) => {
    try {
      setError(null);
      
      // Определяем роль по email
      let role = 'client';
      if (email.includes('chef') || email.includes('cook')) {
        role = 'chef';
      } else if (email.includes('admin')) {
        role = 'admin';
      }
      
      const response = await apiLogin(email, password, role);
      
      if (response.success) {
        const user = response.user || {
          id: response.chefId || response.clientId || email,
          email: email,
          role: response.role?.toUpperCase() || role.toUpperCase(),
        };
        
        // Для демо-режима сохраняем в localStorage (fallback)
        if (response.token) {
          setDemoUser(user, response.token);
        }
        
        setUser(user);
        return { user };
      } else {
        throw new Error(response.error || 'Ошибка входа');
      }
    } catch (err) {
      const errorMessage = err.message || 'Произошла ошибка при входе в систему';
      setError(errorMessage);
      console.error('Login error:', err);
      throw new Error(errorMessage);
    }
  };

  // Логаут
  const logout = async () => {
    try {
      // Пытаемся безопасно выйти через API
      await secureLogout();
    } catch (error) {
      console.warn('Ошибка при безопасном выходе:', error);
    }
    
    // Очищаем демо-данные (fallback)
    clearDemoUser();
    
    // Очищаем старые данные из localStorage (для совместимости)
    const authKeys = [
      'authToken', 'role', 'chefId', 'clientId', 'userId',
      'chefEmail', 'chefPassword', 'clientEmail', 'clientPassword'
    ];
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    setUser(null);
    setError(null);
  };

  // Обновление профиля
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const response = await apiGetProfile();
      if (response.success) {
        setUser(response.user);
        return response.user;
      } else {
        throw new Error(response.error || 'Ошибка обновления профиля');
      }
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

