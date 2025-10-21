import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "../contexts/ToastContext";
import "../App.css";

const HelpGuestBidding = ({ request, onClose, isChef = false }) => {
  const { showSuccess, showError } = useToast();
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState({
    price: request?.budget || 0,
    message: "",
    estimatedTime: "",
    specialOffers: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBids();
  }, [loadBids]);

  useEffect(() => {
    // Создаем тестовые заявки для демонстрации (только для клиентов)
    if (!isChef && bids.length === 0 && request) {
      createDemoBids();
    }
  }, [isChef, request, bids.length, createDemoBids]);

  const createDemoBids = useCallback(() => {
    const demoBids = [
      {
        id: `bid_${Date.now()}_1`,
        chefId: "demo-chef-1",
        chefName: "Анна Петрова",
        chefAvatar: "👩‍🍳",
        price: 4500,
        message:
          "Готовлю русскую кухню уже 10 лет. Сделаю ваш праздник незабываемым!",
        estimatedTime: "3-4 часа",
        specialOffers: "Бесплатная доставка ингредиентов, десерт в подарок",
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 час назад
        status: "pending",
      },
      {
        id: `bid_${Date.now()}_2`,
        chefId: "demo-chef-2",
        chefName: "Махмуд Алиев",
        chefAvatar: "👨‍🍳",
        price: 4200,
        message:
          "Специализируюсь на узбекской кухне. Приготовлю настоящий плов и самсу!",
        estimatedTime: "2-3 часа",
        specialOffers: "Скидка 10% при заказе от 5000₽",
        createdAt: new Date(Date.now() - 1800000).toISOString(), // 30 минут назад
        status: "pending",
      },
    ];

    setBids(demoBids);
    saveBids(demoBids);
  }, [saveBids]);

  const loadBids = useCallback(() => {
    try {
      const savedBids = JSON.parse(
        localStorage.getItem(`helpGuestBids_${request.id}`) || "[]"
      );
      setBids(savedBids);
    } catch (error) {
      console.error("Error loading bids:", error);
    }
  }, [request.id]);

  const saveBids = useCallback(
    (updatedBids) => {
      try {
        localStorage.setItem(
          `helpGuestBids_${request.id}`,
          JSON.stringify(updatedBids)
        );
      } catch (error) {
        console.error("Error saving bids:", error);
      }
    },
    [request.id]
  );

  const handleSubmitBid = () => {
    if (!newBid.price || newBid.price <= 0) {
      showError("Укажите корректную цену");
      return;
    }

    setLoading(true);

    try {
      const bid = {
        id: `bid_${Date.now()}`,
        chefId: localStorage.getItem("chefId") || "demo-chef-1",
        chefName: localStorage.getItem("chefName") || "Повар",
        chefAvatar: localStorage.getItem("chefAvatar") || "👨‍🍳",
        price: parseInt(newBid.price),
        message: newBid.message,
        estimatedTime: newBid.estimatedTime,
        specialOffers: newBid.specialOffers,
        createdAt: new Date().toISOString(),
        status: "pending", // pending, accepted, rejected
      };

      const updatedBids = [...bids, bid];
      setBids(updatedBids);
      saveBids(updatedBids);

      // Уведомляем клиента о новой заявке
      const clientNotification = {
        id: `notification_${Date.now()}`,
        type: "help_guest_bid",
        title: "Новая заявка от повара",
        message: `${bid.chefName} предложил свою цену: ${bid.price}₽`,
        requestId: request.id,
        chefId: bid.chefId,
        chefName: bid.chefName,
        price: bid.price,
        createdAt: new Date().toISOString(),
        read: false,
      };

      const clientNotifications = JSON.parse(
        localStorage.getItem("clientNotifications") || "[]"
      );
      clientNotifications.unshift(clientNotification);
      localStorage.setItem(
        "clientNotifications",
        JSON.stringify(clientNotifications)
      );

      // Отправляем событие
      window.dispatchEvent(
        new CustomEvent("clientNotificationAdded", {
          detail: clientNotification,
        })
      );

      setNewBid({
        price: request?.budget || 0,
        message: "",
        estimatedTime: "",
        specialOffers: "",
      });

      showSuccess("Заявка отправлена клиенту");
    } catch (error) {
      console.error("Error submitting bid:", error);
      showError("Ошибка отправки заявки");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBid = (bidId) => {
    try {
      const updatedBids = bids.map((bid) =>
        bid.id === bidId
          ? { ...bid, status: "accepted" }
          : { ...bid, status: "rejected" }
      );

      setBids(updatedBids);
      saveBids(updatedBids);

      // Уведомляем повара о принятии заявки
      const acceptedBid = updatedBids.find((bid) => bid.id === bidId);
      const chefNotification = {
        id: `notification_${Date.now()}`,
        type: "help_guest_bid_accepted",
        title: "Заявка принята!",
        message: `Клиент принял вашу заявку на ${acceptedBid.price}₽`,
        requestId: request.id,
        clientId: request.clientId,
        price: acceptedBid.price,
        createdAt: new Date().toISOString(),
        read: false,
      };

      const chefNotifications = JSON.parse(
        localStorage.getItem("chefNotifications") || "[]"
      );
      chefNotifications.unshift(chefNotification);
      localStorage.setItem(
        "chefNotifications",
        JSON.stringify(chefNotifications)
      );

      window.dispatchEvent(
        new CustomEvent("chefNotificationAdded", {
          detail: chefNotification,
        })
      );

      showSuccess("Заявка принята! Повар уведомлен");
    } catch (error) {
      console.error("Error accepting bid:", error);
      showError("Ошибка принятия заявки");
    }
  };

  const handleRejectBid = (bidId) => {
    try {
      const updatedBids = bids.map((bid) =>
        bid.id === bidId ? { ...bid, status: "rejected" } : bid
      );

      setBids(updatedBids);
      saveBids(updatedBids);
      showSuccess("Заявка отклонена");
    } catch (error) {
      console.error("Error rejecting bid:", error);
      showError("Ошибка отклонения заявки");
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="help-guest-bidding-overlay" onClick={onClose}>
      <div
        className="help-guest-bidding-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="help-guest-bidding-header">
          <h3>💰 Торги по запросу</h3>
          <button onClick={onClose} className="back-button">
            ✕
          </button>
        </div>

        <div className="help-guest-bidding-content">
          {/* Информация о запросе */}
          <div className="request-info">
            <h4>📋 Детали запроса</h4>
            <div className="request-details">
              <p>
                <strong>Бюджет клиента:</strong> {request.budget}₽
              </p>
              <p>
                <strong>Дата мероприятия:</strong>{" "}
                {new Date(request.eventDate).toLocaleDateString("ru-RU")}
              </p>
              <p>
                <strong>Количество гостей:</strong> {request.guestCount}
              </p>
              <p>
                <strong>Адрес:</strong> {request.address}
              </p>
              {request.specialRequests && (
                <p>
                  <strong>Особые пожелания:</strong> {request.specialRequests}
                </p>
              )}
            </div>
          </div>

          {/* Форма подачи заявки (для поваров) */}
          {isChef && (
            <div className="bid-form">
              <h4>💡 Подать заявку</h4>
              <div className="form-group">
                <label>Ваша цена (₽):</label>
                <input
                  type="number"
                  value={newBid.price}
                  onChange={(e) =>
                    setNewBid((prev) => ({ ...prev, price: e.target.value }))
                  }
                  min="1"
                  placeholder="Укажите вашу цену"
                />
              </div>

              <div className="form-group">
                <label>Время выполнения:</label>
                <input
                  type="text"
                  value={newBid.estimatedTime}
                  onChange={(e) =>
                    setNewBid((prev) => ({
                      ...prev,
                      estimatedTime: e.target.value,
                    }))
                  }
                  placeholder="Например: 2-3 часа"
                />
              </div>

              <div className="form-group">
                <label>Сообщение клиенту:</label>
                <textarea
                  value={newBid.message}
                  onChange={(e) =>
                    setNewBid((prev) => ({ ...prev, message: e.target.value }))
                  }
                  placeholder="Расскажите о своем опыте и подходе..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Специальные предложения:</label>
                <textarea
                  value={newBid.specialOffers}
                  onChange={(e) =>
                    setNewBid((prev) => ({
                      ...prev,
                      specialOffers: e.target.value,
                    }))
                  }
                  placeholder="Дополнительные услуги, скидки..."
                  rows={2}
                />
              </div>

              <button
                onClick={handleSubmitBid}
                className="submit-bid-btn"
                disabled={loading}
              >
                {loading ? "Отправка..." : "📤 Отправить заявку"}
              </button>
            </div>
          )}

          {/* Список заявок */}
          <div className="bids-list">
            <h4>📊 Заявки поваров</h4>
            {bids.length === 0 ? (
              <div className="no-bids">
                <p>Пока нет заявок от поваров</p>
              </div>
            ) : (
              <div className="bids-container">
                {bids.map((bid) => (
                  <div key={bid.id} className={`bid-card ${bid.status}`}>
                    <div className="bid-header">
                      <div className="chef-info">
                        <span className="chef-avatar">{bid.chefAvatar}</span>
                        <div>
                          <h5>{bid.chefName}</h5>
                          <p className="bid-time">
                            {formatTime(bid.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="bid-price">
                        <span className="price">{bid.price}₽</span>
                        <span className={`status ${bid.status}`}>
                          {bid.status === "pending" && "⏳ Ожидает"}
                          {bid.status === "accepted" && "✅ Принята"}
                          {bid.status === "rejected" && "❌ Отклонена"}
                        </span>
                      </div>
                    </div>

                    <div className="bid-details">
                      {bid.estimatedTime && (
                        <p>
                          <strong>Время:</strong> {bid.estimatedTime}
                        </p>
                      )}
                      {bid.message && (
                        <p>
                          <strong>Сообщение:</strong> {bid.message}
                        </p>
                      )}
                      {bid.specialOffers && (
                        <p>
                          <strong>Предложения:</strong> {bid.specialOffers}
                        </p>
                      )}
                    </div>

                    {!isChef && bid.status === "pending" && (
                      <div className="bid-actions">
                        <button
                          onClick={() => handleAcceptBid(bid.id)}
                          className="accept-btn"
                        >
                          ✅ Принять
                        </button>
                        <button
                          onClick={() => handleRejectBid(bid.id)}
                          className="reject-btn"
                        >
                          ❌ Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpGuestBidding;
