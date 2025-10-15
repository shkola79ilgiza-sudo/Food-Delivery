import React from 'react';

const VerificationBadges = ({ chef, showTooltips = true }) => {
  const badges = [
    {
      id: 'phone',
      icon: '📱',
      label: 'Телефон подтверждён',
      verified: chef?.verification?.phoneVerified || false,
      color: '#4CAF50'
    },
    {
      id: 'id',
      icon: '🆔',
      label: 'ID проверен',
      verified: chef?.verification?.idVerified || false,
      color: '#2196F3'
    },
    {
      id: 'sanitary',
      icon: '🏥',
      label: 'Санитарная книжка',
      verified: chef?.verification?.sanitaryVerified || false,
      color: '#FF9800'
    },
    {
      id: 'kitchen',
      icon: '🍳',
      label: 'Кухня проверена',
      verified: chef?.verification?.kitchenVerified || false,
      color: '#9C27B0'
    },
    {
      id: 'business',
      icon: '🏢',
      label: 'Бизнес-верификация',
      verified: chef?.verification?.businessVerified || false,
      color: '#607D8B'
    },
    {
      id: 'topChef',
      icon: '⭐',
      label: 'Top Chef',
      verified: chef?.verification?.topChef || false,
      color: '#FFD700'
    }
  ];

  const verifiedBadges = badges.filter(badge => badge.verified);
  const trustLevel = Math.round((verifiedBadges.length / badges.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Прогресс-бар уровня доверия */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Уровень доверия
          </span>
          <span style={{ fontSize: '12px', color: '#666' }}>
            {trustLevel}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e0e0e0',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${trustLevel}%`,
            height: '100%',
            backgroundColor: trustLevel >= 80 ? '#4CAF50' : 
                            trustLevel >= 60 ? '#FF9800' : '#F44336',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Бейджи верификации */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px',
        alignItems: 'center'
      }}>
        {badges.map(badge => (
          <div
            key={badge.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '12px',
              backgroundColor: badge.verified ? badge.color : '#f5f5f5',
              color: badge.verified ? 'white' : '#999',
              fontSize: '12px',
              fontWeight: 'bold',
              opacity: badge.verified ? 1 : 0.5,
              transition: 'all 0.3s ease',
              cursor: showTooltips ? 'help' : 'default',
              position: 'relative'
            }}
            title={showTooltips ? badge.label : undefined}
          >
            <span>{badge.icon}</span>
            <span>{badge.label}</span>
            {badge.verified && (
              <span style={{ fontSize: '10px' }}>✓</span>
            )}
          </div>
        ))}
      </div>

      {/* Статус верификации */}
      <div style={{ 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'center',
        marginTop: '5px'
      }}>
        {verifiedBadges.length === badges.length ? 
          'Полностью верифицирован' :
          `${verifiedBadges.length} из ${badges.length} проверок пройдено`
        }
      </div>
    </div>
  );
};

export default VerificationBadges;
