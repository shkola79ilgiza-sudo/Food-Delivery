import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const PromoCodeSystem = ({ onPromoApplied, cartTotal }) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availablePromos, setAvailablePromos] = useState([]);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Моковые промокоды
  const mockPromoCodes = [
    {
      code: 'WELCOME',
      name: 'Добро пожаловать',
      description: 'Скидка 20% на первый заказ',
      discount: 20,
      type: 'percentage',
      minOrder: 500,
      maxDiscount: 1000,
      validUntil: '2024-12-31',
      isActive: true
    },
    {
      code: 'DELIVERY',
      name: 'Бесплатная доставка',
      description: 'Бесплатная доставка при заказе от 1000₽',
      discount: 200,
      type: 'fixed',
      minOrder: 1000,
      maxDiscount: 200,
      validUntil: '2024-12-31',
      isActive: true
    },
    {
      code: 'SAVE100',
      name: 'Экономия 100₽',
      description: 'Скидка 100₽ при заказе от 800₽',
      discount: 100,
      type: 'fixed',
      minOrder: 800,
      maxDiscount: 100,
      validUntil: '2024-12-31',
      isActive: true
    },
    {
      code: 'FIRSTORDER',
      name: 'Первый заказ',
      description: 'Скидка 15% на первый заказ',
      discount: 15,
      type: 'percentage',
      minOrder: 300,
      maxDiscount: 500,
      validUntil: '2024-12-31',
      isActive: true
    }
  ];

  useEffect(() => {
    setAvailablePromos(mockPromoCodes);
  }, []);

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      showError('Введите промокод');
      return;
    }

    setIsLoading(true);
    
    try {
      // Имитация проверки промокода
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const promo = availablePromos.find(p => 
        p.code.toLowerCase() === promoCode.toLowerCase().trim() && p.isActive
      );

      if (!promo) {
        showError('Промокод не найден или недействителен');
        setIsLoading(false);
        return;
      }

      // Проверяем минимальную сумму заказа
      if (cartTotal < promo.minOrder) {
        showError(`Минимальная сумма заказа для этого промокода: ${promo.minOrder}₽`);
        setIsLoading(false);
        return;
      }

      // Проверяем срок действия
      const today = new Date();
      const validUntil = new Date(promo.validUntil);
      if (today > validUntil) {
        showError('Промокод истёк');
        setIsLoading(false);
        return;
      }

      // Рассчитываем скидку
      let discountAmount = 0;
      if (promo.type === 'percentage') {
        discountAmount = Math.min(
          (cartTotal * promo.discount) / 100,
          promo.maxDiscount
        );
      } else {
        discountAmount = Math.min(promo.discount, promo.maxDiscount);
      }

      const finalPromo = {
        ...promo,
        discountAmount: Math.round(discountAmount),
        originalTotal: cartTotal,
        finalTotal: cartTotal - Math.round(discountAmount)
      };

      setAppliedPromo(finalPromo);
      showSuccess(`Промокод "${promo.name}" применён! Скидка: ${Math.round(discountAmount)}₽`);
      
      if (onPromoApplied) {
        onPromoApplied(finalPromo);
      }

    } catch (error) {
      console.error('Error applying promo code:', error);
      showError('Ошибка применения промокода');
    } finally {
      setIsLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    showSuccess('Промокод удалён');
    
    if (onPromoApplied) {
      onPromoApplied(null);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <h3 style={{
        color: '#2D5016',
        marginBottom: '15px',
        fontSize: '18px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🎟️ Промокоды и акции
      </h3>

      {/* Применённый промокод */}
      {appliedPromo && (
        <div style={{
          background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
          border: '1px solid #c3e6cb',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '15px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#155724',
                marginBottom: '5px'
              }}>
                ✅ {appliedPromo.name}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#155724'
              }}>
                {appliedPromo.description}
              </div>
            </div>
            <button
              onClick={removePromoCode}
              style={{
                background: 'transparent',
                border: '1px solid #155724',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                color: '#155724',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#155724'
          }}>
            <span>Скидка:</span>
            <span style={{ fontWeight: '600' }}>-{appliedPromo.discountAmount}₽</span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '16px',
            color: '#155724',
            marginTop: '5px',
            fontWeight: '600'
          }}>
            <span>Итого к оплате:</span>
            <span>{appliedPromo.finalTotal}₽</span>
          </div>
        </div>
      )}

      {/* Ввод промокода */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <input
          type="text"
          placeholder="Введите промокод"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          disabled={isLoading || !!appliedPromo}
          style={{
            flex: 1,
            padding: '12px 15px',
            border: '2px solid #e0e0e0',
            borderRadius: '25px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.3s ease',
            opacity: isLoading || appliedPromo ? 0.6 : 1
          }}
          onFocus={(e) => e.target.style.borderColor = '#2D5016'}
          onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
        />
        
        <button
          onClick={applyPromoCode}
          disabled={isLoading || !!appliedPromo}
          style={{
            background: isLoading || appliedPromo ? '#ccc' : 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: isLoading || appliedPromo ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: isLoading || appliedPromo ? 'none' : '0 4px 15px rgba(45, 80, 22, 0.3)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !appliedPromo) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !appliedPromo) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
            }
          }}
        >
          {isLoading ? '⏳' : 'Применить'}
        </button>
      </div>

      {/* Доступные промокоды */}
      <div>
        <h4 style={{
          color: '#2D5016',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🔥 Доступные промокоды:
        </h4>
        
        <div style={{
          display: 'grid',
          gap: '8px'
        }}>
          {availablePromos.filter(promo => promo.isActive).map((promo, index) => (
            <div
              key={index}
              style={{
                background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                if (!appliedPromo) {
                  setPromoCode(promo.code);
                }
              }}
              onMouseEnter={(e) => {
                if (!appliedPromo) {
                  e.target.style.background = 'linear-gradient(135deg, #ffeaa7, #fdcb6e)';
                }
              }}
              onMouseLeave={(e) => {
                if (!appliedPromo) {
                  e.target.style.background = 'linear-gradient(135deg, #fff3cd, #ffeaa7)';
                }
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontWeight: '600',
                    color: '#856404',
                    marginBottom: '2px'
                  }}>
                    {promo.code}
                  </div>
                  <div style={{
                    color: '#856404',
                    fontSize: '11px'
                  }}>
                    {promo.description}
                  </div>
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#856404'
                }}>
                  мин. {promo.minOrder}₽
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Акции */}
      <div style={{ marginTop: '20px' }}>
        <h4 style={{
          color: '#2D5016',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🎉 Текущие акции:
        </h4>
        
        <div style={{
          background: 'linear-gradient(135deg, #ff6b6b, #ff8e8e)',
          color: 'white',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '10px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '5px'
          }}>
            🍕 2 пиццы = доставка бесплатно
          </div>
          <div style={{
            fontSize: '12px',
            opacity: 0.9
          }}>
            При заказе двух пицц доставка в подарок
          </div>
        </div>
        
        <div style={{
          background: 'linear-gradient(135deg, #4ecdc4, #6dd5ed)',
          color: 'white',
          borderRadius: '10px',
          padding: '15px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '5px'
          }}>
            🎂 Скидка на десерты -20%
          </div>
          <div style={{
            fontSize: '12px',
            opacity: 0.9
          }}>
            На все десерты до конца месяца
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeSystem;
