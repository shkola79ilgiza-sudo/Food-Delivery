import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ClientProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
      return;
    }

    // Загрузка данных профиля
    const clientData = localStorage.getItem('clientData');
    if (clientData) {
      try {
        const parsedData = JSON.parse(clientData);
        setProfile(parsedData);
      } catch (err) {
        console.error('Error parsing client data:', err);
      }
    }
    setLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
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
    
    if (!profile.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (profile.name.length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = 'Введите корректный email';
    }
    
    if (!profile.phone.trim()) {
      newErrors.phone = 'Телефон обязателен';
    } else if (!/^\+?[0-9]{10,15}$/.test(profile.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    if (!profile.address.trim()) {
      newErrors.address = 'Адрес обязателен';
    } else if (profile.address.length < 5) {
      newErrors.address = 'Адрес должен содержать минимум 5 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    setErrors({});
    
    try {
      // Сохраняем обновленные данные
      localStorage.setItem('clientData', JSON.stringify(profile));
      
      setSuccess('Профиль успешно обновлен!');
      setIsEditing(false);
      
      // Убираем сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setErrors({ general: 'Ошибка при сохранении профиля' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Восстанавливаем исходные данные
    const clientData = localStorage.getItem('clientData');
    if (clientData) {
      try {
        const parsedData = JSON.parse(clientData);
        setProfile(parsedData);
      } catch (err) {
        console.error('Error parsing client data:', err);
      }
    }
    setIsEditing(false);
    setErrors({});
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('role');
    localStorage.removeItem('cart');
    localStorage.removeItem('appliedPromo');
    navigate('/client/login');
  };

  if (loading) {
    return (
      <div className="client-profile-container">
        <div className="loading">Загрузка профиля...</div>
      </div>
    );
  }

  return (
    <div className="client-profile-container">
      <header className="profile-header">
        <h1>Мой профиль</h1>
        <div className="profile-actions">
          <Link to="/client/menu" className="back-to-menu">← Вернуться в меню</Link>
        </div>
      </header>

      <div className="profile-content">
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {errors.general && (
          <div className="error-message">
            {errors.general}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-header-section">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="profile-info">
              <h2>{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
            </div>
            <div className="profile-actions-section">
              {!isEditing ? (
                <button 
                  className="edit-profile-button"
                  onClick={() => setIsEditing(true)}
                >
                  Редактировать
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-button"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-details">
            <h3>Личная информация</h3>
            
            <div className="form-group">
              <label htmlFor="name">Имя</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Адрес доставки</label>
              <textarea
                id="address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={errors.address ? 'error' : ''}
                rows={3}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>


          <div className="profile-actions-bottom">
            <Link to="/client/orders" className="view-orders-button">
              Мои заказы
            </Link>
            <button 
              className="logout-button"
              onClick={handleLogout}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;