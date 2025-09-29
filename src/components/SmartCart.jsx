import React, { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const SmartCart = ({ cart, onAddToCart, onRemoveFromCart }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { showSuccess, showError } = useToast();

  // Отладочная информация
  console.log('🔍 SmartCart: Component rendered');
  console.log('🔍 SmartCart: cart prop:', cart);
  console.log('🔍 SmartCart: cart length:', cart?.length || 0);
  console.log('🔍 SmartCart: isAnalyzing:', isAnalyzing);
  console.log('🔍 SmartCart: showSuggestions:', showSuggestions);
  console.log('🔍 SmartCart: suggestions count:', suggestions.length);

  // База данных умных предложений для татарской кухни
  const smartSuggestionsDatabase = {
    // Основные блюда
    'борщ': {
      essentials: ['сметана', 'хлеб ржаной', 'салат из свежих овощей'],
      drinks: ['компот из сухофруктов', 'чай с лимоном'],
      sauces: ['чесночный соус', 'сметанный соус'],
      seasonal: {
        spring: ['зеленый лук', 'редис'],
        summer: ['свежие помидоры', 'огурцы'],
        autumn: ['квашеная капуста'],
        winter: ['маринованные овощи']
      }
    },
    'плов': {
      essentials: ['салат из свежих овощей', 'хлеб лепешка', 'маринованные овощи'],
      drinks: ['айран', 'чай зеленый', 'компот'],
      sauces: ['соус томатный', 'соус чесночный'],
      seasonal: {
        spring: ['зеленый салат', 'редис'],
        summer: ['свежие овощи', 'зелень'],
        autumn: ['квашеная капуста', 'соленья'],
        winter: ['маринованные овощи', 'квашеная капуста']
      }
    },
    'манты': {
      essentials: ['салат из свежих овощей', 'хлеб', 'маринованные овощи'],
      drinks: ['айран', 'чай', 'компот'],
      sauces: ['соус сметанный', 'соус томатный', 'соус чесночный'],
      seasonal: {
        spring: ['зеленый салат', 'редис'],
        summer: ['свежие овощи', 'зелень'],
        autumn: ['квашеная капуста', 'соленья'],
        winter: ['маринованные овощи', 'квашеная капуста']
      }
    },
    'салат': {
      essentials: ['хлеб', 'маринованные овощи'],
      drinks: ['чай', 'компот', 'сок'],
      sauces: ['соус для салата', 'оливковое масло'],
      seasonal: {
        spring: ['зеленый лук', 'редис'],
        summer: ['свежие овощи', 'зелень'],
        autumn: ['квашеная капуста', 'соленья'],
        winter: ['маринованные овощи', 'квашеная капуста']
      }
    },
    'суп': {
      essentials: ['хлеб', 'салат из свежих овощей'],
      drinks: ['чай', 'компот', 'сок'],
      sauces: ['сметана', 'чесночный соус'],
      seasonal: {
        spring: ['зеленый лук', 'редис'],
        summer: ['свежие овощи', 'зелень'],
        autumn: ['квашеная капуста', 'соленья'],
        winter: ['маринованные овощи', 'квашеная капуста']
      }
    },
    'выпечка': {
      essentials: ['чай', 'кофе', 'молоко'],
      drinks: ['чай', 'кофе', 'какао', 'сок'],
      sauces: ['варенье', 'мед', 'сметана'],
      seasonal: {
        spring: ['зеленый чай', 'травяной чай'],
        summer: ['холодный чай', 'лимонад'],
        autumn: ['горячий чай', 'кофе'],
        winter: ['горячий шоколад', 'глинтвейн']
      }
    },
    'десерт': {
      essentials: ['чай', 'кофе'],
      drinks: ['чай', 'кофе', 'сок', 'молоко'],
      sauces: ['варенье', 'мед', 'сироп'],
      seasonal: {
        spring: ['зеленый чай', 'травяной чай'],
        summer: ['холодный чай', 'лимонад'],
        autumn: ['горячий чай', 'кофе'],
        winter: ['горячий шоколад', 'глинтвейн']
      }
    }
  };

  // Праздничные предложения
  const holidaySuggestions = {
    'навруз': {
      traditional: ['сумаляк', 'халва', 'орехи', 'сухофрукты'],
      drinks: ['зеленый чай', 'компот из сухофруктов'],
      message: 'Навруз мубарак! Традиционные весенние угощения'
    },
    'ураза': {
      traditional: ['финики', 'сухофрукты', 'орехи', 'халва'],
      drinks: ['чай', 'компот', 'сок'],
      message: 'Рамадан карим! Специальные угощения для ифтара'
    },
    'новый год': {
      traditional: ['оливье', 'селедка под шубой', 'шампанское', 'мандарины'],
      drinks: ['шампанское', 'сок', 'компот'],
      message: 'С Новым годом! Праздничные блюда для стола'
    },
    '8 марта': {
      traditional: ['торт', 'конфеты', 'фрукты', 'шампанское'],
      drinks: ['шампанское', 'сок', 'чай'],
      message: 'С 8 марта! Сладкие угощения для прекрасных дам'
    },
    'масленица': {
      traditional: ['блины', 'сметана', 'варенье', 'мед'],
      drinks: ['чай', 'кофе', 'сок'],
      message: 'Масленица! Традиционные блины и угощения'
    }
  };

  // Определение текущего сезона
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // Определение ближайшего праздника
  const getCurrentHoliday = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    // Навруз (21 марта)
    if (month === 3 && day >= 20 && day <= 22) return 'навруз';
    
    // 8 марта
    if (month === 3 && day === 8) return '8 марта';
    
    // Новый год (декабрь-январь)
    if (month === 12 || month === 1) return 'новый год';
    
    // Масленица (февраль-март)
    if (month === 2 || (month === 3 && day <= 15)) return 'масленица';
    
    // Рамадан (примерно май-июнь, но нужно уточнять каждый год)
    if (month >= 5 && month <= 6) return 'ураза';
    
    return null;
  };

  // Анализ корзины и генерация предложений
  const analyzeCart = () => {
    console.log('🔍 SmartCart: analyzeCart called');
    console.log('🔍 SmartCart: cart length:', cart.length);
    console.log('🔍 SmartCart: cart items:', cart);
    
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const newSuggestions = [];
      const currentSeason = getCurrentSeason();
      const currentHoliday = getCurrentHoliday();
      
      // Анализируем каждое блюдо в корзине
      console.log('🔍 SmartCart: Starting analysis...');
      console.log('🔍 SmartCart: Current season:', currentSeason);
      console.log('🔍 SmartCart: Current holiday:', currentHoliday);
      
      cart.forEach(item => {
        const dishName = item.name.toLowerCase();
        const dishSuggestions = smartSuggestionsDatabase[dishName];
        console.log('🔍 SmartCart: Analyzing dish:', dishName, 'Suggestions found:', !!dishSuggestions);
        
        if (dishSuggestions) {
          // Добавляем основные дополнения
          dishSuggestions.essentials.forEach(essential => {
            if (!cart.some(cartItem => cartItem.name.toLowerCase().includes(essential.toLowerCase()))) {
              newSuggestions.push({
                name: essential,
                category: 'essential',
                reason: `Отлично сочетается с ${item.name}`,
                price: Math.floor(Math.random() * 200) + 50,
                emoji: '⭐'
              });
            }
          });
          
          // Добавляем напитки
          dishSuggestions.drinks.forEach(drink => {
            if (!cart.some(cartItem => cartItem.name.toLowerCase().includes(drink.toLowerCase()))) {
              newSuggestions.push({
                name: drink,
                category: 'drink',
                reason: `Идеальный напиток к ${item.name}`,
                price: Math.floor(Math.random() * 150) + 30,
                emoji: '🥤'
              });
            }
          });
          
          // Добавляем соусы
          dishSuggestions.sauces.forEach(sauce => {
            if (!cart.some(cartItem => cartItem.name.toLowerCase().includes(sauce.toLowerCase()))) {
              newSuggestions.push({
                name: sauce,
                category: 'sauce',
                reason: `Вкусный соус для ${item.name}`,
                price: Math.floor(Math.random() * 100) + 25,
                emoji: '🍯'
              });
            }
          });
          
          // Добавляем сезонные предложения
          if (dishSuggestions.seasonal && dishSuggestions.seasonal[currentSeason]) {
            dishSuggestions.seasonal[currentSeason].forEach(seasonal => {
              if (!cart.some(cartItem => cartItem.name.toLowerCase().includes(seasonal.toLowerCase()))) {
                newSuggestions.push({
                  name: seasonal,
                  category: 'seasonal',
                  reason: `Сезонное предложение для ${item.name}`,
                  price: Math.floor(Math.random() * 120) + 40,
                  emoji: '🌿'
                });
              }
            });
          }
        }
      });
      
      // Добавляем праздничные предложения
      if (currentHoliday && holidaySuggestions[currentHoliday]) {
        const holiday = holidaySuggestions[currentHoliday];
        holiday.traditional.forEach(traditional => {
          if (!cart.some(cartItem => cartItem.name.toLowerCase().includes(traditional.toLowerCase()))) {
            newSuggestions.push({
              name: traditional,
              category: 'holiday',
              reason: holiday.message,
              price: Math.floor(Math.random() * 300) + 100,
              emoji: '🎉'
            });
          }
        });
      }
      
      // Если корзина пуста, показываем общие предложения
      if (cart.length === 0) {
        console.log('🔍 SmartCart: Cart is empty, showing general suggestions');
        const generalSuggestions = [
          { name: 'Салат из свежих овощей', category: 'essential', reason: 'Свежие овощи для здорового питания', price: 180, emoji: '🥗' },
          { name: 'Хлеб ржаной', category: 'essential', reason: 'Традиционный хлеб к любому блюду', price: 120, emoji: '🍞' },
          { name: 'Чай зеленый', category: 'drink', reason: 'Полезный напиток', price: 80, emoji: '🍵' },
          { name: 'Компот из сухофруктов', category: 'drink', reason: 'Традиционный напиток', price: 150, emoji: '🥤' },
          { name: 'Сметана', category: 'sauce', reason: 'Добавка к супам и салатам', price: 90, emoji: '🥛' },
          { name: 'Маринованные овощи', category: 'seasonal', reason: 'Сезонная закуска', price: 200, emoji: '🥒' }
        ];
        setSuggestions(generalSuggestions);
        setIsAnalyzing(false);
        setShowSuggestions(true);
        showSuccess('Показаны общие рекомендации для начала заказа!');
        return;
      }
      
      // Убираем дубликаты и ограничиваем количество
      const uniqueSuggestions = newSuggestions.filter((suggestion, index, self) => 
        index === self.findIndex(s => s.name === suggestion.name)
      ).slice(0, 6);
      
      console.log('🔍 SmartCart: Generated suggestions:', uniqueSuggestions);
      
      setSuggestions(uniqueSuggestions);
      setIsAnalyzing(false);
      setShowSuggestions(true);
      
      if (uniqueSuggestions.length > 0) {
        showSuccess(`Найдено ${uniqueSuggestions.length} умных предложений!`);
      } else {
        showSuccess('Анализ завершен, но предложений не найдено');
      }
    }, 1500);
  };

  // Добавление предложения в корзину
  const addSuggestion = (suggestion) => {
    console.log('🔍 SmartCart: addSuggestion called with:', suggestion);
    console.log('🔍 SmartCart: onAddToCart function:', typeof onAddToCart);
    
    const newItem = {
      id: Date.now() + Math.random(),
      name: suggestion.name,
      price: suggestion.price,
      quantity: 1,
      category: suggestion.category,
      emoji: suggestion.emoji
    };
    
    console.log('🔍 SmartCart: Created new item:', newItem);
    
    if (typeof onAddToCart === 'function') {
      onAddToCart(newItem);
      showSuccess(`${suggestion.name} добавлен в корзину!`);
      
      // Убираем предложение из списка
      setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
    } else {
      console.error('🔍 SmartCart: onAddToCart is not a function!');
      showError('Ошибка добавления в корзину');
    }
  };

  // Подсчет общей суммы корзины
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="smart-cart-container" style={{
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '15px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div className="smart-cart-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>🤖 Умная корзина</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={analyzeCart}
            disabled={isAnalyzing}
            style={{
              background: isAnalyzing ? '#ccc' : 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isAnalyzing ? '🔄 Анализирую...' : (cart.length === 0 ? '🧠 Показать рекомендации' : '🧠 Анализировать заказ')}
          </button>
          
          <button
            onClick={() => {
              console.log('🔍 SmartCart: Test button clicked');
              console.log('🔍 SmartCart: Current state:', { cart, isAnalyzing, showSuggestions, suggestions });
              
              // Принудительно показываем тестовые предложения
              const testSuggestions = [
                { name: 'Тестовый салат', category: 'essential', reason: 'Тестовое предложение', price: 150, emoji: '🥗' },
                { name: 'Тестовый напиток', category: 'drink', reason: 'Тестовый напиток', price: 100, emoji: '🥤' }
              ];
              setSuggestions(testSuggestions);
              setShowSuggestions(true);
              showSuccess('Показаны тестовые предложения!');
            }}
            style={{
              background: 'linear-gradient(135deg, #28a745, #20c997)',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🔍 Тест
          </button>
        </div>
      </div>

      {cart.length > 0 && (
        <div className="cart-summary" style={{
          background: 'rgba(102, 126, 234, 0.1)',
          padding: '15px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span><strong>Товаров в корзине:</strong> {cart.length}</span>
            <span><strong>Общая сумма:</strong> {cartTotal}₽</span>
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            💡 Умная корзина может предложить идеальные дополнения к вашему заказу
          </div>
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions-section">
          <h4 style={{ color: '#333', marginBottom: '15px' }}>💡 Умные предложения:</h4>
          <div className="suggestions-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            {suggestions.map((suggestion, index) => (
              <div key={index} className="suggestion-card" style={{
                background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                padding: '15px',
                borderRadius: '10px',
                border: '1px solid #dee2e6',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              onClick={() => addSuggestion(suggestion)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{suggestion.emoji}</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#28a745' }}>+{suggestion.price}₽</span>
                </div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>
                  {suggestion.name}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  {suggestion.reason}
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  textAlign: 'center'
                }}>
                  Добавить в корзину
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {cart.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🛒</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>Корзина пуста</div>
          <div style={{ fontSize: '14px' }}>Добавьте блюда, чтобы получить умные предложения</div>
        </div>
      )}
    </div>
  );
};

export default SmartCart;
