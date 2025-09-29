import React, { useState, useEffect, useCallback } from 'react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const filterUsers = useCallback(() => {
    let filtered = [...users];

    // Поиск по имени или email
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Фильтр по роли
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadUsers = () => {
    setLoading(true);
    
    // Загружаем пользователей из localStorage
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '[]');
    const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
    const chefData = {
      email: localStorage.getItem('chefEmail'),
      password: localStorage.getItem('chefPassword'),
      avatar: localStorage.getItem('chefAvatar')
    };

    // Собираем всех пользователей
    const usersList = [...allUsers];
    
    // Добавляем клиента если есть данные
    if (clientData.email) {
      usersList.push({
        id: 'client-demo',
        name: clientData.name || 'Demo Client',
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        role: 'client',
        status: 'active',
        createdAt: new Date().toISOString(),
        avatar: null
      });
    }

    // Добавляем повара если есть данные
    if (chefData.email) {
      usersList.push({
        id: 'chef-demo',
        name: 'Demo Chef',
        email: chefData.email,
        role: 'chef',
        status: 'active',
        createdAt: new Date().toISOString(),
        avatar: chefData.avatar
      });
    }

    setUsers(usersList);
    setLoading(false);
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
        : user
    ));
  };

  const deleteUser = (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const getRoleIcon = (role) => {
    return role === 'chef' ? '👨‍🍳' : role === 'client' ? '👤' : '👥';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#4caf50' : '#f44336';
  };

  const getStatusText = (status) => {
    return status === 'active' ? 'Активен' : 'Заблокирован';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="admin-users">
        <div className="loading">Загрузка пользователей...</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1>👥 Управление пользователями</h1>
        <div className="header-actions">
          <button onClick={loadUsers} className="refresh-button">
            🔄 Обновить
          </button>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Поиск по имени или email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Все роли</option>
            <option value="chef">Повара</option>
            <option value="client">Клиенты</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Все статусы</option>
            <option value="active">Активные</option>
            <option value="blocked">Заблокированные</option>
          </select>
        </div>
      </div>

      {/* Статистика */}
      <div className="users-stats">
        <div className="stat-item">
          <span className="stat-label">Всего пользователей:</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Повара:</span>
          <span className="stat-value">{users.filter(u => u.role === 'chef').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Клиенты:</span>
          <span className="stat-value">{users.filter(u => u.role === 'client').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Активные:</span>
          <span className="stat-value">{users.filter(u => u.status === 'active').length}</span>
        </div>
      </div>

      {/* Таблица пользователей */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-data">
            <p>Пользователи не найдены</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Статус</th>
                <th>Дата регистрации</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name || 'Не указано'}</div>
                        <div className="user-id">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="role-badge">
                      {getRoleIcon(user.role)} {user.role === 'chef' ? 'Повар' : 'Клиент'}
                    </span>
                  </td>
                  <td>{user.email || 'Не указан'}</td>
                  <td>{user.phone || 'Не указан'}</td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(user.status) }}
                    >
                      {getStatusText(user.status)}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`action-button ${user.status === 'active' ? 'block' : 'unblock'}`}
                      >
                        {user.status === 'active' ? '🚫 Заблокировать' : '✅ Разблокировать'}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="action-button delete"
                      >
                        🗑️ Удалить
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
