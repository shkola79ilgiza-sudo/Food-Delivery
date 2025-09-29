import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка, если уже авторизован как админ
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (token && role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Демо-авторизация для админа
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('authToken', `admin-token-${Date.now()}`);
      localStorage.setItem('role', 'admin');
      localStorage.setItem('adminUser', JSON.stringify({
        username: 'admin',
        name: 'Администратор',
        email: 'admin@fooddelivery.com'
      }));
      navigate('/admin/dashboard');
    } else {
      setError('Неверные учетные данные администратора');
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <div className="admin-login-header">
          <h1>🔐 Админ-панель</h1>
          <p>Вход в систему управления</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form-content">
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="admin"
              required
              className={error ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="admin123"
              required
              className={error ? 'error' : ''}
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти в админ-панель'}
          </button>
        </form>

        <div className="admin-login-demo">
          <h3>Демо-доступ:</h3>
          <p><strong>Логин:</strong> admin</p>
          <p><strong>Пароль:</strong> admin123</p>
        </div>

        <div className="admin-login-footer">
          <a href="/" className="back-to-site">← Вернуться на сайт</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
