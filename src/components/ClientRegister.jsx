import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useLanguage } from '../contexts/LanguageContext';

const ClientRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (token && role === 'client') {
      navigate('/client/menu');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Проверка имени
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    // Проверка email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
    }
    
    // Проверка подтверждения пароля
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    // Проверка телефона
    if (!formData.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    // Проверка адреса
    if (!formData.address.trim()) {
      newErrors.address = 'Адрес обязателен';
    } else if (formData.address.length < 5) {
      newErrors.address = 'Адрес должен содержать минимум 5 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const response = await register({
        ...formData,
        role: 'client'
      });
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/client/login');
        }, 2000);
      } else {
        setErrors({ general: response.message || 'Ошибка регистрации' });
      }
    } catch (err) {
      setErrors({ general: 'Ошибка сервера. Пожалуйста, попробуйте позже.' });
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="client-register-container" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Overlay для лучшей читаемости */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 1
      }}></div>
      
      <div className="client-register-form-container" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        zIndex: 2
      }}>
        <h2>{t.register.clientRegister}</h2>
        
        {success ? (
          <div className="success-message">
            <p>Регистрация успешна! Перенаправление на страницу входа...</p>
          </div>
        ) : (
          <>
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <form onSubmit={handleSubmit} className="client-register-form">
              <div className="form-group">
                <label htmlFor="name">{t.register.name}</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.register.name}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">{t.register.email}</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.register.email}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">{t.register.password}</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t.register.password}
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">{t.register.confirmPassword}</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t.register.confirmPassword}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">{t.register.phone}</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.register.phone}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="address">{t.register.address}</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder={t.register.address}
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <span className="error-text">{errors.address}</span>}
              </div>
              
              <button type="submit" className="register-button" disabled={loading}>
                {loading ? t.register.submit + '...' : t.register.submit}
              </button>
            </form>
            
            <div className="register-links">
              <p>{t.register.hasAccount} <Link to="/client/login">{t.register.loginLink}</Link></p>
              <p><Link to="/register">{t.register.registerForChefs}</Link></p>
            </div>
          </>
        )}
      </div>
      
      <div className="client-benefits" style={{
        background: 'rgba(0, 0, 0, 0.30)',
        borderRadius: '15px',
        padding: '30px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        zIndex: 2
      }}>
        <h3 style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '25px',
          textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)'
        }}>Сделано с любовью, местными шефами</h3>
        <div className="benefits-cards">
          <div className="benefit-card" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)'
          }}>
            <h4 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}>Здоровая, аутентичная еда</h4>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              lineHeight: '1.5',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}>Откройте для себя 1000 питательных домашних блюд</p>
          </div>
          <div className="benefit-card" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)'
          }}>
            <h4 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}>Изготовлено на месте из свежих, качественных ингредиентов</h4>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              lineHeight: '1.5',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}></p>
          </div>
          <div className="benefit-card" style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '15px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(5px)'
          }}>
            <h4 style={{
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '10px',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}>Более высокое качество за меньшие деньги</h4>
            <p style={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: '14px',
              lineHeight: '1.5',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)'
            }}>Свежеприготовленные, охлажденные и доставленные к вашему порогу</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientRegister;