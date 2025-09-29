import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    commissionRate: 10,
    minOrderAmount: 500,
    maxOrderAmount: 10000,
    deliveryRadius: 10,
    workingHours: {
      start: '09:00',
      end: '22:00'
    },
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    system: {
      maintenanceMode: false,
      autoApproveChefs: false,
      requirePhotoVerification: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    loadSettings();
  }, [navigate]);

  const loadSettings = () => {
    setLoading(true);
    
    // Загружаем настройки из localStorage
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Валидация настроек
      if (settings.commissionRate < 0 || settings.commissionRate > 50) {
        setMessage('Комиссия должна быть от 0 до 50%');
        return;
      }
      
      if (settings.minOrderAmount < 0) {
        setMessage('Минимальная сумма заказа не может быть отрицательной');
        return;
      }
      
      if (settings.maxOrderAmount <= settings.minOrderAmount) {
        setMessage('Максимальная сумма заказа должна быть больше минимальной');
        return;
      }
      
      if (settings.deliveryRadius < 1 || settings.deliveryRadius > 50) {
        setMessage('Радиус доставки должен быть от 1 до 50 км');
        return;
      }
      
      // Сохраняем настройки
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      setMessage('Настройки успешно сохранены!');
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      setMessage('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const resetToDefaults = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?')) {
      setSettings({
        commissionRate: 10,
        minOrderAmount: 500,
        maxOrderAmount: 10000,
        deliveryRadius: 10,
        workingHours: {
          start: '09:00',
          end: '22:00'
        },
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        system: {
          maintenanceMode: false,
          autoApproveChefs: false,
          requirePhotoVerification: true
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="loading">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="page-header">
        <h1>⚙️ Настройки системы</h1>
        <div className="header-actions">
          <button onClick={resetToDefaults} className="reset-button">
            🔄 Сбросить к умолчанию
          </button>
          <button 
            onClick={saveSettings} 
            className="save-button"
            disabled={saving}
          >
            {saving ? '💾 Сохранение...' : '💾 Сохранить'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Ошибка') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="settings-content">
        {/* Финансовые настройки */}
        <div className="settings-section">
          <h2>💰 Финансовые настройки</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="commissionRate">
                Комиссия платформы (%)
              </label>
              <input
                id="commissionRate"
                type="number"
                min="0"
                max="50"
                step="0.1"
                value={settings.commissionRate}
                onChange={(e) => handleInputChange('commissionRate', 'commissionRate', parseFloat(e.target.value) || 0)}
              />
              <small>Процент от суммы заказа, который получает платформа</small>
            </div>

            <div className="setting-item">
              <label htmlFor="minOrderAmount">
                Минимальная сумма заказа (₽)
              </label>
              <input
                id="minOrderAmount"
                type="number"
                min="0"
                step="50"
                value={settings.minOrderAmount}
                onChange={(e) => handleInputChange('minOrderAmount', 'minOrderAmount', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="setting-item">
              <label htmlFor="maxOrderAmount">
                Максимальная сумма заказа (₽)
              </label>
              <input
                id="maxOrderAmount"
                type="number"
                min="0"
                step="100"
                value={settings.maxOrderAmount}
                onChange={(e) => handleInputChange('maxOrderAmount', 'maxOrderAmount', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        {/* Настройки доставки */}
        <div className="settings-section">
          <h2>🚚 Настройки доставки</h2>
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="deliveryRadius">
                Радиус доставки (км)
              </label>
              <input
                id="deliveryRadius"
                type="number"
                min="1"
                max="50"
                value={settings.deliveryRadius}
                onChange={(e) => handleInputChange('deliveryRadius', 'deliveryRadius', parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="setting-item">
              <label htmlFor="workingHoursStart">
                Начало работы
              </label>
              <input
                id="workingHoursStart"
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => handleNestedInputChange('workingHours', 'workingHours', 'start', e.target.value)}
              />
            </div>

            <div className="setting-item">
              <label htmlFor="workingHoursEnd">
                Конец работы
              </label>
              <input
                id="workingHoursEnd"
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => handleNestedInputChange('workingHours', 'workingHours', 'end', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Настройки уведомлений */}
        <div className="settings-section">
          <h2>🔔 Настройки уведомлений</h2>
          <div className="settings-grid">
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => handleNestedInputChange('notifications', 'notifications', 'email', e.target.checked)}
                />
                Email уведомления
              </label>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => handleNestedInputChange('notifications', 'notifications', 'sms', e.target.checked)}
                />
                SMS уведомления
              </label>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => handleNestedInputChange('notifications', 'notifications', 'push', e.target.checked)}
                />
                Push уведомления
              </label>
            </div>
          </div>
        </div>

        {/* Системные настройки */}
        <div className="settings-section">
          <h2>🔧 Системные настройки</h2>
          <div className="settings-grid">
            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.system.maintenanceMode}
                  onChange={(e) => handleNestedInputChange('system', 'system', 'maintenanceMode', e.target.checked)}
                />
                Режим технического обслуживания
              </label>
              <small>При включении сайт будет недоступен для пользователей</small>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.system.autoApproveChefs}
                  onChange={(e) => handleNestedInputChange('system', 'system', 'autoApproveChefs', e.target.checked)}
                />
                Автоматическое одобрение поваров
              </label>
              <small>Повары будут автоматически одобрены при регистрации</small>
            </div>

            <div className="setting-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={settings.system.requirePhotoVerification}
                  onChange={(e) => handleNestedInputChange('system', 'system', 'requirePhotoVerification', e.target.checked)}
                />
                Требовать верификацию фото
              </label>
              <small>Повары должны загружать фото для верификации</small>
            </div>
          </div>
        </div>

        {/* Дополнительные действия */}
        <div className="settings-section">
          <h2>🗑️ Дополнительные действия</h2>
          <div className="danger-actions">
            <button 
              onClick={() => {
                if (window.confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить!')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="danger-button"
            >
              🗑️ Очистить все данные
            </button>
            
            <button 
              onClick={() => {
                if (window.confirm('Вы уверены, что хотите экспортировать все данные?')) {
                  const data = {
                    users: JSON.parse(localStorage.getItem('allUsers') || '[]'),
                    orders: JSON.parse(localStorage.getItem('clientOrders') || '[]'),
                    settings: settings
                  };
                  
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
              className="export-button"
            >
              📤 Экспорт данных
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
