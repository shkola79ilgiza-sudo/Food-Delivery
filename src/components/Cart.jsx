import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import SmartCart from "./SmartCart";
import PromoCodeSystem from "./PromoCodeSystem";
import LoyaltySystem from "./LoyaltySystem";
import ComplaintSystem from "./ComplaintSystem";
import DeliveryOptions from "./DeliveryOptions";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [showPromoSystem, setShowPromoSystem] = useState(false);
  const [showLoyaltySystem, setShowLoyaltySystem] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState({
    option: "pickup",
    fee: 0,
    estimatedTime: "15-30 мин",
    address: "",
    radius: 10,
  });
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess } = useToast();

  // Загрузка корзины из localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        console.log("=== LOAD CART FUNCTION CALLED ===");
        const savedCart = localStorage.getItem("cart");
        console.log("Loading cart from localStorage:", savedCart);

        if (savedCart && savedCart !== "null" && savedCart !== "undefined") {
          const parsedCart = JSON.parse(savedCart);
          console.log("Parsed cart:", parsedCart);
          console.log("Parsed cart length:", parsedCart.length);

          // Проверяем, что это массив
          if (Array.isArray(parsedCart)) {
            setCart(parsedCart);
            console.log("Cart state set to:", parsedCart);
          } else {
            console.error("Parsed cart is not an array:", parsedCart);
            setCart([]);
          }
        } else {
          console.log("No valid cart data in localStorage");
          setCart([]);
        }
        console.log("=== END LOAD CART FUNCTION ===");
      } catch (err) {
        console.error("Error loading cart from localStorage:", err);
        setCart([]);
        // Очищаем поврежденные данные
        localStorage.removeItem("cart");
      }
    };

    // Загружаем корзину при инициализации
    loadCart();

    // Слушаем изменения через custom event (основной способ)
    const handleCustomStorageChange = () => {
      console.log("=== CUSTOM CART CHANGE EVENT RECEIVED ===");
      loadCart();
    };

    // Слушаем изменения в localStorage (для других вкладок)
    const handleStorageChange = (e) => {
      if (e.key === "cart") {
        console.log("Cart changed in localStorage, reloading...");
        loadCart();
      }
    };

    window.addEventListener("cartChanged", handleCustomStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("cartChanged", handleCustomStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // УБРАН автоматический useEffect для сохранения корзины
  // Корзина сохраняется явно в функциях updateQuantity, removeItem, clearCart и т.д.
  // Это предотвращает перезапись корзины пустым массивом при монтировании компонента

  // Проверка авторизации
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!token || role !== "client") {
      navigate("/client/login");
    }
  }, [navigate]);

  // Показ уведомления
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Изменение количества товара
  const updateQuantity = (id, change) => {
    setCart((prevCart) => {
      try {
        const updatedCart = prevCart.map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(1, item.quantity + change);
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        // Сохраняем в localStorage
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Отправляем событие для обновления других компонентов
        window.dispatchEvent(new CustomEvent("cartChanged"));
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        return updatedCart;
      } catch (error) {
        console.error("Error updating quantity:", error);
        return prevCart; // Возвращаем предыдущее состояние при ошибке
      }
    });
  };

  // Удаление товара из корзины
  const removeItem = (id) => {
    setCart((prevCart) => {
      try {
        const updatedCart = prevCart.filter((item) => item.id !== id);

        // Сохраняем в localStorage
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        // Отправляем событие для обновления других компонентов
        window.dispatchEvent(new CustomEvent("cartChanged"));
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        return updatedCart;
      } catch (error) {
        console.error("Error removing item:", error);
        return prevCart; // Возвращаем предыдущее состояние при ошибке
      }
    });
    showToast("Товар удален из корзины");
  };

  // Применение промокода
  const applyPromoCode = () => {
    // Демо-промокоды
    const promoCodes = {
      СКИДКА10: { discount: 0.1, description: "Скидка 10%" },
      СКИДКА20: { discount: 0.2, description: "Скидка 20%" },
      БЕСПЛАТНАЯ_ДОСТАВКА: {
        freeDelivery: true,
        description: "Бесплатная доставка",
      },
    };

    setPromoError("");

    if (!promoCode.trim()) {
      setPromoError("Введите промокод");
      return;
    }

    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo) {
      setAppliedPromo({
        ...promo,
        code: promoCode.toUpperCase(),
      });
      showToast(`Промокод ${promoCode.toUpperCase()} применен!`);
      setPromoCode("");
    } else {
      setPromoError("Недействительный промокод");
    }
  };

  // Отмена промокода
  const removePromoCode = () => {
    setAppliedPromo(null);
    showToast("Промокод отменен");
  };

  // Расчет стоимости доставки
  const deliveryCost = appliedPromo?.freeDelivery ? 0 : deliveryOption.fee;

  // Расчет суммы товаров
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Расчет скидки
  const discount = appliedPromo?.discount
    ? subtotal * appliedPromo.discount
    : 0;

  // Расчет итоговой суммы
  const total = subtotal - discount + deliveryCost;

  // Переход к оформлению заказа
  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Корзина пуста", "error");
      return;
    }

    // Сохраняем данные о скидке для оформления заказа
    if (appliedPromo) {
      localStorage.setItem("appliedPromo", JSON.stringify(appliedPromo));
    } else {
      localStorage.removeItem("appliedPromo");
    }

    navigate("/client/checkout");
  };

  // Отладочная информация
  console.log("=== CART DEBUG INFO ===");
  console.log("Cart component rendering, cart state:", cart);
  console.log("Cart length:", cart.length);
  console.log("localStorage cart raw:", localStorage.getItem("cart"));
  console.log(
    "localStorage cart parsed:",
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  console.log(
    "Cart items details:",
    cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      photo: item.photo,
      image: item.image,
    }))
  );
  console.log("All localStorage keys:", Object.keys(localStorage));
  console.log(
    "All localStorage values:",
    Object.keys(localStorage).map((key) => ({
      key,
      value: localStorage.getItem(key),
    }))
  );
  console.log("=== END CART DEBUG ===");

  const goToMenu = (e) => {
    try {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      navigate("/client/menu");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  return (
    <div
      className="cart-container"
      style={{
        background: `
        linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 25%, rgba(240, 147, 251, 0.6) 50%, rgba(245, 87, 108, 0.6) 75%, rgba(79, 172, 254, 0.6) 100%),
        url('/images/cart-background.jpg')
      `,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center",
        backgroundRepeat: "no-repeat, no-repeat",
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Декоративные элементы фона */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          left: "-150px",
          width: "400px",
          height: "400px",
          background: "rgba(255, 182, 193, 0.15)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "10%",
          width: "200px",
          height: "200px",
          background: "rgba(255, 218, 185, 0.2)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "20%",
          width: "150px",
          height: "150px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "50%",
          zIndex: 0,
        }}
      ></div>

      {/* Полки супермаркета */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          height: "60px",
          background:
            "linear-gradient(180deg, rgba(108, 117, 125, 0.1) 0%, rgba(108, 117, 125, 0.05) 100%)",
          borderBottom: "2px solid rgba(108, 117, 125, 0.2)",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: "60px",
          left: "0",
          right: "0",
          height: "40px",
          background:
            "linear-gradient(180deg, rgba(73, 80, 87, 0.08) 0%, rgba(73, 80, 87, 0.03) 100%)",
          zIndex: 0,
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          height: "50px",
          background:
            "linear-gradient(0deg, rgba(108, 117, 125, 0.1) 0%, rgba(108, 117, 125, 0.05) 100%)",
          borderTop: "2px solid rgba(108, 117, 125, 0.2)",
          zIndex: 0,
        }}
      ></div>

      {/* Продукты в тележке - декоративные элементы */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "10%",
          fontSize: "40px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(-15deg)",
        }}
      >
        🛒
      </div>
      <div
        style={{
          position: "absolute",
          top: "12%",
          right: "15%",
          fontSize: "30px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(10deg)",
        }}
      >
        🍎
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "30%",
          left: "8%",
          fontSize: "28px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(-20deg)",
        }}
      >
        🥖
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          right: "12%",
          fontSize: "32px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(15deg)",
        }}
      >
        🥛
      </div>
      <div
        style={{
          position: "absolute",
          top: "65%",
          left: "5%",
          fontSize: "26px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(-10deg)",
        }}
      >
        🥕
      </div>
      <div
        style={{
          position: "absolute",
          top: "75%",
          right: "8%",
          fontSize: "24px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(20deg)",
        }}
      >
        🧀
      </div>
      <div
        style={{
          position: "absolute",
          top: "25%",
          left: "15%",
          fontSize: "22px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(-5deg)",
        }}
      >
        🍌
      </div>
      <div
        style={{
          position: "absolute",
          top: "45%",
          right: "20%",
          fontSize: "28px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(25deg)",
        }}
      >
        🥚
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "40%",
          left: "20%",
          fontSize: "26px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(-25deg)",
        }}
      >
        🍞
      </div>
      <div
        style={{
          position: "absolute",
          top: "35%",
          right: "5%",
          fontSize: "30px",
          opacity: 0.4,
          zIndex: 0,
          transform: "rotate(30deg)",
        }}
      >
        🥔
      </div>

      {/* Основной контент */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(15px)",
          borderRadius: "20px",
          margin: "20px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          overflow: "hidden",
        }}
      >
        {toast.show && (
          <div className={`toast ${toast.type}`}>{toast.message}</div>
        )}

        <header
          className="cart-header"
          style={{
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%)",
            backdropFilter: "blur(20px)",
            padding: "25px 30px",
            borderRadius: "0",
            margin: "0",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
            border: "none",
            borderBottom: "3px solid rgba(102, 126, 234, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#2c3e50",
              fontSize: "28px",
              fontWeight: "bold",
              textShadow: "2px 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            🛒 {t.cart}
          </h1>
          <div
            className="cart-actions"
            style={{ display: "flex", gap: "10px" }}
          >
            <button
              onClick={() => {
                const savedCart = JSON.parse(
                  localStorage.getItem("cart") || "[]"
                );
                setCart(savedCart);
                console.log("Manual cart refresh:", savedCart);
              }}
              className="refresh-cart-button"
              style={{
                background: "linear-gradient(135deg, #4facfe, #00f2fe)",
                color: "white",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 4px 15px rgba(79, 172, 254, 0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(79, 172, 254, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(79, 172, 254, 0.3)";
              }}
            >
              🔄 {t.refresh}
            </button>
            <button
              onClick={() => {
                console.log("=== MANUAL CART CHECK ===");
                const savedCart = JSON.parse(
                  localStorage.getItem("cart") || "[]"
                );
                console.log("Manual check - savedCart:", savedCart);
                console.log(
                  "Manual check - savedCart length:",
                  savedCart.length
                );
                console.log("Manual check - current cart state:", cart);
                console.log("Manual check - current cart length:", cart.length);
                console.log("=== END MANUAL CART CHECK ===");
                alert(
                  `В localStorage: ${savedCart.length} товаров\nВ состоянии: ${cart.length} товаров`
                );
              }}
              className="refresh-cart-button"
            >
              🔍 {t.checkData}
            </button>
            <button
              onClick={() => {
                localStorage.clear();
                setCart([]);
                console.log("localStorage cleared!");
                alert("localStorage очищен! Страница будет обновлена.");
                window.location.reload();
              }}
              className="clear-storage-button"
            >
              🗑️ {t.clearAll}
            </button>
            <a
              href="/client/menu"
              className="back-to-menu"
              onClick={(e) => {
                e.stopPropagation();
              }}
              style={{
                background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                color: "white",
                textDecoration: "none",
                padding: "10px 18px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 6px 20px rgba(255, 107, 107, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow =
                  "0 4px 15px rgba(255, 107, 107, 0.3)";
              }}
            >
              ← {t.backToMenu}
            </a>
          </div>
        </header>

        {/* Умная корзина */}
        <SmartCart
          cart={cart}
          onAddToCart={(item) => {
            const newCart = [...cart, item];
            setCart(newCart);
            localStorage.setItem("cart", JSON.stringify(newCart));
            showSuccess(`${item.name} добавлен в корзину!`);
          }}
          onRemoveFromCart={(itemId) => {
            const newCart = cart.filter((item) => item.id !== itemId);
            setCart(newCart);
            localStorage.setItem("cart", JSON.stringify(newCart));
            showSuccess("Товар удален из корзины!");
          }}
        />

        {/* Система промокодов */}
        {cart.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowPromoSystem(!showPromoSystem)}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: showPromoSystem ? "#e74c3c" : "#3498db",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              <span>🎟️ Промокоды и акции</span>
              <span>{showPromoSystem ? "▼" : "▶"}</span>
            </button>

            {showPromoSystem && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  background: "rgba(52, 152, 219, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(52, 152, 219, 0.2)",
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <PromoCodeSystem
                  onPromoApplied={(promo) => {
                    setAppliedPromo(promo);
                    console.log("Promo applied:", promo);
                  }}
                  cartTotal={cart.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Система лояльности */}
        {cart.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={() => setShowLoyaltySystem(!showLoyaltySystem)}
              style={{
                width: "100%",
                padding: "12px 20px",
                background: showLoyaltySystem ? "#e74c3c" : "#9b59b6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              <span>⭐ Система лояльности</span>
              <span>{showLoyaltySystem ? "▼" : "▶"}</span>
            </button>

            {showLoyaltySystem && (
              <div
                style={{
                  marginTop: "10px",
                  padding: "15px",
                  background: "rgba(155, 89, 182, 0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(155, 89, 182, 0.2)",
                  animation: "fadeIn 0.3s ease-in-out",
                }}
              >
                <LoyaltySystem
                  onBonusApplied={(bonusData) => {
                    console.log("Bonus applied:", bonusData);
                  }}
                  cartTotal={cart.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                  )}
                />
              </div>
            )}
          </div>
        )}

        {/* Опции доставки */}
        {cart.length > 0 && (
          <DeliveryOptions
            order={{
              id: "demo-order",
              items: cart,
              total: cart.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              ),
            }}
            onDeliveryOptionChange={(option) => {
              setDeliveryOption(option);
              console.log("Delivery option changed:", option);
            }}
          />
        )}

        {cart.length === 0 ? (
          <div className="empty-cart">
            <h2>{t.cartEmpty}</h2>
            <p>{t.cartEmptyDesc}</p>
            <a
              href="/client/menu"
              className="continue-shopping"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              {t.goToMenu}
            </a>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              <h2>{t.itemsInCart}</h2>
              {cart.map((item) => (
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
                    {item.type === "product" && (
                      <p className="item-type">🛒 Продукт фермерского рынка</p>
                    )}
                    {item.type === "dish" && (
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
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      +
                    </button>
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
                      <strong>{appliedPromo.code}</strong>:{" "}
                      {appliedPromo.description}
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

              <a
                href="/client/menu"
                className="continue-shopping"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {t.continueShopping}
              </a>

              {/* Кнопка отладки */}
              <div
                style={{
                  marginTop: "20px",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                }}
              >
                <h4>Отладка корзины</h4>
                <p>Количество товаров в корзине: {cart.length}</p>
                <p>
                  localStorage cart:{" "}
                  {localStorage.getItem("cart") ? "Есть данные" : "Пусто"}
                </p>
                <button
                  onClick={() => {
                    console.log("=== CART DEBUG INFO ===");
                    console.log("Cart state:", cart);
                    console.log(
                      "localStorage cart:",
                      localStorage.getItem("cart")
                    );
                    console.log("Cart length:", cart.length);
                    console.log("=== END CART DEBUG ===");
                  }}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                >
                  Логи в консоль
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("cart");
                    setCart([]);
                    alert("Корзина очищена!");
                  }}
                  style={{
                    padding: "5px 10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                  }}
                >
                  Очистить корзину
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
