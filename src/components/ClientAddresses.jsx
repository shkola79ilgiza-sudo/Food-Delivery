import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const ClientAddresses = ({ onClose, onSelectAddress }) => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    phone: '',
    comment: '',
    isDefault: false
  });

  // Загрузка адресов
  useEffect(() => {
    const savedAddresses = JSON.parse(localStorage.getItem('clientAddresses') || '[]');
    setAddresses(savedAddresses);
  }, []);

  // Получить текущую геолокацию
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError('Геолокация не поддерживается вашим браузером');
      return;
    }

    showSuccess('Определяем ваше местоположение...');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Используем Nominatim (OpenStreetMap) для reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ru`
          );
          const data = await response.json();
          
          if (data.address) {
            setFormData({
              ...formData,
              city: data.address.city || data.address.town || data.address.village || '',
              street: data.address.road || '',
              apartment: data.address.house_number || ''
            });
            showSuccess('Адрес определен!');
          }
        } catch (error) {
          showError('Не удалось определить адрес');
        }
      },
      (error) => {
        showError('Не удалось получить местоположение');
      }
    );
  };

  // Сохранить адрес
  const saveAddress = () => {
    if (!formData.street || !formData.city) {
      showError('Заполните город и улицу');
      return;
    }

    const newAddress = {
      id: editingId || `address-${Date.now()}`,
      ...formData,
      createdAt: editingId ? addresses.find(a => a.id === editingId)?.createdAt : new Date().toISOString()
    };

    let updatedAddresses;
    if (editingId) {
      updatedAddresses = addresses.map(a => a.id === editingId ? newAddress : a);
      showSuccess('Адрес обновлен!');
    } else {
      updatedAddresses = [...addresses, newAddress];
      showSuccess('Адрес добавлен!');
    }

    // Если это адрес по умолчанию, снимаем флаг с других
    if (formData.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({
        ...a,
        isDefault: a.id === newAddress.id
      }));
    }

    setAddresses(updatedAddresses);
    localStorage.setItem('clientAddresses', JSON.stringify(updatedAddresses));
    
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      street: '',
      city: '',
      apartment: '',
      entrance: '',
      floor: '',
      intercom: '',
      phone: '',
      comment: '',
      isDefault: false
    });
  };

  // Удалить адрес
  const deleteAddress = (id) => {
    if (!window.confirm('Удалить этот адрес?')) return;
    
    const updatedAddresses = addresses.filter(a => a.id !== id);
    setAddresses(updatedAddresses);
    localStorage.setItem('clientAddresses', JSON.stringify(updatedAddresses));
    showSuccess('Адрес удален');
  };

  // Установить адрес по умолчанию
  const setAsDefault = (id) => {
    const updatedAddresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updatedAddresses);
    localStorage.setItem('clientAddresses', JSON.stringify(updatedAddresses));
    showSuccess('Адрес установлен по умолчанию');
  };

  // Редактировать адрес
  const editAddress = (address) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'white',
      zIndex: 9999,
      overflow: 'auto'
    }}>
      {/* Заголовок */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: 'white',
        borderBottom: '2px solid #e0e0e0',
        padding: '20px',
        zIndex: 10
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#2D5016'
            }}
          >
            ← Назад
          </button>
          <h2 style={{ margin: 0, fontSize: '24px', color: '#2D5016' }}>
            🏠 Мои адреса
          </h2>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({
                name: '',
                street: '',
                city: '',
                apartment: '',
                entrance: '',
                floor: '',
                intercom: '',
                phone: '',
                comment: '',
                isDefault: false
              });
            }}
            style={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            + Добавить
          </button>
        </div>
      </div>

      {/* Контент */}
      <div style={{ padding: '20px' }}>
        {showForm ? (
          // Форма добавления/редактирования
          <div style={{
            background: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '15px',
            padding: '25px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0',
              fontSize: '20px',
              color: '#2D5016'
            }}>
              {editingId ? 'Редактировать адрес' : 'Новый адрес'}
            </h3>

            {/* Кнопка геолокации */}
            <button
              onClick={getCurrentLocation}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              📍 Определить мое местоположение
            </button>

            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {/* Название */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                  Название (необязательно)
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Дом, Работа, У мамы..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Город */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                  Город *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="Казань"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Улица */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                  Улица *
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({...formData, street: e.target.value})}
                  placeholder="ул. Баумана"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Дом/Подъезд/Этаж */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                    Дом/Квартира
                  </label>
                  <input
                    type="text"
                    value={formData.apartment}
                    onChange={(e) => setFormData({...formData, apartment: e.target.value})}
                    placeholder="д. 10, кв. 25"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                    Подъезд
                  </label>
                  <input
                    type="text"
                    value={formData.entrance}
                    onChange={(e) => setFormData({...formData, entrance: e.target.value})}
                    placeholder="1"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                    Этаж
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    placeholder="5"
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Домофон */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                  Код домофона
                </label>
                <input
                  type="text"
                  value={formData.intercom}
                  onChange={(e) => setFormData({...formData, intercom: e.target.value})}
                  placeholder="123К"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Телефон */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                  Телефон
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+7 (900) 123-45-67"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Комментарий */}
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2D5016' }}>
                  Комментарий для курьера
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({...formData, comment: e.target.value})}
                  placeholder="Позвоните за 5 минут..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #e0e0e0',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* По умолчанию */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label style={{ fontWeight: 'bold', color: '#2D5016', cursor: 'pointer' }}>
                  Сделать адресом по умолчанию
                </label>
              </div>
            </div>

            {/* Кнопки */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                style={{
                  padding: '12px',
                  background: '#f5f5f5',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Отмена
              </button>
              <button
                onClick={saveAddress}
                style={{
                  padding: '12px',
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        ) : (
          // Список адресов
          addresses.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏠</div>
              <div style={{ fontSize: '20px', marginBottom: '10px' }}>
                Нет сохраненных адресов
              </div>
              <div style={{ fontSize: '14px', marginBottom: '20px' }}>
                Добавьте адрес доставки для быстрого оформления заказов
              </div>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                + Добавить первый адрес
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '15px',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              {addresses.map((address) => (
                <div
                  key={address.id}
                  style={{
                    background: 'white',
                    border: address.isDefault ? '3px solid #4CAF50' : '2px solid #e0e0e0',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {address.isDefault && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                      color: 'white',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓ По умолчанию
                    </div>
                  )}

                  <div style={{ marginBottom: '15px' }}>
                    {address.name && (
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#2D5016',
                        marginBottom: '8px'
                      }}>
                        {address.name}
                      </div>
                    )}
                    <div style={{ fontSize: '16px', color: '#333', marginBottom: '5px' }}>
                      {address.city}, {address.street}
                      {address.apartment && `, ${address.apartment}`}
                    </div>
                    {(address.entrance || address.floor || address.intercom) && (
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                        {address.entrance && `Подъезд ${address.entrance}`}
                        {address.floor && `, этаж ${address.floor}`}
                        {address.intercom && `, домофон ${address.intercom}`}
                      </div>
                    )}
                    {address.phone && (
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                        📞 {address.phone}
                      </div>
                    )}
                    {address.comment && (
                      <div style={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
                        💬 {address.comment}
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: '10px'
                  }}>
                    {!address.isDefault && (
                      <button
                        onClick={() => setAsDefault(address.id)}
                        style={{
                          padding: '10px',
                          background: '#f5f5f5',
                          color: '#2D5016',
                          border: '2px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ По умолчанию
                      </button>
                    )}
                    <button
                      onClick={() => editAddress(address)}
                      style={{
                        padding: '10px',
                        background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✏️ Редактировать
                    </button>
                    {onSelectAddress && (
                      <button
                        onClick={() => {
                          onSelectAddress(address);
                          onClose();
                        }}
                        style={{
                          padding: '10px',
                          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Выбрать
                      </button>
                    )}
                    <button
                      onClick={() => deleteAddress(address.id)}
                      style={{
                        padding: '10px',
                        background: 'linear-gradient(135deg, #f44336, #d32f2f)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ClientAddresses;

