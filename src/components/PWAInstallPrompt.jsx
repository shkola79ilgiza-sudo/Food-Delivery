import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Проверяем, установлено ли уже приложение
    const checkInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches || 
          window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    // Слушаем событие beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Слушаем событие appinstalled
    const handleAppInstalled = () => {
      console.log('PWA: App was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Показываем prompt установки
    deferredPrompt.prompt();
    
    // Ждем результата
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User choice outcome: ${outcome}`);
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Скрываем на 24 часа
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Не показываем если уже установлено или недавно отклонили
  if (isInstalled || !showInstallPrompt) {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return null;
    }
  }

  if (isInstalled) {
    return (
      <div className="pwa-installed-banner">
        <div className="pwa-installed-content">
          <span className="pwa-icon">📱</span>
          <span>Приложение установлено!</span>
        </div>
      </div>
    );
  }

  if (!showInstallPrompt) return null;

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <span>📱</span>
        </div>
        <div className="pwa-install-text">
          <h3>Установить приложение</h3>
          <p>Установите Food Delivery для быстрого доступа и работы offline</p>
        </div>
        <div className="pwa-install-buttons">
          <button 
            className="pwa-install-btn" 
            onClick={handleInstallClick}
          >
            Установить
          </button>
          <button 
            className="pwa-dismiss-btn" 
            onClick={handleDismiss}
          >
            Позже
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
