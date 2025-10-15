import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getProfile as apiGetProfile } from '../api/adapter';

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
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('chefId') || localStorage.getItem('clientId');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Для mock режима восстанавливаем пользователя из localStorage
        const userData = {
          id: userId,
          role: role?.toUpperCase() || 'CLIENT',
          email: localStorage.getItem('chefEmail') || localStorage.getItem('userEmail'),
        };
        setUser(userData);
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
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
        
        // Сохраняем данные в localStorage для роутинга
        if (response.token) {
          localStorage.setItem('authToken', response.token);
        }
        if (user.role === 'CHEF') {
          localStorage.setItem('chefId', user.id);
          localStorage.setItem('role', 'chef');
        } else if (user.role === 'CLIENT') {
          localStorage.setItem('userId', user.id);
          localStorage.setItem('role', 'client');
        } else if (user.role === 'ADMIN') {
          localStorage.setItem('userId', user.id);
          localStorage.setItem('role', 'admin');
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
  const logout = () => {
    // Очищаем все данные аутентификации из localStorage
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

