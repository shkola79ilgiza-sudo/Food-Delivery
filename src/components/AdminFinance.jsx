import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const AdminFinance = () => {
  const [financeData, setFinanceData] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    chefEarnings: 0,
    monthlyRevenue: [],
    topChefs: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const navigate = useNavigate();

  const loadFinanceData = useCallback(() => {
    setLoading(true);

    // Загружаем заказы
    const orders = JSON.parse(localStorage.getItem("clientOrders") || "[]");
    const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
    const chefs = users.filter((user) => user.role === "chef");

    // Фильтруем заказы по периоду
    const now = new Date();
    let filteredOrders = orders;

    if (selectedPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(
        (order) => new Date(order.createdAt) >= weekAgo
      );
    } else if (selectedPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(
        (order) => new Date(order.createdAt) >= monthAgo
      );
    } else if (selectedPeriod === "year") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(
        (order) => new Date(order.createdAt) >= yearAgo
      );
    }

    // Рассчитываем общую статистику
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + (order.payment?.total || 0),
      0
    );
    const totalCommission = filteredOrders.reduce(
      (sum, order) => sum + (order.payment?.commission || 0),
      0
    );
    const chefEarnings = totalRevenue - totalCommission;

    // Рассчитываем месячную выручку
    const monthlyRevenue = calculateMonthlyRevenue(filteredOrders);

    // Топ поваров по выручке
    const chefStats = chefs
      .map((chef) => {
        const chefOrders = filteredOrders.filter(
          (order) => order.chefId === chef.email
        );
        const chefRevenue = chefOrders.reduce(
          (sum, order) => sum + (order.payment?.total || 0),
          0
        );
        const chefCommission = chefOrders.reduce(
          (sum, order) => sum + (order.payment?.commission || 0),
          0
        );

        return {
          ...chef,
          totalOrders: chefOrders.length,
          revenue: chefRevenue,
          commission: chefCommission,
          earnings: chefRevenue - chefCommission,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Последние транзакции
    const recentTransactions = filteredOrders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        id: order.id,
        chef:
          chefs.find((chef) => chef.email === order.chefId)?.name ||
          "Неизвестно",
        amount: order.payment?.total || 0,
        commission: order.payment?.commission || 0,
        date: order.createdAt,
        status: order.status,
      }));

    setFinanceData({
      totalRevenue,
      totalCommission,
      chefEarnings,
      monthlyRevenue,
      topChefs: chefStats,
      recentTransactions,
    });

    setLoading(false);
  }, [selectedPeriod]);

  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem("authToken");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/admin/login");
      return;
    }

    loadFinanceData();
  }, [navigate, selectedPeriod, loadFinanceData]);

  const calculateMonthlyRevenue = (orders) => {
    const monthlyData = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          revenue: 0,
          commission: 0,
          orders: 0,
        };
      }

      monthlyData[monthKey].revenue += order.payment?.total || 0;
      monthlyData[monthKey].commission += order.payment?.commission || 0;
      monthlyData[monthKey].orders += 1;
    });

    return Object.values(monthlyData).sort((a, b) =>
      a.month.localeCompare(b.month)
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString("ru-RU") + " ₽";
  };

  if (loading) {
    return (
      <div className="admin-finance">
        <div className="loading">Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div className="admin-finance">
      <div className="page-header">
        <h1>💰 Финансовые отчеты</h1>
        <div className="header-actions">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-selector"
          >
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="year">За год</option>
            <option value="all">За все время</option>
          </select>
          <button onClick={loadFinanceData} className="refresh-button">
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Основная статистика */}
      <div className="finance-stats">
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Общая выручка</h3>
            <p className="stat-number">
              {formatCurrency(financeData.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="stat-card commission">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>Комиссия платформы</h3>
            <p className="stat-number">
              {formatCurrency(financeData.totalCommission)}
            </p>
            <p className="stat-percentage">
              {financeData.totalRevenue > 0
                ? `${(
                    (financeData.totalCommission / financeData.totalRevenue) *
                    100
                  ).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
        </div>

        <div className="stat-card earnings">
          <div className="stat-icon">👨‍🍳</div>
          <div className="stat-content">
            <h3>Заработок поваров</h3>
            <p className="stat-number">
              {formatCurrency(financeData.chefEarnings)}
            </p>
          </div>
        </div>
      </div>

      <div className="finance-content">
        {/* Топ поваров */}
        <div className="finance-section">
          <h2>🏆 Топ поваров по выручке</h2>
          {financeData.topChefs.length === 0 ? (
            <div className="no-data">
              <p>Нет данных за выбранный период</p>
            </div>
          ) : (
            <div className="top-chefs">
              {financeData.topChefs.map((chef, index) => (
                <div key={chef.email} className="chef-ranking">
                  <div className="ranking-position">
                    {index === 0
                      ? "🥇"
                      : index === 1
                      ? "🥈"
                      : index === 2
                      ? "🥉"
                      : `#${index + 1}`}
                  </div>
                  <div className="chef-info">
                    <h4>{chef.name || "Не указано"}</h4>
                    <p className="chef-email">{chef.email}</p>
                  </div>
                  <div className="chef-stats">
                    <div className="stat">
                      <span className="stat-label">Выручка:</span>
                      <span className="stat-value">
                        {formatCurrency(chef.revenue)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Заказов:</span>
                      <span className="stat-value">{chef.totalOrders}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Заработок:</span>
                      <span className="stat-value">
                        {formatCurrency(chef.earnings)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Последние транзакции */}
        <div className="finance-section">
          <h2>📊 Последние транзакции</h2>
          {financeData.recentTransactions.length === 0 ? (
            <div className="no-data">
              <p>Транзакций за выбранный период нет</p>
            </div>
          ) : (
            <div className="transactions-table">
              <table>
                <thead>
                  <tr>
                    <th>ID заказа</th>
                    <th>Повар</th>
                    <th>Сумма</th>
                    <th>Комиссия</th>
                    <th>Дата</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {financeData.recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>#{transaction.id}</td>
                      <td>{transaction.chef}</td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>{formatCurrency(transaction.commission)}</td>
                      <td>{formatDate(transaction.date)}</td>
                      <td>
                        <span
                          className={`status-badge status-${transaction.status}`}
                        >
                          {transaction.status === "delivered"
                            ? "Доставлен"
                            : transaction.status === "pending"
                            ? "Ожидает"
                            : transaction.status === "cancelled"
                            ? "Отменен"
                            : transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Месячная статистика */}
        {financeData.monthlyRevenue.length > 0 && (
          <div className="finance-section">
            <h2>📈 Месячная статистика</h2>
            <div className="monthly-stats">
              {financeData.monthlyRevenue.map((month) => (
                <div key={month.month} className="month-card">
                  <h4>{month.month}</h4>
                  <div className="month-stats">
                    <div className="stat">
                      <span className="stat-label">Выручка:</span>
                      <span className="stat-value">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Комиссия:</span>
                      <span className="stat-value">
                        {formatCurrency(month.commission)}
                      </span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Заказов:</span>
                      <span className="stat-value">{month.orders}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFinance;
