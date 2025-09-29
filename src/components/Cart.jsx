import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import SmartCart from './SmartCart';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess } = useToast();

  // Загрузка корзины из localStorage
  useEffect(() => {
    const loadCart = () => {
      console.log('=== LOAD CART FUNCTION CALLED ===');
      const savedCart = localStorage.getItem('cart');
      console.log('Loading cart from localStorage:', savedCart);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('Parsed cart:', parsedCart);
          console.log('Parsed cart length:', parsedCart.length);
          
          // Всегда обновляем состояние корзины
          setCart(parsedCart);
          console.log('Cart state set to:', parsedCart);
          
        } catch (err) {
          console.error('Error parsing cart from localStorage:', err);
          setCart([]);
        }
      } else {
        console.log('No cart data in localStorage');
        setCart([]);
      }
      console.log('=== END LOAD CART FUNCTION ===');
    };

    // Загружаем корзину при инициализации
    loadCart();

    // Слушаем изменения через custom event (основной способ)
    const handleCustomStorageChange = () => {
      console.log('=== CUSTOM CART CHANGE EVENT RECEIVED ===');
      loadCart();
    };

    // Слушаем изменения в localStorage (для других вкладок)
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        console.log('Cart changed in localStorage, reloading...');
        loadCart();
      }
    };

    window.addEventListener('cartChanged', handleCustomStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartChanged', handleCustomStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Сохранение корзины в localStorage при изменении (только если корзина не пустая)
  useEffect(() => {
    if (cart.length > 0) {
      console.log('Saving cart to localStorage:', cart);
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
    }
  }, [navigate]);

  // Показ уведомления
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Изменение количества товара
  const updateQuantity = (id, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  // Удаление товара из корзины
  const removeItem = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
    showToast('Товар удален из корзины');
  };

  // Применение промокода
  const applyPromoCode = () => {
    // Демо-промокоды
    const promoCodes = {
      'СКИДКА10': { discount: 0.1, description: 'Скидка 10%' },
      'СКИДКА20': { discount: 0.2, description: 'Скидка 20%' },
      'БЕСПЛАТНАЯ_ДОСТАВКА': { freeDelivery: true, description: 'Бесплатная доставка' }
    };

    setPromoError('');
    
    if (!promoCode.trim()) {
      setPromoError('Введите промокод');
      return;
    }

    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({
        ...promo,
        code: promoCode.toUpperCase()
      });
      showToast(`Промокод ${promoCode.toUpperCase()} применен!`);
      setPromoCode('');
    } else {
      setPromoError('Недействительный промокод');
    }
  };

  // Отмена промокода
  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast('Промокод отменен');
  };

  // Расчет стоимости доставки
  const deliveryCost = appliedPromo?.freeDelivery ? 0 : 200;

  // Расчет суммы товаров
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Расчет скидки
  const discount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0;

  // Расчет итоговой суммы
  const total = subtotal - discount + deliveryCost;

  // Переход к оформлению заказа
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast('Корзина пуста', 'error');
      return;
    }
    
    // Сохраняем данные о скидке для оформления заказа
    if (appliedPromo) {
      localStorage.setItem('appliedPromo', JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem('appliedPromo');
    }
    
    navigate('/client/checkout');
  };

  // Отладочная информация
  console.log('=== CART DEBUG INFO ===');
  console.log('Cart component rendering, cart state:', cart);
  console.log('Cart length:', cart.length);
  console.log('localStorage cart raw:', localStorage.getItem('cart'));
  console.log('localStorage cart parsed:', JSON.parse(localStorage.getItem('cart') || '[]'));
  console.log('Cart items details:', cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, photo: item.photo, image: item.image })));
  console.log('All localStorage keys:', Object.keys(localStorage));
  console.log('All localStorage values:', Object.keys(localStorage).map(key => ({ key, value: localStorage.getItem(key) })));
  console.log('=== END CART DEBUG ===');

  return (
    <div className="cart-container">
      {toast.show && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
      
      <header className="cart-header">
        <h1>{t.cart}</h1>
        <div className="cart-actions">
          <button 
            onClick={() => {
              const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
              setCart(savedCart);
              console.log('Manual cart refresh:', savedCart);
            }}
            className="refresh-cart-button"
          >
            🔄 {t.refresh}
          </button>
          <button 
            onClick={() => {
              console.log('=== MANUAL CART CHECK ===');
              const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
              console.log('Manual check - savedCart:', savedCart);
              console.log('Manual check - savedCart length:', savedCart.length);
              console.log('Manual check - current cart state:', cart);
              console.log('Manual check - current cart length:', cart.length);
              console.log('=== END MANUAL CART CHECK ===');
              alert(`В localStorage: ${savedCart.length} товаров\nВ состоянии: ${cart.length} товаров`);
            }}
            className="refresh-cart-button"
          >
            🔍 {t.checkData}
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              setCart([]);
              console.log('localStorage cleared!');
              alert('localStorage очищен! Страница будет обновлена.');
              window.location.reload();
            }}
            className="clear-storage-button"
          >
            🗑️ {t.clearAll}
          </button>
          <Link to="/client/menu" className="back-to-menu">← {t.backToMenu}</Link>
        </div>
      </header>

      {/* Умная корзина */}
      <SmartCart 
        cart={cart} 
        onAddToCart={(item) => {
          const newCart = [...cart, item];
          setCart(newCart);
          localStorage.setItem('cart', JSON.stringify(newCart));
          showSuccess(`${item.name} добавлен в корзину!`);
        }}
        onRemoveFromCart={(itemId) => {
          const newCart = cart.filter(item => item.id !== itemId);
          setCart(newCart);
          localStorage.setItem('cart', JSON.stringify(newCart));
          showSuccess('Товар удален из корзины!');
        }}
      />

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>{t.cartEmpty}</h2>
          <p>{t.cartEmptyDesc}</p>
          <Link to="/client/menu" className="continue-shopping">{t.goToMenu}</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <h2>{t.itemsInCart}</h2>
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.photo || item.image ? (
                    <img src={item.photo || item.image} alt={item.name} />
                  ) : (
                    <div className="placeholder-image">🍽️</div>
                  )}
                </div>
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">{item.price} ₽</p>
                  {item.type === 'product' && (
                    <p className="item-type">🛒 Продукт фермерского рынка</p>
                  )}
                  {item.type === 'dish' && (
                    <p className="item-type">🍽️ Блюдо</p>
                  )}
                </div>
                <div className="item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <div className="item-total">
                  {item.price * item.quantity} ₽
                </div>
                <button 
                  className="remove-item" 
                  onClick={() => removeItem(item.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h2>{t.orderSummary}</h2>
            
            <div className="promo-code">
              <h3>{t.promoCode}</h3>
              {appliedPromo ? (
                <div className="applied-promo">
                  <p>
                    <strong>{appliedPromo.code}</strong>: {appliedPromo.description}
                  </p>
                  <button onClick={removePromoCode}>{t.cancel}</button>
                </div>
              ) : (
                <div className="promo-form">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder={t.enterPromoCode}
                  />
                  <button onClick={applyPromoCode}>{t.apply}</button>
                  {promoError && <p className="promo-error">{promoError}</p>}
                </div>
              )}
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>{t.itemsTotal}</span>
                <span>{subtotal} ₽</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>{t.discount}:</span>
                  <span>-{discount} ₽</span>
                </div>
              )}
              <div className="summary-row">
                <span>{t.delivery}:</span>
                <span>{deliveryCost > 0 ? `${deliveryCost} ₽` : t.free}</span>
              </div>
              <div className="summary-row total">
                <span>{t.total}:</span>
                <span>{total} ₽</span>
              </div>
            </div>
            
            <button 
              className="checkout-button"
              onClick={handleCheckout}
              disabled={cart.length === 0}
            >
              {t.checkout}
            </button>
            
            <Link to="/client/menu" className="continue-shopping">
              {t.continueShopping}
            </Link>
            
            {/* Кнопка отладки */}
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <h4>Отладка корзины</h4>
              <p>Количество товаров в корзине: {cart.length}</p>
              <p>localStorage cart: {localStorage.getItem('cart') ? 'Есть данные' : 'Пусто'}</p>
              <button 
                onClick={() => {
                  console.log('=== CART DEBUG INFO ===');
                  console.log('Cart state:', cart);
                  console.log('localStorage cart:', localStorage.getItem('cart'));
                  console.log('Cart length:', cart.length);
                  console.log('=== END CART DEBUG ===');
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  marginRight: '10px'
                }}
              >
                Логи в консоль
              </button>
              <button 
                onClick={() => {
                  localStorage.removeItem('cart');
                  setCart([]);
                  alert('Корзина очищена!');
                }}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer'
                }}
              >
                Очистить корзину
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;