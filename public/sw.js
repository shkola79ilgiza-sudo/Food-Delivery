// Enhanced Service Worker для PWA с офлайн режимом
const CACHE_NAME = 'food-delivery-v2';
const STATIC_CACHE = 'food-delivery-static-v2';
const DYNAMIC_CACHE = 'food-delivery-dynamic-v2';
const API_CACHE = 'food-delivery-api-v2';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Расширенный список для кэширования
const staticAssets = [
  '/static/js/',
  '/static/css/',
  '/static/media/',
  '/manifest.json'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    Promise.all([
      // Кэшируем статические ресурсы
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(urlsToCache);
      }),
      // Кэшируем API endpoints
      caches.open(API_CACHE).then((cache) => {
        console.log('API cache ready');
        return Promise.resolve();
      })
    ])
  );
  // Принудительная активация нового SW
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Берем контроль над всеми клиентами
      self.clients.claim()
    ])
  );
});

// Обработка fetch запросов с улучшенным кэшированием
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем non-HTTP запросы
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Статические ресурсы - Cache First стратегия
  if (isStaticAsset(url.pathname)) {
    return cacheFirst(request, STATIC_CACHE);
  }
  
  // API запросы - Network First с fallback на кэш
  if (isApiRequest(url.pathname)) {
    return networkFirst(request, API_CACHE);
  }
  
  // HTML страницы - Network First
  if (request.headers.get('accept')?.includes('text/html')) {
    return networkFirst(request, DYNAMIC_CACHE);
  }
  
  // Остальные запросы - Stale While Revalidate
  return staleWhileRevalidate(request, DYNAMIC_CACHE);
}

// Cache First стратегия
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, serving from cache:', error);
    return new Response('Offline content', { status: 503 });
  }
}

// Network First стратегия
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Возвращаем офлайн страницу для HTML запросов
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Офлайн - Food Delivery</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>🔌 Нет подключения к интернету</h1>
          <p>Проверьте подключение и попробуйте снова</p>
          <button onclick="window.location.reload()">Обновить страницу</button>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Содержимое недоступно в офлайн режиме', { status: 503 });
  }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// Проверка типа ресурса
function isStaticAsset(pathname) {
  return staticAssets.some(asset => pathname.startsWith(asset)) ||
         pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/);
}

function isApiRequest(pathname) {
  return pathname.startsWith('/api/') || pathname.includes('localhost:3001');
}

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
