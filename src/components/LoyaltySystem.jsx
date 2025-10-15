import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';

const LoyaltySystem = ({ onBonusApplied, cartTotal }) => {
  const [userBonuses, setUserBonuses] = useState(0);
  const [bonusToSpend, setBonusToSpend] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [bonusHistory, setBonusHistory] = useState([]);
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Загружаем данные пользователя
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      // Загружаем бонусы из localStorage
      const savedBonuses = localStorage.getItem('userBonuses');
      const savedHistory = localStorage.getItem('bonusHistory');
      
      if (savedBonuses) {
        setUserBonuses(parseInt(savedBonuses));
      }
      
      if (savedHistory) {
        setBonusHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const saveUserData = (bonuses, history) => {
    try {
      localStorage.setItem('userBonuses', bonuses.toString());
      localStorage.setItem('bonusHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const addBonusTransaction = (type, amount, description, orderId = null) => {
    const transaction = {
      id: Date.now().toString(),
      type, // 'earned' или 'spent'
      amount,
      description,
      orderId,
      timestamp: new Date().toISOString(),
      balance: type === 'earned' ? userBonuses + amount : userBonuses - amount
    };
    
    const newHistory = [transaction, ...bonusHistory];
    setBonusHistory(newHistory);
    saveUserData(
      type === 'earned' ? userBonuses + amount : userBonuses - amount,
      newHistory
    );
  };

  const spendBonuses = async () => {
    if (bonusToSpend <= 0) {
      showError('Введите количество бонусов для списания');
      return;
    }

    if (bonusToSpend > userBonuses) {
      showError('Недостаточно бонусов');
      return;
    }

    if (bonusToSpend > cartTotal) {
      showError('Нельзя списать больше суммы заказа');
      return;
    }

    setIsLoading(true);
    
    try {
      // Имитация обработки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBonuses = userBonuses - bonusToSpend;
      setUserBonuses(newBonuses);
      
      addBonusTransaction('spent', bonusToSpend, 'Списание бонусов за заказ');
      
      showSuccess(`Списано ${bonusToSpend} бонусов!`);
      
      if (onBonusApplied) {
        onBonusApplied({
          bonusSpent: bonusToSpend,
          discount: bonusToSpend,
          finalTotal: cartTotal - bonusToSpend
        });
      }
      
      setBonusToSpend(0);
      
    } catch (error) {
      console.error('Error spending bonuses:', error);
      showError('Ошибка списания бонусов');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEarnedBonuses = (orderTotal) => {
    // 5% от суммы заказа, минимум 10 бонусов
    return Math.max(Math.round(orderTotal * 0.05), 10);
  };

  const getBonusLevel = (bonuses) => {
    if (bonuses >= 1000) return { level: 'VIP', color: '#ffd700', icon: '👑' };
    if (bonuses >= 500) return { level: 'Gold', color: '#ffa500', icon: '🥇' };
    if (bonuses >= 200) return { level: 'Silver', color: '#c0c0c0', icon: '🥈' };
    if (bonuses >= 50) return { level: 'Bronze', color: '#cd7f32', icon: '🥉' };
    return { level: 'Newbie', color: '#6c757d', icon: '🌟' };
  };

  const currentLevel = getBonusLevel(userBonuses);
  const nextLevelBonuses = userBonuses >= 1000 ? null : 
    userBonuses >= 500 ? 1000 : 
    userBonuses >= 200 ? 500 : 
    userBonuses >= 50 ? 200 : 50;

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
        🎁 Система лояльности
      </h3>

      {/* Текущий уровень и бонусы */}
      <div style={{
        background: `linear-gradient(135deg, ${currentLevel.color}20, ${currentLevel.color}40)`,
        border: `2px solid ${currentLevel.color}`,
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '24px',
          marginBottom: '10px'
        }}>
          {currentLevel.icon}
        </div>
        
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: currentLevel.color,
          marginBottom: '5px'
        }}>
          {currentLevel.level}
        </div>
        
        <div style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '15px'
        }}>
          У вас {userBonuses} бонусов
        </div>

        {nextLevelBonuses && (
          <div style={{
            fontSize: '14px',
            color: '#666',
            background: 'rgba(255, 255, 255, 0.7)',
            padding: '8px 15px',
            borderRadius: '20px',
            display: 'inline-block'
          }}>
            До следующего уровня: {nextLevelBonuses - userBonuses} бонусов
          </div>
        )}
      </div>

      {/* Списание бонусов */}
      {userBonuses > 0 && cartTotal > 0 && (
        <div style={{
          background: '#f8f9fa',
          borderRadius: '10px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#2D5016',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            💰 Списать бонусы
          </h4>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <input
              type="number"
              placeholder="Количество бонусов"
              value={bonusToSpend || ''}
              onChange={(e) => setBonusToSpend(parseInt(e.target.value) || 0)}
              min="0"
              max={Math.min(userBonuses, cartTotal)}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2D5016'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
            
            <button
              onClick={spendBonuses}
              disabled={isLoading || bonusToSpend <= 0}
              style={{
                background: isLoading || bonusToSpend <= 0 ? '#ccc' : 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || bonusToSpend <= 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {isLoading ? '⏳' : 'Списать'}
            </button>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
          }}>
            Максимум: {Math.min(userBonuses, cartTotal)} бонусов
          </div>
        </div>
      )}

      {/* Информация о начислении */}
      <div style={{
        background: 'linear-gradient(135deg, #d4edda, #c3e6cb)',
        border: '1px solid #c3e6cb',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px'
      }}>
        <h4 style={{
          color: '#155724',
          marginBottom: '10px',
          fontSize: '16px',
          fontWeight: '600'
        }}>
          💡 Как получить бонусы:
        </h4>
        
        <div style={{
          fontSize: '14px',
          color: '#155724',
          lineHeight: '1.5'
        }}>
          <div style={{ marginBottom: '5px' }}>
            • За каждый заказ: <strong>5% от суммы</strong> (минимум 10 бонусов)
          </div>
          <div style={{ marginBottom: '5px' }}>
            • За отзыв с фото: <strong>+20 бонусов</strong>
          </div>
          <div style={{ marginBottom: '5px' }}>
            • За приглашение друга: <strong>+100 бонусов</strong>
          </div>
          <div>
            • 1 бонус = 1₽ скидки
          </div>
        </div>
      </div>

      {/* История бонусов */}
      {bonusHistory.length > 0 && (
        <div>
          <h4 style={{
            color: '#2D5016',
            marginBottom: '10px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            📊 История бонусов
          </h4>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #e0e0e0',
            borderRadius: '10px'
          }}>
            {bonusHistory.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                style={{
                  padding: '10px 15px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px'
                }}
              >
                <div>
                  <div style={{
                    fontWeight: '500',
                    color: '#2D5016',
                    marginBottom: '2px'
                  }}>
                    {transaction.description}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {new Date(transaction.timestamp).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                
                <div style={{
                  fontWeight: '600',
                  color: transaction.type === 'earned' ? '#28a745' : '#dc3545'
                }}>
                  {transaction.type === 'earned' ? '+' : '-'}{transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Предварительный расчёт бонусов за текущий заказ */}
      {cartTotal > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #fff3cd, #ffeaa7)',
          border: '1px solid #ffeaa7',
          borderRadius: '10px',
          padding: '15px',
          marginTop: '15px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#856404',
            fontWeight: '500'
          }}>
            За этот заказ вы получите:
          </div>
          <div style={{
            fontSize: '18px',
            color: '#856404',
            fontWeight: '700',
            marginTop: '5px'
          }}>
            +{calculateEarnedBonuses(cartTotal)} бонусов
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltySystem;
