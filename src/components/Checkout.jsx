import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { placeOrder } from '../api';

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryDate: '',
    deliveryTime: '',
    paymentMethod: 'card',
    comment: ''
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [showPaymentForm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Загрузка корзины и промокода из localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedPromo = localStorage.getItem('appliedPromo');
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.length === 0) {
          // Если корзина пуста, перенаправляем обратно в корзину
          navigate('/client/cart');
          return;
        }
        setCart(parsedCart);
      } catch (err) {
        console.error('Error parsing cart from localStorage:', err);
        navigate('/client/cart');
      }
    } else {
      navigate('/client/cart');
    }
    
    if (savedPromo) {
      try {
        setAppliedPromo(JSON.parse(savedPromo));
      } catch (err) {
        console.error('Error parsing promo from localStorage:', err);
      }
    }
    
    // Загрузка данных пользователя, если они есть
    const clientData = localStorage.getItem('clientData');
    if (clientData) {
      try {
        const parsedData = JSON.parse(clientData);
        setFormData(prev => ({
          ...prev,
          name: parsedData.name || '',
          phone: parsedData.phone || '',
          address: parsedData.address || ''
        }));
      } catch (err) {
        console.error('Error parsing client data from localStorage:', err);
      }
    }
    
    // Генерация доступных временных слотов
    generateTimeSlots();
  }, [navigate]);

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
    }
  }, [navigate]);

  // Генерация доступных временных слотов для доставки
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Форматирование даты для input type="date"
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Доступные временные слоты
    const timeSlots = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    
    // Если сейчас раньше 18:00, то доставка возможна сегодня
    if (now.getHours() < 18) {
      const todayDate = formatDate(now);
      
      // Фильтруем слоты, которые уже прошли
      const availableTodaySlots = timeSlots.filter(slot => {
        const [hours] = slot.split(':').map(Number);
        return hours > now.getHours() + 2; // +2 часа на подготовку
      });
      
      if (availableTodaySlots.length > 0) {
        slots.push({
          date: todayDate,
          label: 'Сегодня',
          slots: availableTodaySlots
        });
      }
    }
    
    // Доставка на завтра
    slots.push({
      date: formatDate(tomorrow),
      label: 'Завтра',
      slots: timeSlots
    });
    
    // Доставка на послезавтра
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    slots.push({
      date: formatDate(dayAfterTomorrow),
      label: 'Послезавтра',
      slots: timeSlots
    });
    
    setAvailableTimeSlots(slots);
    
    // Устанавливаем первый доступный слот по умолчанию
    if (slots.length > 0 && slots[0].slots.length > 0) {
      setFormData(prev => ({
        ...prev,
        deliveryDate: slots[0].date,
        deliveryTime: slots[0].slots[0]
      }));
    }
  };

  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    // Проверка имени
    if (!formData.name.trim()) {
      newErrors.name = t.nameRequired;
    }
    
    // Проверка телефона
    if (!formData.phone.trim()) {
      newErrors.phone = t.phoneRequired;
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t.invalidPhone;
    }
    
    // Проверка адреса
    if (!formData.address.trim()) {
      newErrors.address = t.addressRequired;
    }
    
    // Проверка даты доставки
    if (!formData.deliveryDate) {
      newErrors.deliveryDate = t.selectDeliveryDate;
    }
    
    // Проверка времени доставки
    if (!formData.deliveryTime) {
      newErrors.deliveryTime = t.selectDeliveryTime;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Расчет стоимости доставки
  const deliveryCost = appliedPromo?.freeDelivery ? 0 : 200;

  // Расчет суммы товаров
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Расчет скидки
  const discount = appliedPromo?.discount ? subtotal * appliedPromo.discount : 0;

  // Расчет итоговой суммы
  const total = subtotal - discount + deliveryCost;

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Сохраняем данные клиента для будущих заказов
      const clientData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address
      };
      localStorage.setItem('clientData', JSON.stringify(clientData));
      
      // Расчет комиссии (10% от общей суммы)
      const commission = Math.round(total * 0.1);
      const chefAmount = total - commission;
      
      // Формируем данные заказа
      const orderData = {
        items: cart,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        },
        delivery: {
          date: formData.deliveryDate,
          time: formData.deliveryTime
        },
        payment: {
          method: formData.paymentMethod,
          total: total,
          commission: commission,
          chefAmount: chefAmount,
          paymentDetails: formData.paymentMethod === 'card' ? paymentDetails : null
        },
        comment: formData.comment,
        promo: appliedPromo ? appliedPromo.code : null,
        discount: discount,
        deliveryCost: deliveryCost,
        subtotal: subtotal,
        status: formData.paymentMethod === 'card' ? 'pending_payment' : 'pending_confirmation'
      };
      
      const response = await placeOrder(orderData);
      
      if (response.success) {
        // Сохраняем данные заказа для страницы подтверждения
        localStorage.setItem('lastOrder', JSON.stringify({
          ...response.order,
          items: cart,
          delivery: {
            date: formData.deliveryDate,
            time: formData.deliveryTime
          },
          payment: {
            method: formData.paymentMethod,
            total: total
          },
          discount: discount,
          deliveryCost: deliveryCost,
          subtotal: subtotal
        }));
        
        // Очищаем корзину
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedPromo');
        
        // Перенаправляем на страницу подтверждения заказа
        navigate('/client/order-confirmation');
      } else {
        setErrors({ general: response.message || 'Ошибка оформления заказа' });
      }
    } catch (err) {
      setErrors({ general: 'Ошибка сервера. Пожалуйста, попробуйте позже.' });
      console.error('Order placement error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <h1>{t.orderDetails}</h1>
        <div className="checkout-actions">
          <Link to="/client/cart" className="back-to-cart">← {t.backToMenu}</Link>
        </div>
      </header>

      {errors.general && <div className="error-message general">{errors.general}</div>}

      <div className="checkout-content">
        <div className="checkout-form-container">
          <form onSubmit={handleSubmit} className="checkout-form">
            <h2>{t.deliveryDetails}</h2>
            
            <div className="form-group">
              <label htmlFor="name">{t.recipientName}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t.enterName}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">{t.phone}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t.enterPhone}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-text">{errors.phone}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="address">{t.deliveryAddress}</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t.enterAddress}
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
            
            <h2>Время доставки</h2>
            
            <div className="delivery-time-selection">
              {availableTimeSlots.map((dateSlot) => (
                <div key={dateSlot.date} className="date-slot">
                  <h3>{dateSlot.label} ({dateSlot.date})</h3>
                  <div className="time-slots">
                    {dateSlot.slots.map((timeSlot) => (
                      <label 
                        key={`${dateSlot.date}-${timeSlot}`}
                        className={`time-slot ${formData.deliveryDate === dateSlot.date && formData.deliveryTime === timeSlot ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="deliveryTime"
                          value={timeSlot}
                          checked={formData.deliveryDate === dateSlot.date && formData.deliveryTime === timeSlot}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              deliveryDate: dateSlot.date,
                              deliveryTime: timeSlot
                            }));
                            if (errors.deliveryDate || errors.deliveryTime) {
                              setErrors(prev => ({
                                ...prev,
                                deliveryDate: '',
                                deliveryTime: ''
                              }));
                            }
                          }}
                        />
                        {timeSlot}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {(errors.deliveryDate || errors.deliveryTime) && (
                <span className="error-text">Выберите время доставки</span>
              )}
            </div>
            
            <h2>Способ оплаты</h2>
            
            <div className="payment-methods">
              <label className={`payment-method ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                />
                <span className="payment-icon">💵</span>
                <span className="payment-name">Наличными при получении</span>
              </label>
              
              <label className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                />
                <span className="payment-icon">💳</span>
                <span className="payment-name">Картой онлайн (безопасно)</span>
              </label>
              
              <label className={`payment-method ${formData.paymentMethod === 'apple-pay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="apple-pay"
                  checked={formData.paymentMethod === 'apple-pay'}
                  onChange={handleChange}
                />
                <span className="payment-icon">🍎</span>
                <span className="payment-name">Apple Pay</span>
              </label>
              
              <label className={`payment-method ${formData.paymentMethod === 'google-pay' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="google-pay"
                  checked={formData.paymentMethod === 'google-pay'}
                  onChange={handleChange}
                />
                <span className="payment-icon">📱</span>
                <span className="payment-name">Google Pay</span>
              </label>
            </div>

            {/* Форма для ввода данных карты */}
            {formData.paymentMethod === 'card' && (
              <div className="card-payment-form">
                <h3>Данные карты</h3>
                <div className="card-form-row">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Номер карты</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={paymentDetails.cardNumber}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, cardNumber: e.target.value}))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      className={errors.cardNumber ? 'error' : ''}
                    />
                    {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                  </div>
                </div>
                
                <div className="card-form-row">
                  <div className="form-group">
                    <label htmlFor="cardholderName">Имя держателя карты</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={paymentDetails.cardholderName}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, cardholderName: e.target.value}))}
                      placeholder="IVAN IVANOV"
                      className={errors.cardholderName ? 'error' : ''}
                    />
                    {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
                  </div>
                </div>
                
                <div className="card-form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Срок действия</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={paymentDetails.expiryDate}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, expiryDate: e.target.value}))}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={errors.expiryDate ? 'error' : ''}
                    />
                    {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={paymentDetails.cvv}
                      onChange={(e) => setPaymentDetails(prev => ({...prev, cvv: e.target.value}))}
                      placeholder="123"
                      maxLength="3"
                      className={errors.cvv ? 'error' : ''}
                    />
                    {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                  </div>
                </div>
                
                <div className="payment-security">
                  <span className="security-icon">🔒</span>
                  <span>Ваши данные защищены SSL-шифрованием</span>
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="comment">Комментарий к заказу</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Дополнительная информация для курьера"
              />
            </div>
            
            <button 
              type="submit" 
              className="place-order-button"
              disabled={loading}
            >
              {loading ? t.processing : t.placeOrder}
            </button>
          </form>
        </div>
        
        <div className="order-summary">
          <h2>{t.yourOrder}</h2>
          
          <div className="order-items">
            {cart.map(item => (
              <div key={item.id} className="order-item">
                <div className="item-quantity">{item.quantity} ×</div>
                <div className="item-name">{item.name}</div>
                <div className="item-price">{item.price * item.quantity} ₽</div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>{t.itemsTotal}</span>
              <span>{subtotal} ₽</span>
            </div>
            {discount > 0 && (
              <div className="total-row discount">
                <span>{t.discount}:</span>
                <span>-{discount} ₽</span>
              </div>
            )}
            <div className="total-row">
              <span>{t.delivery}:</span>
              <span>{deliveryCost > 0 ? `${deliveryCost} ₽` : t.free}</span>
            </div>
            {appliedPromo && (
              <div className="promo-info">
                <span>{t.promoCode}: {appliedPromo.code}</span>
                <span>{appliedPromo.description}</span>
              </div>
            )}
            
            {/* Информация о комиссии */}
            <div className="commission-info">
              <div className="total-row">
                <span>{t.serviceCommission}</span>
                <span className="commission-amount">{Math.round(total * 0.1)} ₽</span>
              </div>
              <div className="total-row chef-amount">
                <span>{t.chefWillReceive}</span>
                <span className="chef-amount-value">{total - Math.round(total * 0.1)} ₽</span>
              </div>
            </div>
            
            <div className="total-row final">
              <span>{t.totalToPay}:</span>
              <span>{total} ₽</span>
            </div>
            
            <div className="payment-status-info">
              <p>{t.paymentStatusInfo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;