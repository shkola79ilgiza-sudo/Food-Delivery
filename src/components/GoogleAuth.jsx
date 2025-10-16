import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const GoogleAuth = ({ onSuccess, onFailure, role = 'client' }) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Имитация Google OAuth (в реальном приложении здесь будет настоящий OAuth)
      // Для демонстрации создаём моковые данные
      const mockUserData = {
        email: 'demo@gmail.com',
        name: 'Demo User',
        picture: 'https://via.placeholder.com/40',
        googleId: 'demo-google-id-123',
        role: role
      };

      // Имитируем задержку API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onSuccess) {
        onSuccess(mockUserData);
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-auth">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="google-login-btn"
        style={{
          width: '100%',
          height: '40px',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          backgroundColor: '#fff',
          color: '#3c4043',
          fontSize: '14px',
          fontWeight: '500',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s ease',
          opacity: isLoading ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#dadce0';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.target.style.backgroundColor = '#fff';
            e.target.style.borderColor = '#dadce0';
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {isLoading ? '⏳ Вход...' : (role === 'client' ? t.login.loginWithGoogle : t.login.chefLoginWithGoogle)}
      </button>
    </div>
  );
};

export default GoogleAuth;