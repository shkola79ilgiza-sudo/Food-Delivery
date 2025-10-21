import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AdminChefs = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const loadChefs = useCallback(() => {
    setLoading(true);

    // Загружаем всех пользователей с ролью chef
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const chefUsers = allUsers.filter((user) => user.role === "chef");

    // Загружаем статистику по заказам для каждого повара
    const orders = JSON.parse(localStorage.getItem("clientOrders") || "[]");

    const chefsWithStats = chefUsers.map((chef) => {
      const chefOrders = orders.filter((order) => order.chefId === chef.email);
      const totalRevenue = chefOrders.reduce(
        (sum, order) => sum + (order.payment?.total || 0),
        0
      );
      const completedOrders = chefOrders.filter(
        (order) => order.status === "delivered"
      ).length;

      return {
        ...chef,
        totalOrders: chefOrders.length,
        totalRevenue,
        completedOrders,
        rating: calculateChefRating(chef.email),
      };
    });

    setChefs(chefsWithStats);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/admin/login");
      return;
    }

    loadChefs();
  }, [navigate, loadChefs]);

  const calculateChefRating = (chefEmail) => {
    const reviews = JSON.parse(localStorage.getItem("chefReviews") || "[]");
    const chefReviews = reviews.filter((review) => review.chefId === chefEmail);

    if (chefReviews.length === 0) return 0;

    const totalRating = chefReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return (totalRating / chefReviews.length).toFixed(1);
  };

  const handleChefClick = (chef) => {
    setSelectedChef(chef);
    setShowModal(true);
  };

  const handleBlockChef = (chefEmail) => {
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedUsers = allUsers.map((user) =>
      user.email === chefEmail ? { ...user, blocked: !user.blocked } : user
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    loadChefs();
  };

  const allDocumentsUploaded = (chef) => {
    return (
      chef.documents?.passport &&
      chef.documents?.healthBook &&
      chef.documents?.selfEmployment &&
      chef.documents?.kitchenCertificate &&
      chef.documents?.kitchenPhotos?.length > 0 &&
      chef.documents?.dishPhotos?.length >= 4
    );
  };

  const handleVerifyDocuments = (chefEmail, approved) => {
    const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const updatedUsers = allUsers.map((user) =>
      user.email === chefEmail
        ? {
            ...user,
            documentsVerified: approved,
            documentsVerifiedAt: new Date().toISOString(),
            documentsVerifiedBy: "admin",
            verified: approved,
          }
        : user
    );
    localStorage.setItem("allUsers", JSON.stringify(updatedUsers));
    loadChefs();

    if (approved) {
      alert("Документы повара одобрены! Повар может начать работу.");
    } else {
      alert("Документы повара отклонены! Требуется доработка.");
    }
  };

  const handleRequestDocuments = (chefEmail) => {
    const chef = chefs.find((c) => c.email === chefEmail);
    if (!chef) return;

    const missingDocs = [];
    if (!chef.documents?.passport)
      missingDocs.push("Паспорт/Удостоверение личности");
    if (!chef.documents?.healthBook) missingDocs.push("Медкнижка");
    if (!chef.documents?.selfEmployment)
      missingDocs.push("Документ о самозанятости/ИП");
    if (!chef.documents?.kitchenCertificate)
      missingDocs.push("СЭС-сертификат кухни");
    if (!chef.documents?.kitchenPhotos?.length) missingDocs.push("Фото кухни");
    if (
      !chef.documents?.dishPhotos?.length ||
      chef.documents.dishPhotos.length < 4
    )
      missingDocs.push("Фото блюд (минимум 4)");

    if (missingDocs.length === 0) {
      alert("Все документы загружены!");
      return;
    }

    const message = `Повару ${
      chef.name || chefEmail
    } отправлено уведомление о необходимости загрузить следующие документы:\n\n${missingDocs.join(
      "\n"
    )}\n\n⚠️ Медкнижка и документ о самозанятости должны обновляться каждые 6-12 месяцев.`;
    alert(message);

    // В реальном приложении здесь бы отправлялось уведомление повару
    console.log(
      "Уведомление отправлено повару:",
      chefEmail,
      "Недостающие документы:",
      missingDocs
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-chefs">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="admin-chefs">
      <div className="page-header">
        <h1>👨‍🍳 Управление поварами</h1>
        <div className="header-actions">
          <button onClick={loadChefs} className="refresh-button">
            🔄 Обновить
          </button>
        </div>
      </div>

      {chefs.length === 0 ? (
        <div className="no-data">
          <p>Поваров пока нет</p>
        </div>
      ) : (
        <div className="chefs-grid">
          {chefs.map((chef) => (
            <div key={chef.email} className="chef-card">
              <div className="chef-avatar">
                {chef.avatar ? (
                  <img src={chef.avatar} alt={chef.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {chef.name ? chef.name.charAt(0).toUpperCase() : "П"}
                  </div>
                )}
              </div>

              <div className="chef-info">
                <h3>{chef.name || "Не указано"}</h3>
                <p className="chef-email">{chef.email}</p>
                <p className="chef-specialization">
                  {chef.specialization || "Не указано"}
                </p>

                <div className="chef-stats">
                  <div className="stat">
                    <span className="stat-label">Рейтинг:</span>
                    <span className="stat-value">
                      {chef.rating > 0 ? `⭐ ${chef.rating}/5` : "Нет оценок"}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Заказов:</span>
                    <span className="stat-value">{chef.totalOrders}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Выручка:</span>
                    <span className="stat-value">
                      {chef.totalRevenue.toLocaleString()} ₽
                    </span>
                  </div>
                </div>

                <div className="chef-actions">
                  <button
                    onClick={() => handleChefClick(chef)}
                    className="view-button"
                  >
                    👁️ Подробнее
                  </button>
                  <button
                    onClick={() => handleBlockChef(chef.email)}
                    className={chef.blocked ? "unblock-button" : "block-button"}
                  >
                    {chef.blocked ? "🔓 Разблокировать" : "🚫 Заблокировать"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно с подробной информацией о поваре */}
      {showModal && selectedChef && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Информация о поваре</h2>
              <button
                onClick={() => setShowModal(false)}
                className="close-button"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="chef-details">
                <div className="chef-avatar-large">
                  {selectedChef.avatar ? (
                    <img src={selectedChef.avatar} alt={selectedChef.name} />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {selectedChef.name
                        ? selectedChef.name.charAt(0).toUpperCase()
                        : "П"}
                    </div>
                  )}
                </div>

                <div className="chef-details-info">
                  <h3>{selectedChef.name || "Не указано"}</h3>
                  <p>
                    <strong>Email:</strong> {selectedChef.email}
                  </p>
                  <p>
                    <strong>Специализация:</strong>{" "}
                    {selectedChef.specialization || "Не указано"}
                  </p>
                  <p>
                    <strong>Опыт:</strong>{" "}
                    {selectedChef.experience || "Не указано"} лет
                  </p>
                  <p>
                    <strong>Описание:</strong>{" "}
                    {selectedChef.description || "Не указано"}
                  </p>
                  <p>
                    <strong>Дата регистрации:</strong>{" "}
                    {formatDate(selectedChef.createdAt)}
                  </p>
                  <p>
                    <strong>Статус:</strong>
                    <span
                      className={
                        selectedChef.blocked
                          ? "status-blocked"
                          : "status-active"
                      }
                    >
                      {selectedChef.blocked ? "Заблокирован" : "Активен"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Проверка документов */}
              <div className="document-verification">
                <h4>📋 Проверка документов повара</h4>
                <div className="verification-section">
                  {/* Паспорт */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>📄 Паспорт/Удостоверение личности</h5>
                      <p>
                        Статус:
                        <span
                          className={`verification-status ${
                            selectedChef.documents?.passport
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {selectedChef.documents?.passport
                            ? "✅ Загружен"
                            : "❌ Не загружен"}
                        </span>
                      </p>
                      {selectedChef.documents?.passport && (
                        <div className="document-actions">
                          <button
                            onClick={() =>
                              window.open(
                                selectedChef.documents.passport,
                                "_blank"
                              )
                            }
                            className="view-document-button"
                          >
                            👁️ Просмотреть документ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Медкнижка */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>🏥 Медкнижка</h5>
                      <p>
                        Статус:
                        <span
                          className={`verification-status ${
                            selectedChef.documents?.healthBook
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {selectedChef.documents?.healthBook
                            ? "✅ Загружена"
                            : "❌ Не загружена"}
                        </span>
                      </p>
                      <p className="document-note">
                        ⚠️ Требует обновления каждые 6-12 месяцев
                      </p>
                      {selectedChef.documents?.healthBook && (
                        <div className="document-actions">
                          <button
                            onClick={() =>
                              window.open(
                                selectedChef.documents.healthBook,
                                "_blank"
                              )
                            }
                            className="view-document-button"
                          >
                            👁️ Просмотреть документ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Самозанятость/ИП */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>💼 Документ о самозанятости/ИП</h5>
                      <p>
                        Статус:
                        <span
                          className={`verification-status ${
                            selectedChef.documents?.selfEmployment
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {selectedChef.documents?.selfEmployment
                            ? "✅ Загружен"
                            : "❌ Не загружен"}
                        </span>
                      </p>
                      <p className="document-note">
                        ⚠️ Требует обновления каждые 6-12 месяцев
                      </p>
                      {selectedChef.documents?.selfEmployment && (
                        <div className="document-actions">
                          <button
                            onClick={() =>
                              window.open(
                                selectedChef.documents.selfEmployment,
                                "_blank"
                              )
                            }
                            className="view-document-button"
                          >
                            👁️ Просмотреть документ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* СЭС-сертификат */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>🏭 СЭС-сертификат кухни</h5>
                      <p>
                        Статус:
                        <span
                          className={`verification-status ${
                            selectedChef.documents?.kitchenCertificate
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {selectedChef.documents?.kitchenCertificate
                            ? "✅ Загружен"
                            : "❌ Не загружен"}
                        </span>
                      </p>
                      {selectedChef.documents?.kitchenCertificate && (
                        <div className="document-actions">
                          <button
                            onClick={() =>
                              window.open(
                                selectedChef.documents.kitchenCertificate,
                                "_blank"
                              )
                            }
                            className="view-document-button"
                          >
                            👁️ Просмотреть документ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Фото кухни */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>🏠 Фото кухни</h5>
                      <p>
                        Статус:
                        <span
                          className={`verification-status ${
                            selectedChef.documents?.kitchenPhotos?.length > 0
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {selectedChef.documents?.kitchenPhotos?.length > 0
                            ? `✅ Загружено ${selectedChef.documents.kitchenPhotos.length} фото`
                            : "❌ Не загружены"}
                        </span>
                      </p>
                      {selectedChef.documents?.kitchenPhotos?.length > 0 && (
                        <div className="photo-gallery">
                          {selectedChef.documents.kitchenPhotos.map(
                            (photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Кухня ${index + 1}`}
                                className="document-photo"
                                onClick={() => window.open(photo, "_blank")}
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Фото блюд */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>🍽️ Фото блюд</h5>
                      <p>
                        Статус:
                        <span
                          className={`verification-status ${
                            selectedChef.documents?.dishPhotos?.length >= 4
                              ? "verified"
                              : "pending"
                          }`}
                        >
                          {selectedChef.documents?.dishPhotos?.length > 0
                            ? `✅ Загружено ${selectedChef.documents.dishPhotos.length} фото`
                            : "❌ Не загружены"}
                        </span>
                      </p>
                      {selectedChef.documents?.dishPhotos?.length > 0 && (
                        <div className="photo-gallery">
                          {selectedChef.documents.dishPhotos.map(
                            (photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Блюдо ${index + 1}`}
                                className="document-photo"
                                onClick={() => window.open(photo, "_blank")}
                              />
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Дополнительная информация */}
                  <div className="document-item">
                    <div className="document-info">
                      <h5>📝 Дополнительная информация</h5>
                      <div className="info-section">
                        <p>
                          <strong>Опыт работы:</strong>
                        </p>
                        <p className="info-text">
                          {selectedChef.documents?.experience || "Не указано"}
                        </p>
                      </div>
                      <div className="info-section">
                        <p>
                          <strong>Описание кухни:</strong>
                        </p>
                        <p className="info-text">
                          {selectedChef.documents?.kitchenDescription ||
                            "Не указано"}
                        </p>
                      </div>
                      <div className="info-section">
                        <p>
                          <strong>Дата загрузки документов:</strong>
                        </p>
                        <p className="info-text">
                          {selectedChef.documents?.uploadedAt
                            ? new Date(
                                selectedChef.documents.uploadedAt
                              ).toLocaleDateString("ru-RU")
                            : "Не указано"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="verification-actions">
                    <button
                      onClick={() =>
                        handleVerifyDocuments(selectedChef.email, true)
                      }
                      className="verify-button"
                      disabled={!allDocumentsUploaded(selectedChef)}
                    >
                      ✅ Одобрить все документы
                    </button>
                    <button
                      onClick={() =>
                        handleVerifyDocuments(selectedChef.email, false)
                      }
                      className="reject-button"
                    >
                      ❌ Отклонить документы
                    </button>
                    <button
                      onClick={() => handleRequestDocuments(selectedChef.email)}
                      className="request-button"
                    >
                      📧 Запросить недостающие документы
                    </button>
                  </div>
                </div>
              </div>

              <div className="chef-stats-detailed">
                <h4>Статистика</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Общий рейтинг</span>
                    <span className="stat-value">
                      {selectedChef.rating > 0
                        ? `⭐ ${selectedChef.rating}/5`
                        : "Нет оценок"}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Всего заказов</span>
                    <span className="stat-value">
                      {selectedChef.totalOrders}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Завершенных заказов</span>
                    <span className="stat-value">
                      {selectedChef.completedOrders}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Общая выручка</span>
                    <span className="stat-value">
                      {selectedChef.totalRevenue.toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChefs;
