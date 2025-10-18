import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import SimpleNavigation from './SimpleNavigation';
import registerPattern from '../assets/register-pattern.png';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    phone: '',
    address: '',
    photo: null,
    agreeToTerms: false,
    role: 'CHEF'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Необходимо согласиться с Условиями Сервиса');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        phone: formData.phone,
        address: formData.address,
        role: 'CHEF',
        photo: formData.photo
      };

      await register(userData);
      navigate('/chef/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      // Показываем конкретное сообщение об ошибке
      if (err.message === 'Email already exists') {
        setError('Этот email уже зарегистрирован. Попробуйте другой email или войдите в систему.');
      } else if (err.message.includes('password')) {
        setError('Пароль слишком простой. Используйте минимум 6 символов.');
      } else if (err.message.includes('email')) {
        setError('Некорректный email адрес.');
      } else {
        setError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="register-page-container"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url(${registerPattern})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100%',
        filter: 'contrast(1.2) brightness(0.8)'
      }}
    >
      {/* Упрощенная навигация */}
      <SimpleNavigation />

      {/* Основной контент */}
      <div className="register-content">
        {/* Форма регистрации */}
        <div className="register-form-section">
          <form onSubmit={handleSubmit}>
            {/* Логотип и заголовок - в верхнем центре формы */}
            <div className="register-header">
              <div className="logo-section">
                <span className="logo-icon">🍴</span>
                <h1 className="app-title">Food Delivery</h1>
              </div>
              <h2 className="page-title">Повар — Регистрация</h2>
            </div>
            {error && (
              <div className="error-message">
                ❌ {error}
                {error.includes('уже зарегистрирован') && (
                  <div className="error-login-button-container">
                    <button 
                      type="button"
                      onClick={() => navigate('/login')}
                      className="error-login-button"
                    >
                      Войти в систему
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="chef@test.com"
                  required
                />
              </div>

              <div className="form-group">
                <label>Пароль:</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="********"
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Повторите Пароль:</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Имя (под которым будет виден Повар):</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Введите ваше имя"
                  required
                />
              </div>

              <div className="form-group">
                <label>Телефон:</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 123-45-67"
                  required
                />
              </div>

              <div className="form-group">
                <label>Адрес (для логистики):</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Введите ваш адрес"
                  required
                />
              </div>

              <div className="form-group">
                <label>Выбрать фото:</label>
                <div className="file-upload-container">
                  <label className="file-upload-button">
                    Выберите
                    <input
                      type="file"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                      className="file-input-hidden"
                    />
                  </label>
                  <span className="file-status-text">
                    {formData.photo ? formData.photo.name : 'Файл не выбран'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    required
                  />
                  <span>Я согласен с <button type="button" className="terms-link-button">Условиями Сервиса</button></span>
                </label>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>

              <div className="register-footer">
                <p>Уже есть аккаунт?</p>
                <button 
                  className="login-link"
                  onClick={() => navigate('/login')}
                >
                  Войти
                </button>
              </div>
            </form>
        </div>
      </div>

      {/* Информационные карточки внизу */}
      <div className="register-info-cards">
        <div className="info-card">
          <div className="info-card-icon">⭐</div>
          <h3>ТОЛЬКО ДОСТОВЕРНЫЕ ОТЗЫВЫ</h3>
          <p>Покупатель сможет оставлять отзыв только после получения заказа. Хороший рейтинг привлечет ещё больше клиентов!</p>
        </div>
        <div className="info-card">
          <div className="info-card-icon">👥</div>
          <h3>ВСЕ КЛИЕНТЫ — В ОДНОМ МЕСТЕ</h3>
          <p>Переписки только с теми, кто хочет оформить заказ на твоё блюдо.</p>
        </div>
        <div className="info-card">
          <div className="info-card-icon">💰</div>
          <h3>ДОХОД И ГРАФИК ЗАВИСЯТ ОТ ТЕБЯ</h3>
          <p>Готовь заказы когда удобно, привлекай знакомых и получай новых клиентов от нас.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;