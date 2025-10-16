// Service Worker для Food Delivery PWA
const CACHE_NAME = 'food-delivery-v2';
const urlsToCache = [
  '/Food-Delivery/',
  '/Food-Delivery/static/js/bundle.js',
  '/Food-Delivery/static/css/main.css',
  '/Food-Delivery/manifest.json',
  '/Food-Delivery/logo192.png',
  '/Food-Delivery/logo512.png'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Обработка fetch запросов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кэшированную версию или загружаем из сети
        return response || fetch(event.request);
      })
  );
});

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: '🍽️ Food Delivery',
    body: 'У вас новое уведомление!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: 'food-delivery-notification',
    requireInteraction: true
  };

  // Если есть данные в push событии
  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = { ...notificationData, ...data };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    notificationData
  );

  event.waitUntil(promiseChain);
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'view') {
    // Открываем приложение
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'dismiss') {
    // Просто закрываем уведомление
    console.log('Notification dismissed');
  } else {
    // Клик по самому уведомлению
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Обработка закрытия уведомлений
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Функция для отправки push уведомления
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    const { title, body, icon, tag } = event.data;
    
    self.registration.showNotification(title, {
      body,
      icon: icon || '/logo192.png',
      badge: '/logo192.png',
      tag: tag || 'food-delivery-notification',
      requireInteraction: true,
      actions: [
        { action: 'view', title: 'Посмотреть' },
        { action: 'dismiss', title: 'Закрыть' }
      ]
    });
  }
});
