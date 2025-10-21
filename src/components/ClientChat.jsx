import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useToast } from "../contexts/ToastContext";

const ClientChat = () => {
  // Ограничения и безопасное сохранение истории чата в localStorage
  const CHAT_MAX_MESSAGES = 150; // держим только последние N сообщений
  const safeSaveChat = (
    chatKey,
    messagesToSave,
    notify = true,
    showErrorFn,
    showSuccessFn
  ) => {
    // сначала ограничиваем длину массива
    let payload = Array.isArray(messagesToSave)
      ? messagesToSave.slice(
          Math.max(0, messagesToSave.length - CHAT_MAX_MESSAGES)
        )
      : [];

    try {
      localStorage.setItem(chatKey, JSON.stringify(payload));
    } catch (err) {
      // Попытка почистить тяжелые поля (изображения), если переполнено хранилище
      if (err && (err.name === "QuotaExceededError" || err.code === 22)) {
        try {
          const withoutImages = payload.map((m) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp,
          }));
          localStorage.setItem(chatKey, JSON.stringify(withoutImages));
          if (notify && typeof showErrorFn === "function") {
            showErrorFn(
              "История чата частично сохранена без изображений (недостаточно памяти браузера)"
            );
          }
        } catch (err2) {
          // Финальный фоллбек — очищаем самый старый ключ чата этого клиента
          try {
            if (notify && typeof showErrorFn === "function") {
              showErrorFn(
                "Недостаточно памяти для сохранения истории. Самые старые сообщения будут удалены."
              );
            }
          } catch (_) {}
        }
      } else {
        // Другая ошибка сохранения
        console.error("Error saving chat to localStorage:", err);
        if (notify && typeof showErrorFn === "function") {
          showErrorFn("Не удалось сохранить историю чата");
        }
      }
    }
  };
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chefs, setChefs] = useState([]);
  const [selectedChef, setSelectedChef] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { socket } = useWebSocket();
  const { showSuccess, showError } = useToast();
  const clientId = localStorage.getItem("clientId") || "demo_client";

  // Прокрутка чата вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(
    async (chefId) => {
      setLoading(true);
      try {
        // Загружаем историю сообщений из localStorage
        const chatKey = `chat_${clientId}_${chefId}`;
        const savedMessages = JSON.parse(localStorage.getItem(chatKey) || "[]");
        setMessages(savedMessages);
        localStorage.setItem("selectedChefId", chefId);
      } catch (err) {
        console.error("Error loading messages:", err);
        setError(err.message || "Произошла ошибка при загрузке сообщений");
      } finally {
        setLoading(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!token || role !== "client") {
      navigate("/client/login");
      return;
    }

    // Загрузка списка поваров и истории сообщений
    const fetchData = async () => {
      try {
        // Здесь будет API запрос для получения списка поваров
        // const chefsResponse = await fetch('api/client/chefs', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const chefsData = await chefsResponse.json();
        // if (!chefsResponse.ok) throw new Error(chefsData.message || 'Ошибка при загрузке списка поваров');
        // setChefs(chefsData);

        // Временные данные для демонстрации
        const mockChefs = [
          { id: 1, name: "Иван Иванов", avatar: "👨‍🍳", rating: 4.8 },
          { id: 2, name: "Мария Петрова", avatar: "👩‍🍳", rating: 4.9 },
          { id: 3, name: "Алексей Смирнов", avatar: "👨‍🍳", rating: 4.7 },
        ];

        setChefs(mockChefs);

        // Если есть сохраненный выбранный повар, загружаем историю сообщений
        const savedChefId = localStorage.getItem("selectedChefId");
        if (savedChefId) {
          const chef = mockChefs.find((c) => c.id === parseInt(savedChefId));
          if (chef) {
            setSelectedChef(chef);
            loadMessages(chef.id);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Произошла ошибка при загрузке данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket обработчики
  useEffect(() => {
    if (socket && selectedChef) {
      // Присоединяемся к комнате чата
      socket.emit("joinChatRoom", { clientId, chefId: selectedChef.id });

      // Слушаем входящие сообщения
      const handleNewMessage = (data) => {
        if (data.from === selectedChef.id) {
          const newMsg = {
            id: Date.now(),
            sender: "chef",
            text: data.message,
            timestamp: new Date().toISOString(),
            image: data.image,
          };
          setMessages((prev) => {
            const updated = [...prev, newMsg];
            const chatKey = `chat_${clientId}_${selectedChef.id}`;
            safeSaveChat(chatKey, updated, true, showError);
            return updated;
          });
          setIsTyping(false);
        }
      };

      // Слушаем индикатор печати
      const handleTyping = (data) => {
        if (data.from === selectedChef.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      };

      socket.on("chatMessage", handleNewMessage);
      socket.on("typing", handleTyping);

      return () => {
        socket.off("chatMessage", handleNewMessage);
        socket.off("typing", handleTyping);
        socket.emit("leaveChatRoom", { clientId, chefId: selectedChef.id });
      };
    }
  }, [socket, selectedChef, clientId, showError]);

  // Выбор повара для чата
  const handleSelectChef = (chef) => {
    setSelectedChef(chef);
    loadMessages(chef.id);
  };

  // Обработка загрузки изображения
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Можно загружать только изображения");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("Размер файла не должен превышать 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Обработка индикатора печати
  const handleTypingIndicator = () => {
    if (socket && selectedChef) {
      socket.emit("typing", { to: selectedChef.id, from: clientId });
    }
  };

  // Отправка нового сообщения
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedChef) return;

    try {
      const newMsg = {
        id: Date.now(),
        sender: "client",
        text: newMessage.trim(),
        timestamp: new Date().toISOString(),
        image: selectedImage,
      };

      // Сохраняем в state и localStorage
      setMessages((prev) => {
        const updated = [...prev, newMsg];
        const chatKey = `chat_${clientId}_${selectedChef.id}`;
        safeSaveChat(chatKey, updated, true, showError);
        return updated;
      });

      // Отправляем через WebSocket
      if (socket) {
        socket.emit("sendChatMessage", {
          to: selectedChef.id,
          from: clientId,
          message: newMessage.trim(),
          image: selectedImage,
        });
      }

      setNewMessage("");
      setSelectedImage(null);
      showSuccess("Сообщение отправлено");
    } catch (err) {
      console.error("Error sending message:", err);
      showError("Ошибка при отправке сообщения");
    }
  };

  // Форматирование времени сообщения
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  if (loading && !selectedChef) {
    return <div className="loading">Загрузка чата...</div>;
  }

  if (error && !selectedChef) {
    return (
      <div className="error-container">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="client-chat-container">
      <h1>Чат с поваром</h1>

      <div className="chat-layout">
        <div className="chefs-sidebar">
          <h2>Повара</h2>
          <div className="chefs-list">
            {chefs.map((chef) => (
              <div
                key={chef.id}
                className={`chef-item ${
                  selectedChef?.id === chef.id ? "selected" : ""
                }`}
                onClick={() => handleSelectChef(chef)}
              >
                <div className="chef-avatar">{chef.avatar}</div>
                <div className="chef-info">
                  <div className="chef-name">{chef.name}</div>
                  <div className="chef-rating">⭐ {chef.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-main">
          {selectedChef ? (
            <>
              <div className="chat-header">
                <div className="chat-with">
                  <span>Чат с</span>
                  <strong>{selectedChef.name}</strong>
                </div>
                <div className="chef-status-info">
                  {isTyping ? (
                    <div className="typing-indicator">печатает...</div>
                  ) : (
                    <div className="chef-status online">В сети</div>
                  )}
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>У вас пока нет сообщений с этим поваром</p>
                    <p>Напишите сообщение, чтобы начать общение</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${
                          message.sender === "client" ? "outgoing" : "incoming"
                        }`}
                      >
                        <div className="message-content">
                          {message.image && (
                            <img
                              src={message.image}
                              alt="Вложение"
                              className="message-image"
                              style={{
                                maxWidth: "200px",
                                borderRadius: "8px",
                                marginBottom: "8px",
                              }}
                            />
                          )}
                          {message.text && (
                            <div className="message-text">{message.text}</div>
                          )}
                          <div className="message-time">
                            {formatMessageTime(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Превью изображения */}
              {selectedImage && (
                <div
                  style={{
                    padding: "10px 20px",
                    background: "#f8f9fa",
                    borderTop: "1px solid #e0e0e0",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={selectedImage}
                      alt="Превью"
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImage(null)}
                      style={{
                        position: "absolute",
                        top: "-8px",
                        right: "-8px",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="attach-button"
                  title="Прикрепить изображение"
                  style={{
                    background: "#2196F3",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    padding: "10px",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  📎
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTypingIndicator();
                  }}
                  placeholder="Введите сообщение..."
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !selectedImage}
                  style={{
                    opacity: newMessage.trim() || selectedImage ? 1 : 0.5,
                    cursor:
                      newMessage.trim() || selectedImage
                        ? "pointer"
                        : "not-allowed",
                  }}
                >
                  Отправить
                </button>
              </form>
            </>
          ) : (
            <div className="select-chef-prompt">
              <div className="prompt-icon">💬</div>
              <h3>Выберите повара для начала общения</h3>
              <p>Выберите повара из списка слева, чтобы начать чат</p>
            </div>
          )}
        </div>
      </div>

      <div className="chat-actions">
        <button
          onClick={() => navigate("/client/menu")}
          className="back-to-menu-button"
        >
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default ClientChat;
