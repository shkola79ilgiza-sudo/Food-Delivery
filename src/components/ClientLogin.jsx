import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import GoogleAuth from './GoogleAuth';

const ClientLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Проверяем, авторизован ли пользователь
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (token && role === 'client') {
      navigate('/client/menu');
    }
    
    // Отладка загрузки фонового изображения
    const img = new Image();
    img.onload = () => {
      console.log('✅ Татарский фон загружен успешно!');
      console.log('📏 Размер изображения:', img.width, 'x', img.height);
      console.log('🔗 URL изображения:', img.src);
    };
    img.onerror = () => console.log('❌ Ошибка загрузки татарского фона');
    img.src = '/images/tatar.jpg';
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      const response = await login(email, password, 'client');
      
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('clientId', response.clientId);
        localStorage.setItem('role', 'client');
        navigate('/client/menu');
      } else {
        setError(response.message || 'Ошибка входа');
      }
    } catch (err) {
      setError(err.message || 'Ошибка сервера. Пожалуйста, попробуйте позже.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (userData) => {
    setLoading(true);
    setError('');
    
    try {
      // Здесь можно отправить данные Google на сервер для создания/авторизации пользователя
      // Пока что сохраняем данные локально
      localStorage.setItem('authToken', 'google-token-' + userData.googleId);
      localStorage.setItem('role', 'client');
      localStorage.setItem('userEmail', userData.email);
      localStorage.setItem('userName', userData.name);
      localStorage.setItem('userPicture', userData.picture);
      
      navigate('/client/menu');
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Ошибка авторизации через Google');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google auth failure:', error);
    setError('Ошибка авторизации через Google');
  };

  return (
    <div className="client-login-container" style={{
      background: `
        url("/images/tatar.jpg"),
        linear-gradient(135deg, 
          #2D5016 0%, 
          #4A7C59 25%, 
          #6B8E6B 50%, 
          #90EE90 75%, 
          #98FB98 100%
        )
      `,
      backgroundSize: '45%',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Татарский орнамент - декоративные элементы */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '120px',
        height: '120px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '50%',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        zIndex: 1,
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.2)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        width: '80px',
        height: '80px',
        background: 'rgba(255, 255, 255, 0.12)',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.25)',
        zIndex: 1,
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.15)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '8%',
        width: '100px',
        height: '100px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1,
        boxShadow: '0 0 18px rgba(255, 255, 255, 0.18)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '5%',
        width: '60px',
        height: '60px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '50%',
        border: '3px solid rgba(255, 255, 255, 0.3)',
        zIndex: 1,
        boxShadow: '0 0 12px rgba(255, 255, 255, 0.2)'
      }}></div>
      
      {/* Дополнительные татарские узоры */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '2%',
        width: '40px',
        height: '40px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        zIndex: 1,
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.1)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '70%',
        right: '3%',
        width: '30px',
        height: '30px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1,
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.15)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        width: '50px',
        height: '50px',
        background: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '50%',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        zIndex: 1,
        boxShadow: '0 0 12px rgba(255, 255, 255, 0.08)'
      }}></div>
      
      {/* Дополнительные татарские узоры - ромбы и квадраты */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '15%',
        width: '25px',
        height: '25px',
        background: 'rgba(255, 255, 255, 0.1)',
        transform: 'rotate(45deg)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1,
        boxShadow: '0 0 8px rgba(255, 255, 255, 0.15)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '20%',
        width: '20px',
        height: '20px',
        background: 'rgba(255, 255, 255, 0.08)',
        transform: 'rotate(45deg)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        zIndex: 1,
        boxShadow: '0 0 6px rgba(255, 255, 255, 0.1)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '80%',
        left: '25%',
        width: '35px',
        height: '35px',
        background: 'rgba(255, 255, 255, 0.06)',
        transform: 'rotate(45deg)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        zIndex: 1,
        boxShadow: '0 0 10px rgba(255, 255, 255, 0.08)'
      }}></div>
      
      {/* Татарские узоры - линии */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '30%',
        width: '60px',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.15)',
        zIndex: 1,
        boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '65%',
        right: '25%',
        width: '40px',
        height: '2px',
        background: 'rgba(255, 255, 255, 0.12)',
        zIndex: 1,
        boxShadow: '0 0 4px rgba(255, 255, 255, 0.15)'
      }}></div>
      
      {/* Overlay для лучшей читаемости */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.1)',
        zIndex: 2
      }}></div>
      <div className="client-login-form-container" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '15px',
        padding: '40px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(15px)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        zIndex: 3
      }}>
        <h2 style={{
          color: '#2D5016',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '28px',
          fontWeight: '600',
          textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)',
          letterSpacing: '0.5px'
        }}>Вход для клиентов</h2>
        {error && <div className="error-message" style={{
          background: 'rgba(220, 53, 69, 0.1)',
          color: '#dc3545',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(220, 53, 69, 0.2)',
          fontSize: '14px',
          textAlign: 'center'
        }}>{error}</div>}
        
        <form onSubmit={handleSubmit} className="client-login-form">
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2D5016',
              fontWeight: '600',
              fontSize: '14px'
            }}>Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #90EE90',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2D5016';
                e.target.style.boxShadow = '0 0 0 3px rgba(45, 80, 22, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#90EE90';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#2D5016',
              fontWeight: '600',
              fontSize: '14px'
            }}>Пароль</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите ваш пароль"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #90EE90',
                borderRadius: '8px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box',
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2D5016';
                e.target.style.boxShadow = '0 0 0 3px rgba(45, 80, 22, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#90EE90';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <button type="submit" className="login-button" disabled={loading} style={{
            background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)',
            width: '100%',
            marginTop: '10px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.background = 'linear-gradient(135deg, #4A7C59 0%, #6B8E6B 100%)';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.background = 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
            }
          }}>
            {loading ? t.login.submit + '...' : t.login.submit}
          </button>
        </form>

        {/* Разделитель */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
          color: '#2D5016'
        }}>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(45, 80, 22, 0.3)'
          }}></div>
          <span style={{
            margin: '0 15px',
            fontSize: '14px',
            fontWeight: '500'
          }}>или</span>
          <div style={{
            flex: 1,
            height: '1px',
            background: 'rgba(45, 80, 22, 0.3)'
          }}></div>
        </div>

        {/* Google OAuth */}
        <GoogleAuth 
          onSuccess={handleGoogleSuccess}
          onFailure={handleGoogleFailure}
          role="client"
        />
        
        <div className="login-links" style={{
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p style={{ color: '#2D5016', marginBottom: '10px' }}>
            {t.login.noAccount} <Link to="/client/register" style={{
              color: '#4A7C59',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#2D5016';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#4A7C59';
              e.target.style.textDecoration = 'none';
            }}>{t.login.registerLink}</Link>
          </p>
          <p>
            <Link to="/login" style={{
              color: '#2D5016',
              textDecoration: 'none',
              fontWeight: '500',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#4A7C59';
              e.target.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#2D5016';
              e.target.style.textDecoration = 'none';
            }}>{t.login.chefLogin}</Link>
          </p>
        </div>
      </div>
      
      <div className="client-benefits">
        <h3>Преимущества для клиентов</h3>
        <div className="benefits-cards">
          <div className="benefit-card">
            <div className="benefit-icon">🍽️</div>
            <h4>Широкий выбор блюд</h4>
            <p>Выбирайте из разнообразных блюд от профессиональных поваров</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🚚</div>
            <h4>Быстрая доставка</h4>
            <p>Доставим ваш заказ в кратчайшие сроки</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;