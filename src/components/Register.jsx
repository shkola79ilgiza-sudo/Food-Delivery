import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

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
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
    <div className="register-container">
      <div className="register-card">
        <h1>🍽️ Food Delivery</h1>
        <h2>Регистрация</h2>

        {error && (
          <div className="error-message">
            ❌ {error}
            {error.includes('уже зарегистрирован') && (
              <div style={{ marginTop: '10px' }}>
                <button 
                  type="button"
                  onClick={() => navigate('/login')}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Войти в систему
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Роль */}
          <div className="form-group">
            <label>Я хочу:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="CLIENT">Заказывать еду (Клиент)</option>
              <option value="CHEF">Готовить еду (Повар)</option>
            </select>
          </div>

          {/* Основные данные */}
          <div className="form-row">
            <div className="form-group">
              <label>Имя:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Иван"
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
                placeholder="Иванов"
                required
              />
            </div>
          </div>

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
            <label>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Минимум 6 символов"
              minLength="6"
              required
            />
          </div>

          {/* Поля для клиента */}
          {formData.role === 'CLIENT' && (
            <div className="form-group">
              <label>Адрес доставки:</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="ул. Пушкина, д. 10, кв. 5"
                required
              />
            </div>
          )}

          {/* Поля для повара */}
          {formData.role === 'CHEF' && (
            <>
              <div className="form-group">
                <label>О себе:</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Опытный повар с 10-летним стажем..."
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>Специализация:</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Итальянская кухня, паста, пицца"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="register-footer">
          <p>Уже есть аккаунт?</p>
          <button 
            className="login-link"
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
