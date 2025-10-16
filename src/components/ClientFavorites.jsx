import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const ClientFavorites = ({ onClose }) => {
  const { t } = useLanguage();
  const { showSuccess } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({ dishes: [], chefs: [] });
  const [activeTab, setActiveTab] = useState('dishes');

  // Загрузка избранного
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '{"dishes":[],"chefs":[]}');
    setFavorites(savedFavorites);
  }, []);

  // Удалить из избранного
  const removeFavorite = (id, type) => {
    const updated = {
      ...favorites,
      [type]: favorites[type].filter(item => item.id !== id)
    };
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    showSuccess('Удалено из избранного');
  };

  // Добавить в корзину
  const addToCart = (dish) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === dish.id);

    const updatedCart = existingItem
      ? cart.map(item => item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...dish, quantity: 1 }];

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cartChanged'));
    showSuccess(`"${dish.name}" добавлено в корзину!`);
  };

  // Перейти к повару
  const goToChef = (chefId) => {
    navigate(`/chef/${chefId}/menu`);
    onClose();
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
          alignItems: 'center',
          marginBottom: '20px'
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
            ⭐ Избранное
          </h2>
          <div style={{ width: '40px' }} />
        </div>

        {/* Табы */}
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setActiveTab('dishes')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'dishes'
                ? 'linear-gradient(135deg, #2D5016, #4A7C59)'
                : '#f5f5f5',
              color: activeTab === 'dishes' ? 'white' : '#666',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            🍽️ Блюда ({favorites.dishes.length})
          </button>
          <button
            onClick={() => setActiveTab('chefs')}
            style={{
              flex: 1,
              padding: '12px',
              background: activeTab === 'chefs'
                ? 'linear-gradient(135deg, #2D5016, #4A7C59)'
                : '#f5f5f5',
              color: activeTab === 'chefs' ? 'white' : '#666',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            👨‍🍳 Повара ({favorites.chefs.length})
          </button>
        </div>
      </div>

      {/* Контент */}
      <div style={{ padding: '20px' }}>
        {activeTab === 'dishes' ? (
          // Избранные блюда
          favorites.dishes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍽️</div>
              <div style={{ fontSize: '20px', marginBottom: '10px' }}>
                Нет избранных блюд
              </div>
              <div style={{ fontSize: '14px' }}>
                Добавляйте любимые блюда, чтобы быстро их находить
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {favorites.dishes.map((dish) => (
                <div
                  key={dish.id}
                  style={{
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Изображение */}
                  {dish.image && (
                    <div style={{
                      height: '180px',
                      background: `url(${dish.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                  )}

                  {/* Контент */}
                  <div style={{ padding: '15px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '10px'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        color: '#2D5016'
                      }}>
                        {dish.name}
                      </h3>
                      <button
                        onClick={() => removeFavorite(dish.id, 'dishes')}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '24px',
                          cursor: 'pointer',
                          color: '#ff4444'
                        }}
                        title="Удалить из избранного"
                      >
                        💔
                      </button>
                    </div>

                    <p style={{
                      margin: '0 0 10px 0',
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.4'
                    }}>
                      {dish.description}
                    </p>

                    <div style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#4CAF50',
                      marginBottom: '15px'
                    }}>
                      {dish.price} ₽
                    </div>

                    <button
                      onClick={() => addToCart(dish)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      🛒 В корзину
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Избранные повара
          favorites.chefs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>👨‍🍳</div>
              <div style={{ fontSize: '20px', marginBottom: '10px' }}>
                Нет избранных поваров
              </div>
              <div style={{ fontSize: '14px' }}>
                Добавляйте любимых поваров для быстрого доступа
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {favorites.chefs.map((chef) => (
                <div
                  key={chef.id}
                  style={{
                    background: 'white',
                    border: '2px solid #e0e0e0',
                    borderRadius: '15px',
                    padding: '20px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        margin: '0 0 5px 0',
                        fontSize: '20px',
                        color: '#2D5016'
                      }}>
                        {chef.name}
                      </h3>
                      <div style={{
                        fontSize: '14px',
                        color: '#666',
                        marginBottom: '10px'
                      }}>
                        {chef.specialization || 'Повар'}
                      </div>
                      {chef.rating && (
                        <div style={{
                          fontSize: '16px',
                          color: '#FFA500'
                        }}>
                          ⭐ {chef.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeFavorite(chef.id, 'chefs')}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#ff4444'
                      }}
                      title="Удалить из избранного"
                    >
                      💔
                    </button>
                  </div>

                  <button
                    onClick={() => goToChef(chef.id)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #2D5016, #4A7C59)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                    }}
                  >
                    👨‍🍳 Перейти к меню
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ClientFavorites;

