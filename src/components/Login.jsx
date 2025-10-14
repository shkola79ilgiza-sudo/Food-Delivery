import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const data = await login(formData.email, formData.password);
      
      // Перенаправляем в зависимости от роли
      if (data.user.role === 'CHEF') {
        navigate('/chef');
      } else if (data.user.role === 'CLIENT') {
        navigate('/client');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>🍽️ Food Delivery</h1>
        <h2>Вход в систему</h2>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
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
              placeholder="Введите пароль"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="login-footer">
          <p>Нет аккаунта?</p>
          <button 
            className="register-link"
            onClick={() => navigate('/register')}
          >
            Зарегистрироваться
          </button>
        </div>

        <div className="test-accounts">
          <h3>Тестовые аккаунты:</h3>
          <div className="test-account">
            <strong>Клиент:</strong>
            <br />
            Email: client@test.com
            <br />
            Пароль: password123
          </div>
          <div className="test-account">
            <strong>Повар:</strong>
            <br />
            Email: chef@test.com
            <br />
            Пароль: password123
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
