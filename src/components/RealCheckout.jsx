import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
// import { ordersAPI } from "../api/backend"; // Не используется в этом компоненте
import { useToast } from "../contexts/ToastContext";
import "./RealCheckout.css";

const RealCheckout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holderName: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Загрузка корзины
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
    console.log("🛒 Загружена корзина:", savedCart);
    setCart(savedCart);

    // Загружаем адрес из профиля клиента
    if (user?.client?.address) {
      setDeliveryAddress(user.client.address);
    }
  }, [user]);

  // Форматирование номера карты
  const formatCardNumber = (value) => {
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
  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  // Функция для получения текущего местоположения
  const getCurrentLocation = () => {
    console.log("🔍 getCurrentLocation вызвана в RealCheckout");

    if (!navigator.geolocation) {
      showError("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Используем Nominatim API для получения адреса по координатам
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
          );

          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              setDeliveryAddress(data.display_name);
              showSuccess("Адрес определен автоматически!");
            } else {
              setDeliveryAddress(
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
              );
              showSuccess("Координаты получены!");
            }
          } else {
            // Fallback - используем координаты
            setDeliveryAddress(
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            );
            showSuccess("Координаты получены!");
          }
        } catch (error) {
          console.error("Ошибка получения адреса:", error);
          const { latitude, longitude } = position.coords;
          setDeliveryAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          showSuccess("Координаты получены!");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
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

  // Расчет суммы
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const platformFee = subtotal * 0.1;
  const total = subtotal + platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showError("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      showError("Корзина пуста");
      return;
    }

    setLoading(true);

    try {
      // Создаем заказ через backend API
      const orderData = {
        items: cart.map((item) => ({
          dishId: item.id,
          quantity: item.quantity,
          notes: item.notes || "",
        })),
        deliveryAddress,
        notes,
        paymentMethod,
        paymentData: paymentMethod === "card" ? cardData : null,
        totalAmount: total,
        platformFee: platformFee,
        chefAmount: subtotal, // Сумма, которую получит повар
      };

      // Mock API call - имитируем задержку сети
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Создаем mock заказ
      const mockOrder = {
        id: `ORDER-${Date.now()}`,
        orderNumber: `#${Math.floor(Math.random() * 10000)}`,
        status: "pending",
        createdAt: new Date().toISOString(),
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: orderData.paymentMethod,
        platformFee: orderData.platformFee,
        chefAmount: orderData.chefAmount,
      };

      console.log("✅ Заказ создан:", mockOrder);

      // Очищаем корзину
      localStorage.removeItem("cart");
      setCart([]);

      showSuccess("Заказ успешно создан!");

      // Перенаправляем на страницу подтверждения
      navigate("/client/order-confirmation", {
        state: {
          order: mockOrder,
        },
      });
    } catch (error) {
      console.error("Error creating order:", error);
      showError(error.message || "Ошибка при создании заказа");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>🛒 Корзина пуста</h2>
          <p>Добавьте блюда из меню</p>
          <button onClick={() => navigate("/client/menu")}>
            Перейти в меню
          </button>
        </div>
      </div>
    );
  }

  console.log(
    "🔍 RealCheckout render - cart:",
    cart,
    "paymentMethod:",
    paymentMethod
  );

  return (
    <div className="checkout-container">
      <div className="checkout-card">
        <h1>🛒 Оформление заказа</h1>

        {/* Список блюд */}
        <div className="order-items">
          <h2>Ваш заказ:</h2>
          {cart.map((item, index) => (
            <div key={index} className="order-item">
              <div className="item-info">
                <h3>{item.name}</h3>
                <p>Количество: {item.quantity}</p>
                {item.notes && (
                  <p className="item-notes">Примечание: {item.notes}</p>
                )}
              </div>
              <div className="item-price">{item.price * item.quantity}₽</div>
            </div>
          ))}
        </div>

        {/* Форма доставки */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Адрес доставки:</label>
            <div className="address-input-group">
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="ул. Пушкина, д. 10, кв. 5"
                required
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

          <div className="form-group">
            <label>Комментарий к заказу:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Позвоните за 10 минут до доставки..."
              rows="3"
            />
          </div>

          {/* Способ оплаты */}
          <div className="form-group">
            <label>Способ оплаты:</label>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-label">💳 Банковская карта</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="payment-label">
                  💵 Наличными при получении
                </span>
              </label>
            </div>
          </div>

          {/* Данные карты (если выбрана карта) */}
          {paymentMethod === "card" && (
            <div className="card-form">
              <h3>Данные карты</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Номер карты:</label>
                  <input
                    type="text"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData((prev) => ({
                        ...prev,
                        number: formatCardNumber(e.target.value),
                      }))
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Срок действия:</label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) =>
                      setCardData((prev) => ({
                        ...prev,
                        expiry: formatExpiry(e.target.value),
                      }))
                    }
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>CVV:</label>
                  <input
                    type="text"
                    value={cardData.cvv}
                    onChange={(e) =>
                      setCardData((prev) => ({ ...prev, cvv: e.target.value }))
                    }
                    placeholder="123"
                    maxLength="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Имя держателя:</label>
                  <input
                    type="text"
                    value={cardData.holderName}
                    onChange={(e) =>
                      setCardData((prev) => ({
                        ...prev,
                        holderName: e.target.value,
                      }))
                    }
                    placeholder="IVAN IVANOV"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Итого */}
          <div className="order-summary">
            <div className="summary-row">
              <span>Сумма заказа:</span>
              <span>{subtotal}₽</span>
            </div>
            <div className="summary-row">
              <span>Комиссия платформы (10%):</span>
              <span>{platformFee.toFixed(0)}₽</span>
            </div>
            <div className="summary-row total">
              <span>Итого:</span>
              <span>{total.toFixed(0)}₽</span>
            </div>
          </div>

          <div className="checkout-buttons">
            <button
              type="button"
              onClick={() => navigate("/client/menu")}
              className="back-button"
              disabled={loading}
            >
              ← Вернуться в меню
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Оформление..." : "Оформить заказ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RealCheckout;
