import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";
import { placeOrder } from "../api/adapter";
import storageManager from "../utils/storageManager";

const QuickOrder = ({ dishes = [], onClose }) => {
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState({
    method: "delivery",
    address: "",
    date: "",
    time: "",
    comment: "",
  });
  const [paymentInfo, setPaymentInfo] = useState({
    method: "card",
    status: "pending",
    cardData: {
      number: "",
      expiry: "",
      cvv: "",
      holderName: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  // Форматирование номера карты
  const formatCardNumber = value => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Форматирование срока действия карты
  const formatExpiry = value => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Функция для получения текущего местоположения
  const getCurrentLocation = () => {
    console.log("🔍 getCurrentLocation вызвана в QuickOrder");

    if (!navigator.geolocation) {
      showError("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;

          // Используем Nominatim API для получения адреса по координатам
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              setDeliveryInfo(prev => ({
                ...prev,
                address: data.display_name,
              }));
              showSuccess("Адрес определен автоматически!");
            } else {
              setDeliveryInfo(prev => ({
                ...prev,
                address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              }));
              showSuccess("Координаты получены!");
            }
          } else {
            // Fallback - используем координаты
            setDeliveryInfo(prev => ({
              ...prev,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            }));
            showSuccess("Координаты получены!");
          }
        } catch (error) {
          console.error("Ошибка получения адреса:", error);
          const { latitude, longitude } = position.coords;
          setDeliveryInfo(prev => ({
            ...prev,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          }));
          showSuccess("Координаты получены!");
        } finally {
          setIsGettingLocation(false);
        }
      },
      error => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            showError(
              "Доступ к геолокации запрещен. Разрешите доступ в настройках браузера."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            showError("Информация о местоположении недоступна.");
            break;
          case error.TIMEOUT:
            showError("Время ожидания запроса геолокации истекло.");
            break;
          default:
            showError("Произошла неизвестная ошибка при получении геолокации.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 минут
      }
    );
  };

  // Загружаем сохраненные данные из localStorage
  useEffect(() => {
    console.log("🔍 QuickOrder: Загрузка данных из localStorage");
    console.log("🔍 QuickOrder: Получено dishes:", dishes);

    try {
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const savedDelivery = JSON.parse(
        localStorage.getItem("deliveryInfo") || "{}"
      );
      const savedPayment = JSON.parse(
        localStorage.getItem("paymentInfo") || "{}"
      );

      console.log("🔍 QuickOrder: savedCart:", savedCart);

      // Проверяем, что savedCart - это массив
      if (Array.isArray(savedCart)) {
        setSelectedDishes(savedCart);
      } else {
        console.warn(
          "savedCart не является массивом, используем пустой массив"
        );
        setSelectedDishes([]);
      }

      if (Object.keys(savedDelivery).length > 0) {
        setDeliveryInfo(prev => ({ ...prev, ...savedDelivery }));
      }
      if (Object.keys(savedPayment).length > 0) {
        setPaymentInfo(prev => ({ ...prev, ...savedPayment }));
      }
    } catch (err) {
      console.error(
        "❌ QuickOrder: Ошибка загрузки данных из localStorage:",
        err
      );
      setError("Ошибка загрузки данных. Попробуйте очистить корзину.");
      setSelectedDishes([]);
    }
  }, [dishes]);

  // Функция безопасного сохранения в localStorage с защитой от переполнения
  const safeSetItem = (key, value) => {
    storageManager.safeSetItem(
      key,
      value,
      () => {
        // Успешно сохранено
        console.log(`✅ Сохранено: ${key}`);
      },
      error => {
        // Ошибка сохранения
        console.error(`❌ Ошибка сохранения ${key}:`, error);
        if (error.name === "QuotaExceededError") {
          showError(
            "Недостаточно места. Старые данные были очищены. Попробуйте ещё раз."
          );
        } else {
          showError("Ошибка сохранения данных");
        }
      }
    );
  };

  // Сохраняем данные при изменении
  useEffect(() => {
    if (selectedDishes.length > 0) {
      safeSetItem("cart", JSON.stringify(selectedDishes));
    }
  }, [selectedDishes]);

  useEffect(() => {
    if (deliveryInfo.address) {
      safeSetItem("deliveryInfo", JSON.stringify(deliveryInfo));
    }
  }, [deliveryInfo]);

  useEffect(() => {
    if (paymentInfo.method) {
      safeSetItem("paymentInfo", JSON.stringify(paymentInfo));
    }
  }, [paymentInfo]);

  const addToCart = dish => {
    setSelectedDishes(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = dishId => {
    setSelectedDishes(prev => prev.filter(item => item.id !== dishId));
  };

  const updateQuantity = (dishId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }
    setSelectedDishes(prev =>
      prev.map(item => (item.id === dishId ? { ...item, quantity } : item))
    );
  };

  const calculateTotal = () => {
    const subtotal = selectedDishes.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = deliveryInfo.method === "delivery" ? 150 : 0;
    return subtotal + deliveryFee;
  };

  const handleOrder = async () => {
    if (selectedDishes.length === 0) {
      showError("Выберите хотя бы одно блюдо");
      return;
    }

    if (deliveryInfo.method === "delivery" && !deliveryInfo.address) {
      showError("Укажите адрес доставки");
      return;
    }

    if (!deliveryInfo.date || !deliveryInfo.time) {
      showError("Выберите дату и время доставки");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: selectedDishes,
        customer: {
          name: "Клиент",
          phone: "+7 (999) 123-45-67",
          address:
            deliveryInfo.method === "delivery"
              ? deliveryInfo.address
              : "Самовывоз",
        },
        delivery: {
          method: deliveryInfo.method,
          address: deliveryInfo.address,
          date: deliveryInfo.date,
          time: deliveryInfo.time,
        },
        payment: {
          method: paymentInfo.method,
          status: paymentInfo.status,
          cardData: paymentInfo.method === "card" ? paymentInfo.cardData : null,
        },
        comment: deliveryInfo.comment,
        total: calculateTotal(),
      };

      // Mock API call - имитируем задержку сети
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Создаем mock результат
      const mockResult = {
        success: true,
        order: {
          id: `ORDER-${Date.now()}`,
          orderNumber: `#${Math.floor(Math.random() * 10000)}`,
          status: "pending",
          createdAt: new Date().toISOString(),
          ...orderData,
        },
      };

      console.log("✅ Быстрый заказ создан:", mockResult);

      if (mockResult.success) {
        // Очищаем корзину
        localStorage.removeItem("cart");
        localStorage.removeItem("deliveryInfo");
        localStorage.removeItem("paymentInfo");

        showSuccess("Заказ успешно оформлен!");
        navigate("/client/order-confirmation", {
          state: { order: mockResult.order },
        });
      }
    } catch (error) {
      showError("Ошибка при оформлении заказа");
      console.error("Order error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryTimeOptions = () => {
    const options = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dateStr = date.toISOString().split("T")[0];
      const dayName = date.toLocaleDateString("ru-RU", { weekday: "long" });

      options.push(
        <option key={dateStr} value={dateStr}>
          {dayName}, {date.toLocaleDateString("ru-RU")}
        </option>
      );
    }

    return options;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(
          <option key={timeStr} value={timeStr}>
            {timeStr}
          </option>
        );
      }
    }
    return slots;
  };

  // Проверка на ошибки
  if (error) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "12px",
            maxWidth: "400px",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#f44336", marginBottom: "15px" }}>⚠️ Ошибка</h3>
          <p style={{ marginBottom: "20px" }}>{error}</p>
          <button
            onClick={onClose}
            style={{
              padding: "10px 20px",
              background: "#2196f3",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="quick-order">
      <div className="quick-order-header">
        <h2>🛒 Быстрый заказ</h2>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>

      <div className="quick-order-content">
        {/* Выбор блюд */}
        <div className="dishes-section">
          <h3>🍽️ Выберите блюда</h3>
          <div className="dishes-grid">
            {Array.isArray(dishes) && dishes.length > 0 ? (
              dishes.slice(0, 6).map(dish => (
                <div key={dish.id} className="dish-card">
                  <div className="dish-info">
                    <h4>{dish.name}</h4>
                    <p>{dish.description}</p>
                    <div className="dish-price">{dish.price} ₽</div>
                  </div>
                  <div className="dish-actions">
                    <button onClick={() => addToCart(dish)} className="add-btn">
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#999" }}
              >
                <p>📭 Нет доступных блюд для быстрого заказа</p>
                <p style={{ fontSize: "13px" }}>
                  Перейдите в меню, чтобы выбрать блюда
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Корзина */}
        {selectedDishes.length > 0 && (
          <div className="cart-section">
            <h3>🛒 Ваш заказ</h3>
            <div className="cart-items">
              {selectedDishes.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">{item.price} ₽</span>
                  </div>
                  <div className="item-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Доставка */}
        <div className="delivery-section">
          <h3>🚚 Способ получения</h3>
          <div className="delivery-options">
            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={deliveryInfo.method === "delivery"}
                onChange={e => {
                  console.log("Delivery selected:", e.target.value);
                  setDeliveryInfo(prev => ({
                    ...prev,
                    method: e.target.value,
                  }));
                }}
              />
              <span>Доставка (+150 ₽)</span>
            </label>
            <label className="delivery-option">
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryInfo.method === "pickup"}
                onChange={e => {
                  console.log("Pickup selected:", e.target.value);
                  setDeliveryInfo(prev => ({
                    ...prev,
                    method: e.target.value,
                  }));
                }}
              />
              <span>Самовывоз</span>
            </label>
          </div>

          {deliveryInfo.method === "delivery" && (
            <div className="delivery-form">
              <div className="address-input-group">
                <input
                  type="text"
                  placeholder="Адрес доставки"
                  value={deliveryInfo.address}
                  onChange={e =>
                    setDeliveryInfo(prev => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="address-input"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="location-button"
                  title="Определить мое местоположение"
                >
                  {isGettingLocation ? (
                    <span className="loading-spinner">⟳</span>
                  ) : (
                    "📍"
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="time-selection">
            <div className="date-time-row">
              <select
                value={deliveryInfo.date}
                onChange={e =>
                  setDeliveryInfo(prev => ({ ...prev, date: e.target.value }))
                }
                className="date-select"
              >
                <option value="">Выберите дату</option>
                {getDeliveryTimeOptions()}
              </select>

              <select
                value={deliveryInfo.time}
                onChange={e =>
                  setDeliveryInfo(prev => ({ ...prev, time: e.target.value }))
                }
                className="time-select"
              >
                <option value="">Выберите время</option>
                {getTimeSlots()}
              </select>
            </div>
          </div>

          <textarea
            placeholder="Комментарий к заказу (необязательно)"
            value={deliveryInfo.comment}
            onChange={e =>
              setDeliveryInfo(prev => ({ ...prev, comment: e.target.value }))
            }
            className="comment-input"
          />
        </div>

        {/* Оплата */}
        <div className="payment-section">
          <h3>💳 Способ оплаты</h3>
          <div className="payment-options">
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentInfo.method === "card"}
                onChange={e => {
                  console.log("Card payment selected:", e.target.value);
                  setPaymentInfo(prev => ({ ...prev, method: e.target.value }));
                }}
              />
              <span>💳 Банковская карта</span>
            </label>
            <label className="payment-option">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentInfo.method === "cash"}
                onChange={e => {
                  console.log("Cash payment selected:", e.target.value);
                  setPaymentInfo(prev => ({ ...prev, method: e.target.value }));
                }}
              />
              <span>💵 Наличными при получении</span>
            </label>
          </div>

          {/* Данные карты (если выбрана карта) */}
          {paymentInfo.method === "card" && (
            <div className="card-form">
              <h4>Данные карты</h4>
              <div className="card-form-row">
                <input
                  type="text"
                  placeholder="Номер карты"
                  value={paymentInfo.cardData.number}
                  onChange={e =>
                    setPaymentInfo(prev => ({
                      ...prev,
                      cardData: {
                        ...prev.cardData,
                        number: formatCardNumber(e.target.value),
                      },
                    }))
                  }
                  className="card-input"
                  maxLength="19"
                  required
                />
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentInfo.cardData.expiry}
                  onChange={e =>
                    setPaymentInfo(prev => ({
                      ...prev,
                      cardData: {
                        ...prev.cardData,
                        expiry: formatExpiry(e.target.value),
                      },
                    }))
                  }
                  className="card-input"
                  maxLength="5"
                  required
                />
              </div>
              <div className="card-form-row">
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentInfo.cardData.cvv}
                  onChange={e =>
                    setPaymentInfo(prev => ({
                      ...prev,
                      cardData: {
                        ...prev.cardData,
                        cvv: e.target.value
                          .replace(/[^0-9]/g, "")
                          .substring(0, 3),
                      },
                    }))
                  }
                  className="card-input"
                  maxLength="3"
                  required
                />
                <input
                  type="text"
                  placeholder="Имя держателя"
                  value={paymentInfo.cardData.holderName}
                  onChange={e =>
                    setPaymentInfo(prev => ({
                      ...prev,
                      cardData: {
                        ...prev.cardData,
                        holderName: e.target.value.toUpperCase(),
                      },
                    }))
                  }
                  className="card-input"
                  required
                />
              </div>
            </div>
          )}
        </div>

        {/* Итого и кнопка заказа */}
        <div className="order-summary">
          <div className="total-breakdown">
            <div className="total-line">
              <span>Сумма заказа:</span>
              <span>
                {selectedDishes.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )}{" "}
                ₽
              </span>
            </div>
            {deliveryInfo.method === "delivery" && (
              <div className="total-line">
                <span>Доставка:</span>
                <span>150 ₽</span>
              </div>
            )}
            <div className="total-line total-final">
              <span>Итого:</span>
              <span>{calculateTotal()} ₽</span>
            </div>
          </div>

          <div className="quick-order-buttons">
            <button
              onClick={() => navigate("/client/menu")}
              disabled={loading}
              className="back-to-menu-button"
            >
              ← Вернуться в меню
            </button>
            <button
              onClick={handleOrder}
              disabled={loading || selectedDishes.length === 0}
              className="order-button"
            >
              {loading
                ? "Оформляем заказ..."
                : `Заказать за ${calculateTotal()} ₽`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrder;
