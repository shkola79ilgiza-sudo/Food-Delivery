import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'CLIENT',
    firstName: '',
    lastName: '',
    phone: '',
    // Для клиента
    address: '',
    // Для повара
    bio: '',
    specialization: '',
    agreeTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Подготавливаем данные в зависимости от роли
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
      };

      // Добавляем поля только если они заполнены
      if (formData.phone && formData.phone.trim()) {
        userData.phone = formData.phone;
      }

      if (formData.role === 'CLIENT' && formData.address && formData.address.trim()) {
        userData.address = formData.address;
      } else if (formData.role === 'CHEF') {
        if (formData.bio && formData.bio.trim()) userData.bio = formData.bio;
        if (formData.specialization && formData.specialization.trim()) userData.specialization = formData.specialization;
      }

      const data = await register(userData);
      
      // Перенаправляем в зависимости от роли
      if (data.user.role === 'CHEF') {
        navigate('/chef');
      } else if (data.user.role === 'CLIENT') {
        navigate('/client');
      }
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
        backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/register-pattern.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0
      }}
    >
      {/* Основной контент */}
      <div className="register-content">
        {/* Форма регистрации */}
        <div className="register-form-section">
          <form onSubmit={handleSubmit}>
            <div className="register-header">
              <div className="logo-section">
                <span className="logo-icon">🍽️</span>
                <h1 className="app-title">Food Delivery</h1>
              </div>
              <h2 className="page-title">Повар - Регистрация</h2>
            </div>

            {error && (
              <div className="error-message">
                ❌ {error}
                {error.includes('уже зарегистрирован') && (
                  <div className="error-login-button-container">
                    <button 
                      className="error-login-button"
                      onClick={() => navigate('/client/login')}
                    >
                      Войти
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
                placeholder="example@mail.com"
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
                placeholder="Минимум 6 символов"
                required
              />
            </div>

            <div className="form-group">
              <label>Роль:</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="CLIENT">Клиент</option>
                <option value="CHEF">Повар</option>
              </select>
            </div>

            <div className="form-group">
              <label>Имя:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Ваше имя"
                required
              />
            </div>

            <div className="form-group">
              <label>Фамилия:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Ваша фамилия"
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
              />
            </div>

            {formData.role === 'CLIENT' && (
              <div className="form-group">
                <label>Адрес:</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Адрес доставки"
                />
              </div>
            )}

            {formData.role === 'CHEF' && (
              <>
                <div className="form-group">
                  <label>Биография:</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Расскажите о себе и своем опыте"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Специализация:</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    placeholder="Например: Итальянская кухня, Суши, Десерты"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  required
                />
                Я согласен с <button 
                  type="button" 
                  className="terms-link-button"
                  onClick={() => alert('Условия использования')}
                >
                  условиями использования
                </button>
              </label>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="register-footer">
            <p>Уже есть аккаунт?</p>
            <button 
              className="login-link"
              onClick={() => navigate('/client/login')}
            >
              Войти
            </button>
          </div>
        </div>
      </div>

      {/* Информационные карточки */}
      <div className="register-info-cards">
        <div className="info-card">
          <div className="info-card-icon">⭐</div>
          <h3>Качественные блюда</h3>
          <p>Только свежие ингредиенты и проверенные рецепты от профессиональных поваров</p>
        </div>
        <div className="info-card">
          <div className="info-card-icon">👥</div>
          <h3>Быстрая доставка</h3>
          <p>Доставляем заказы в течение 30-60 минут в любую точку города</p>
        </div>
        <div className="info-card">
          <div className="info-card-icon">💰</div>
          <h3>Доступные цены</h3>
          <p>Честные цены без скрытых наценок и комиссий</p>
        </div>
      </div>
    </div>
  );
};

export default Register;