import { safeSetClientOrders } from './utils/safeStorage';

const API_BASE_URL = ""; // process.env.REACT_APP_API_BASE_URL || "";

function getAuthToken() {
  // Adjust to your auth storage. Placeholder: token in localStorage
  return localStorage.getItem("authToken") || "";
}

async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resp = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!resp.ok) {
    let errBody = null;
    try { errBody = await resp.json(); } catch {}
    const error = new Error(errBody?.error?.message || resp.statusText);
    error.status = resp.status;
    error.body = errBody;
    throw error;
  }

  if (resp.status === 204) return null;
  try { return await resp.json(); } catch { return null; }
}

// ===== DEMO storage helpers (fallback when API_BASE_URL is empty) =====
function demoKey(chefId) {
  return `demo_menu_${chefId}`;
}

// Демо-данные поваров с верификацией
const demoChefs = [
  {
    id: 'chef1@demo.com',
    email: 'chef1@demo.com',
    name: 'Анна Петрова',
    role: 'chef',
    avatar: '/images/chef1.jpg',
    rating: 4.8,
    reviewsCount: 24,
    verification: {
      phoneVerified: true,
      idVerified: true,
      sanitaryVerified: true,
      kitchenVerified: true,
      businessVerified: false,
      topChef: true
    },
    tier: 'pro',
    acceptanceRate: 95,
    responseTime: 5
  },
  {
    id: 'chef2@demo.com',
    email: 'chef2@demo.com',
    name: 'Мухаммад Алиев',
    role: 'chef',
    avatar: '/images/chef2.jpg',
    rating: 4.9,
    reviewsCount: 18,
    verification: {
      phoneVerified: true,
      idVerified: true,
      sanitaryVerified: true,
      kitchenVerified: false,
      businessVerified: true,
      topChef: true
    },
    tier: 'business',
    acceptanceRate: 88,
    responseTime: 3
  },
  {
    id: 'chef3@demo.com',
    email: 'chef3@demo.com',
    name: 'Гульнара Хакимова',
    role: 'chef',
    avatar: '/images/chef3.jpg',
    rating: 4.7,
    reviewsCount: 35,
    verification: {
      phoneVerified: true,
      idVerified: false,
      sanitaryVerified: false,
      kitchenVerified: false,
      businessVerified: false,
      topChef: false
    },
    tier: 'free',
    acceptanceRate: 72,
    responseTime: 8
  }
];

function demoRead(chefId) {
  try {
    const raw = localStorage.getItem(demoKey(chefId));
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function demoWrite(chefId, dishes) {
  try {
    localStorage.setItem(demoKey(chefId), JSON.stringify(dishes || []));
  } catch {}
}

// Получить данные повара
export function getChefData(chefId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const chef = demoChefs.find(c => c.id === chefId);
      if (chef) {
        resolve(chef);
      } else {
        // Создать базовые данные для нового повара
        const newChef = {
          id: chefId,
          email: chefId,
          name: chefId.split('@')[0],
          role: 'chef',
          avatar: '/images/default-chef.jpg',
          rating: 0,
          reviewsCount: 0,
          verification: {
            phoneVerified: false,
            idVerified: false,
            sanitaryVerified: false,
            kitchenVerified: false,
            businessVerified: false,
            topChef: false
          },
          tier: 'free',
          acceptanceRate: 0,
          responseTime: 0
        };
        resolve(newChef);
      }
    }, 500);
  });
}

// Функция для создания уведомления повару
function createChefNotification(order) {
  try {
    const notifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
    
    // Находим chefId из заказа (первый товар в заказе)
    let chefId = 'demo-chef-1';
    if (order.items && order.items.length > 0) {
      chefId = order.items[0].chefId || order.items[0].chefEmail || 'demo-chef-1';
    }
    
    // Если не нашли chefId в товарах, пробуем найти в самом заказе
    if (chefId === 'demo-chef-1' && order.chefId) {
      chefId = order.chefId;
    }
    
    // Создаем детальное сообщение с информацией о заказе
    const itemsList = order.items ? order.items.map(item => 
      `• ${item.name} (${item.quantity} шт.) - ${item.price}₽`
    ).join('\n') : 'Нет деталей';
    
    const clientInfo = order.customer?.name ? `Клиент: ${order.customer.name}` : 'Клиент не указан';
    const deliveryInfo = order.customer?.address ? `Адрес: ${order.customer.address}` : 'Самовывоз';
    const deliveryTimeInfo = order.delivery ? 
      `Доставка: ${order.delivery.date} в ${order.delivery.time}` : 
      'Время доставки не указано';
    
    const notification = {
      id: `notification-${Date.now()}`,
      type: 'newOrder',
      title: '🆕 Новый заказ!',
      message: `Заказ #${order.id}\n${clientInfo}\n${deliveryInfo}\n${deliveryTimeInfo}\n\nБлюда:\n${itemsList}\n\nОбщая сумма: ${order.total}₽`,
      time: new Date(),
      read: false,
      icon: '🆕',
      orderId: order.id,
      chefId: chefId,
      orderDetails: {
        clientName: order.customer?.name || 'Не указано',
        clientPhone: order.customer?.phone || 'Не указано',
        deliveryAddress: order.customer?.address || 'Самовывоз',
        deliveryDate: order.delivery?.date || null,
        deliveryTime: order.delivery?.time || null,
        paymentMethod: order.payment?.method || 'Не указано',
        paymentStatus: order.payment?.status || 'pending',
        comment: order.comment || null,
        specialInstructions: order.specialInstructions || null,
        items: order.items || [],
        total: order.total || 0,
        status: order.status || 'pending_confirmation'
      }
    };
    
    notifications.unshift(notification); // Добавляем в начало списка
    
    // Ограничиваем количество уведомлений (последние 50)
    const limitedNotifications = notifications.slice(0, 50);
    
    localStorage.setItem('chefNotifications', JSON.stringify(limitedNotifications));
    
    console.log('Created chef notification:', notification);
  } catch (error) {
    console.error('Error creating chef notification:', error);
  }
}

export async function getChefMenu(chefId, categoryId) {
  // Заглушка для тестирования без бэкенда
  if (!API_BASE_URL || API_BASE_URL === "") {
    const all = demoRead(chefId);
    const filtered = categoryId ? all.filter(d => d.category_id === categoryId) : all;
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          categories: Categories,
          dishes: filtered,
        });
      }, 200);
    });
  }
  
  const qs = new URLSearchParams();
  if (categoryId) qs.set("category_id", categoryId);
  const path = `/api/chefs/${encodeURIComponent(chefId)}/menu${qs.toString() ? `?${qs.toString()}` : ""}`;
  return apiRequest(path, { method: "GET" });
}

export async function createDish(chefId, dish) {
  // Заглушка для тестирования без бэкенда
  if (!API_BASE_URL || API_BASE_URL === "") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = `dish-${Date.now()}`;
        const now = new Date().toISOString();
        
        // Обрабатываем FormData если это FormData
        let dishData = dish;
        if (dish instanceof FormData) {
          dishData = {};
          for (let [key, value] of dish.entries()) {
            if (key === 'photo' && value instanceof File) {
              // Создаем URL для файла изображения
              dishData.photo = URL.createObjectURL(value);
            } else {
              dishData[key] = value;
            }
          }
        }
        
        const newDish = { 
          id, 
          category: dishData.category_id, // Используем category вместо category_id для совместимости
          category_id: dishData.category_id, 
          name: dishData.name, 
          description: dishData.description, 
          price: dishData.price,
          photo: dishData.photo || null,
          image: dishData.photo || null, // Дублируем для совместимости
          ingredients: dishData.ingredients || null,
          calories: dishData.calories || null,
          protein: dishData.protein || null,
          carbs: dishData.carbs || null,
          fat: dishData.fat || null,
          // Диабетические поля
          sugar: dishData.sugar || null,
          glycemicIndex: dishData.glycemicIndex || null,
          sugarSubstitutes: dishData.sugarSubstitutes || false,
          diabeticFriendly: dishData.diabeticFriendly || false,
          before_photo: dishData.before_photo || null,
          after_photo: dishData.after_photo || null,
          is_client_products: dishData.is_client_products || false,
          chef: 'Повар', // Добавляем информацию о поваре
          chefId: chefId, // Добавляем ID повара
          chefName: localStorage.getItem('chefName') || localStorage.getItem('chefEmail') || 'Повар', // Имя повара
          chefSpecialization: localStorage.getItem('chefSpecialization') || 'general', // Специализация
          chefExperience: localStorage.getItem('chefExperience') || '0', // Опыт
          chefEmail: localStorage.getItem('chefEmail') || chefId, // Email повара
          chefAvatar: localStorage.getItem('chefAvatar') || null, // Аватар повара
          createdAt: now, // Дата создания
          updatedAt: now, // Дата обновления
          rating: 0, // Начальный рейтинг
          orders: 0 // Количество заказов
        };
        const current = demoRead(chefId);
        demoWrite(chefId, [...current, newDish]);
        resolve({ id, category_id: dishData.category_id });
      }, 500);
    });
  }
  
  const path = `/api/chefs/${encodeURIComponent(chefId)}/dishes`;
  return apiRequest(path, { method: "POST", body: dish instanceof FormData ? dish : JSON.stringify(dish) });
}

export async function deleteDish(chefId, dishId) {
  // Заглушка для тестирования без бэкенда
  if (!API_BASE_URL || API_BASE_URL === "") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = demoRead(chefId);
        demoWrite(chefId, current.filter(d => d.id !== dishId));
        resolve({ success: true });
      }, 200);
    });
  }
  
  const path = `/api/chefs/${encodeURIComponent(chefId)}/dishes/${encodeURIComponent(dishId)}`;
  return apiRequest(path, { method: "DELETE" });
}

export async function updateDish(chefId, dishId, updates) {
  // Заглушка для тестирования без бэкенда
  if (!API_BASE_URL || API_BASE_URL === "") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const current = demoRead(chefId);
        
        // Обрабатываем FormData если это FormData
        let updateData = updates;
        if (updates instanceof FormData) {
          updateData = {};
          for (let [key, value] of updates.entries()) {
            if (key === 'photo' && value instanceof File) {
              // Создаем URL для файла изображения
              updateData.photo = URL.createObjectURL(value);
            } else {
              updateData[key] = value;
            }
          }
        }
        
        const next = current.map(d => d.id === dishId ? { ...d, ...updateData } : d);
        demoWrite(chefId, next);
        resolve({ id: dishId, ...updateData });
      }, 200);
    });
  }
  
  const path = `/api/chefs/${encodeURIComponent(chefId)}/dishes/${encodeURIComponent(dishId)}`;
  return apiRequest(path, { method: "PUT", body: updates instanceof FormData ? updates : JSON.stringify(updates) });
}

export const Categories = [
  { id: "halal", name: "Халяль меню" },
  { id: "main", name: "Основные блюда" },
  { id: "semi-finished", name: "Полуфабрикаты" },
  { id: "bakery", name: "Выпечка" },
  { id: "tatar", name: "Татарская кухня" },
  { id: "soups", name: "Супы" },
  { id: "salads", name: "Салаты" },
  { id: "desserts", name: "Десерты" },
  { id: "beverages", name: "Напитки и чай" },
  { id: "diet", name: "Диет меню по калориям" },
  { id: "client_cook", name: "Готовка с продуктами от клиента" },
  { id: "master_class", name: "Кулинарный мастер класс" },
  { id: "help_guest", name: "Помощь в готовке до приезда гостей" },
  { id: "preparations", name: "Заготовки" },
  { id: "brand-products", name: "Бренд-товары" },
];

// Auth APIs (assumed)
// Валидация email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export async function login(email, password, role = 'chef') {
  // Валидация входных данных
  if (!email || !password) {
    throw new Error('Email и пароль обязательны');
  }
  
  if (!validateEmail(email)) {
    throw new Error('Неверный формат email');
  }
  
  if (!API_BASE_URL || API_BASE_URL === "") {
    // Demo login for testing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (role === 'client') {
          // Demo client login
          const savedClientData = localStorage.getItem('clientData');
          if (savedClientData) {
            const clientData = JSON.parse(savedClientData);
            if (clientData.email === email) {
              resolve({ 
                success: true, 
                token: `demo-client-token-${Date.now()}`,
                clientId: email,
                role: 'client'
              });
            } else {
              reject(new Error("Неверный email или пароль"));
            }
          } else {
            reject(new Error("Клиент не найден. Зарегистрируйтесь сначала."));
          }
        } else {
          // Demo chef login
          // Тестовые аккаунты поваров
          const testChefs = [
            { email: 'chef@test.com', password: 'password123' },
            { email: 'chef1@demo.com', password: 'password123' },
            { email: 'chef2@demo.com', password: 'password123' },
            { email: 'chef3@demo.com', password: 'password123' },
          ];
          
          const testChef = testChefs.find(chef => chef.email === email && chef.password === password);
          
          if (testChef) {
            // Успешный вход с тестовым аккаунтом
            localStorage.setItem("chefEmail", email);
            localStorage.setItem("chefPassword", password);
            const result = { 
              success: true, 
              token: `demo-chef-token-${Date.now()}`,
              chefId: email,
              role: 'chef'
            };
            resolve(result);
          } else {
            // Проверяем сохраненные данные
            const savedEmail = localStorage.getItem("chefEmail");
            const savedPassword = localStorage.getItem("chefPassword");
            if (email === savedEmail && password === savedPassword) {
              const result = { 
                success: true, 
                token: `demo-chef-token-${Date.now()}`,
                chefId: email,
                role: 'chef'
              };
              resolve(result);
            } else {
              reject(new Error("Неверный email или пароль"));
            }
          }
        }
      }, 500);
    });
  }
  
  return apiRequest(`/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password, role })
  });
}

export async function register(userData) {
  if (!API_BASE_URL || API_BASE_URL === "") {
    // Demo registration
    console.log("DEMO: Register", userData);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (userData.role === 'client') {
          // Save client data
          localStorage.setItem('clientData', JSON.stringify({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            address: userData.address
          }));
        } else {
          // Save chef data
          localStorage.setItem("chefEmail", userData.email);
          localStorage.setItem("chefPassword", userData.password);
          if (userData.avatar) {
            localStorage.setItem("chefAvatar", userData.avatar);
          }
        }
        resolve({ success: true, message: "Регистрация успешна" });
      }, 500);
    });
  }
  
  return apiRequest(`/api/auth/register`, {
    method: "POST",
    body: JSON.stringify(userData)
  });
}

export async function getProfile() {
  if (!API_BASE_URL || API_BASE_URL === "") {
    console.log("DEMO: Get Profile");
    return new Promise((resolve) => {
      setTimeout(() => {
        const role = localStorage.getItem("role");
        if (role === 'client') {
          const clientData = JSON.parse(localStorage.getItem('clientData') || '{}');
          resolve({
            id: localStorage.getItem("clientId") || "demo-client",
            email: clientData.email || "demo@client.com",
            role: "client",
            name: clientData.name || "Demo Client"
          });
        } else {
          resolve({
            id: localStorage.getItem("chefId") || "demo-chef",
            email: localStorage.getItem("chefEmail") || "demo@chef.com",
            role: localStorage.getItem("role") || "Chef",
          });
        }
      }, 300);
    });
  }
  return apiRequest(`/api/me`, { method: "GET" });
}

// Client APIs
export async function getAvailableDishes(category = null) {
  if (!API_BASE_URL || API_BASE_URL === "") {
    console.log("DEMO: Get Available Dishes", category ? `for category: ${category}` : '');
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get all dishes from all chefs
        const allDishes = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('demo_menu_')) {
            try {
              const chefDishes = JSON.parse(localStorage.getItem(key));
              // Extract chefId from key (demo_menu_chefId)
              const chefId = key.replace('demo_menu_', '');
              // Add chefId to each dish if it doesn't have one
              const dishesWithChefId = chefDishes.map(dish => ({
                ...dish,
                chefId: dish.chefId || chefId
              }));
              allDishes.push(...dishesWithChefId);
            } catch (e) {
              console.error('Error parsing dishes for key:', key);
            }
          }
        }
        
        // Add some demo dishes if none exist
        if (allDishes.length === 0) {
          const demoDishes = [
            {
              id: 'demo-dish-1',
              name: 'Борщ украинский',
              description: 'Классический борщ с говядиной и сметаной',
              price: 350,
              category: 'russian',
              category_id: 'russian',
              cookingTime: 90,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.5,
              // Расширенные поля
              allergens: ['глютен', 'молочные продукты'],
              weight: '400г',
              portionSize: '1 порция',
              shelfLife: '24 часа',
              ingredients: ['говядина', 'свекла', 'капуста', 'морковь', 'лук', 'сметана'],
              nutritionalValue: {
                calories: 280,
                protein: 18,
                fat: 12,
                carbs: 25
              }
            },
            {
              id: 'demo-dish-2',
              name: 'Плов узбекский',
              description: 'Традиционный плов с бараниной и морковью',
              price: 450,
              category: 'tatar',
              category_id: 'tatar',
              cookingTime: 120,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              // Расширенные поля
              allergens: ['глютен'],
              weight: '500г',
              portionSize: '1 порция',
              shelfLife: '48 часов',
              ingredients: ['баранина', 'рис', 'морковь', 'лук', 'чеснок', 'специи'],
              nutritionalValue: {
                calories: 420,
                protein: 25,
                fat: 18,
                carbs: 35
              }
            },
            {
              id: 'demo-dish-3',
              name: 'Эчпочмак',
              description: 'Татарские треугольные пирожки с мясом и картошкой',
              price: 180,
              category: 'tatar',
              category_id: 'tatar',
              cookingTime: 45,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              // Расширенные поля
              allergens: ['глютен'],
              weight: '150г',
              portionSize: '3 штуки',
              shelfLife: '12 часов',
              ingredients: ['мука', 'говядина', 'картофель', 'лук', 'специи'],
              nutritionalValue: {
                calories: 320,
                protein: 15,
                fat: 12,
                carbs: 35
              }
            },
            {
              id: 'demo-dish-4',
              name: 'Бешбармак',
              description: 'Традиционное татарское блюдо с лапшой и мясом',
              price: 520,
              category: 'tatar',
              category_id: 'tatar',
              cookingTime: 150,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              // Расширенные поля
              allergens: ['глютен'],
              weight: '600г',
              portionSize: '1 порция',
              shelfLife: '24 часа',
              ingredients: ['лапша', 'говядина', 'лук', 'специи'],
              nutritionalValue: {
                calories: 480,
                protein: 28,
                fat: 20,
                carbs: 45
              }
            },
            {
              id: 'demo-dish-5',
              name: 'Чак-чак',
              description: 'Сладкое татарское лакомство с медом',
              price: 200,
              category: 'tatar',
              category_id: 'tatar',
              cookingTime: 60,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              // Расширенные поля
              allergens: ['глютен', 'мед'],
              weight: '200г',
              portionSize: '1 порция',
              shelfLife: '7 дней',
              ingredients: ['мука', 'мед', 'сахар', 'масло'],
              nutritionalValue: {
                calories: 380,
                protein: 8,
                fat: 15,
                carbs: 55
              }
            },
            {
              id: 'demo-dish-6',
              name: 'Цезарь с курицей',
              description: 'Салат с куриной грудкой, сухариками и соусом цезарь',
              price: 280,
              category: 'european',
              category_id: 'european',
              cookingTime: 15,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.2
            },
            {
              id: 'demo-dish-7',
              name: 'Пицца Маргарита',
              description: 'Классическая пицца с томатами и моцареллой',
              price: 420,
              category: 'european',
              category_id: 'european',
              cookingTime: 25,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.7
            },
            {
              id: 'demo-dish-8',
              name: 'Щи русские',
              description: 'Традиционные русские щи с капустой',
              price: 320,
              category: 'russian',
              category_id: 'russian',
              cookingTime: 75,
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.7
            },
            // Диабетические блюда
            {
              id: 'demo-diabetic-1',
              name: 'Салат из свежих овощей',
              description: 'Свежие помидоры, огурцы, зелень с оливковым маслом',
              price: 180,
              category: 'salads',
              category_id: 'salads',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              // Диабетические данные
              carbs: 8,
              sugar: 6,
              glycemicIndex: 15,
              sugarSubstitutes: false,
              diabeticFriendly: true,
              calories: 45,
              protein: 2,
              fat: 3
            },
            {
              id: 'demo-diabetic-2',
              name: 'Куриная грудка на пару',
              description: 'Нежная куриная грудка с травами, приготовленная на пару',
              price: 320,
              category: 'main',
              category_id: 'main',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.6,
              // Диабетические данные
              carbs: 0,
              sugar: 0,
              glycemicIndex: 0,
              sugarSubstitutes: false,
              diabeticFriendly: true,
              calories: 165,
              protein: 31,
              fat: 3.6
            },
            {
              id: 'demo-diabetic-3',
              name: 'Творожная запеканка без сахара',
              description: 'Творожная запеканка с заменителем сахара и ягодами',
              price: 250,
              category: 'desserts',
              category_id: 'desserts',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.4,
              // Диабетические данные
              carbs: 12,
              sugar: 3,
              glycemicIndex: 25,
              sugarSubstitutes: true,
              diabeticFriendly: true,
              calories: 120,
              protein: 15,
              fat: 2
            },
            {
              id: 'demo-diabetic-4',
              name: 'Гречневая каша с овощами',
              description: 'Гречневая каша с тушеными овощами и зеленью',
              price: 200,
              category: 'main',
              category_id: 'main',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.3,
              // Диабетические данные
              carbs: 35,
              sugar: 8,
              glycemicIndex: 50,
              sugarSubstitutes: false,
              diabeticFriendly: true,
              calories: 180,
              protein: 6,
              fat: 4
            },
            // Готовка с продуктами от клиента
            {
              id: 'demo-client-cook-1',
              name: 'Готовка с вашими продуктами',
              description: 'Приготовлю блюдо из ваших продуктов. Загрузите фото продуктов и опишите желаемое блюдо.',
              price: 0, // Цена будет рассчитана индивидуально
              category: 'client_cook',
              category_id: 'client_cook',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              // Специальные данные для готовки с продуктами клиента
              clientCooking: true,
              customPrice: true,
              requiresProducts: true,
              estimatedTime: '2-4 часа',
              minOrderValue: 500
            },
            {
              id: 'demo-client-cook-2',
              name: 'Мастер-класс готовки',
              description: 'Научу готовить с вашими продуктами. Приходите с продуктами, готовим вместе!',
              price: 0,
              category: 'client_cook',
              category_id: 'client_cook',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              clientCooking: true,
              customPrice: true,
              requiresProducts: true,
              estimatedTime: '3-5 часов',
              minOrderValue: 800,
              isMasterClass: true
            },
            {
              id: 'demo-client-cook-3',
              name: 'Консультация по готовке',
              description: 'Помогу составить меню из ваших продуктов и дам советы по приготовлению.',
              price: 0,
              category: 'client_cook',
              category_id: 'client_cook',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.7,
              clientCooking: true,
              customPrice: true,
              requiresProducts: true,
              estimatedTime: '1-2 часа',
              minOrderValue: 300,
              isConsultation: true
            }
          ];
          allDishes.push(...demoDishes);
        }
        
        // Always add client_cook demo dishes if requesting that category
        if (category === 'client_cook') {
          const clientCookDishes = [
            {
              id: 'demo-client-cook-1',
              name: 'Готовка с вашими продуктами',
              description: 'Приготовлю блюдо из ваших продуктов. Загрузите фото продуктов и опишите желаемое блюдо.',
              price: 0,
              category: 'client_cook',
              category_id: 'client_cook',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              clientCooking: true,
              customPrice: true,
              requiresProducts: true,
              estimatedTime: '2-4 часа',
              minOrderValue: 500
            },
            {
              id: 'demo-client-cook-2',
              name: 'Мастер-класс готовки',
              description: 'Научу готовить с вашими продуктами. Приходите с продуктами, готовим вместе!',
              price: 0,
              category: 'client_cook',
              category_id: 'client_cook',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              clientCooking: true,
              customPrice: true,
              requiresProducts: true,
              estimatedTime: '3-5 часов',
              minOrderValue: 800,
              isMasterClass: true
            },
            {
              id: 'demo-client-cook-3',
              name: 'Консультация по готовке',
              description: 'Помогу составить меню из ваших продуктов и дам советы по приготовлению.',
              price: 0,
              category: 'client_cook',
              category_id: 'client_cook',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.7,
              clientCooking: true,
              customPrice: true,
              requiresProducts: true,
              estimatedTime: '1-2 часа',
              minOrderValue: 300,
              isConsultation: true
            }
          ];
          allDishes.push(...clientCookDishes);
        }
        
        // Always add help_guest demo dishes if requesting that category
        if (category === 'help_guest') {
          const helpGuestDishes = [
            {
              id: 'demo-help-guest-1',
              name: 'Подготовка к приему гостей',
              description: 'Помогу подготовить все блюда к приезду гостей. Рассчитаю время, составлю план готовки, помогу с сервировкой.',
              price: 0,
              category: 'help_guest',
              category_id: 'help_guest',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              helpGuest: true,
              customPrice: true,
              estimatedTime: '2-6 часов',
              minOrderValue: 1000,
              maxGuests: 20,
              includesPlanning: true,
              includesServing: true
            },
            {
              id: 'demo-help-guest-2',
              name: 'Экспресс-подготовка',
              description: 'Срочная помощь в подготовке к приему. Быстро накроем стол и приготовим основные блюда.',
              price: 0,
              category: 'help_guest',
              category_id: 'help_guest',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.6,
              helpGuest: true,
              customPrice: true,
              estimatedTime: '1-3 часа',
              minOrderValue: 800,
              maxGuests: 10,
              isExpress: true,
              includesPlanning: false,
              includesServing: true
            },
            {
              id: 'demo-help-guest-3',
              name: 'Полный сервис для гостей',
              description: 'Полная подготовка: меню, закупка продуктов, готовка, сервировка, уборка после гостей.',
              price: 0,
              category: 'help_guest',
              category_id: 'help_guest',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              helpGuest: true,
              customPrice: true,
              estimatedTime: '4-8 часов',
              minOrderValue: 2000,
              maxGuests: 30,
              isFullService: true,
              includesPlanning: true,
              includesServing: true,
              includesCleanup: true
            }
          ];
          allDishes.push(...helpGuestDishes);
        }
        
        // Always add master_class demo dishes if requesting that category
        if (category === 'master_class') {
          const masterClassDishes = [
            {
              id: 'demo-master-class-1',
              name: 'Мастер-класс по татарской кухне',
              description: 'Научим готовить традиционные татарские блюда: эчпочмак, кыстыбый, чак-чак. Изучим секреты национальной кухни.',
              price: 0,
              category: 'master_class',
              category_id: 'master_class',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              masterClass: true,
              customPrice: true,
              estimatedTime: '3-4 часа',
              minOrderValue: 1500,
              maxParticipants: 8,
              difficulty: 'Средний',
              cuisine: 'Татарская',
              includesIngredients: true,
              includesRecipe: true,
              includesCertificate: true
            },
            {
              id: 'demo-master-class-2',
              name: 'Искусство выпечки',
              description: 'Мастер-класс по приготовлению хлеба, пирогов и десертов. Изучим работу с дрожжевым тестом и бездрожжевой выпечкой.',
              price: 0,
              category: 'master_class',
              category_id: 'master_class',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.8,
              masterClass: true,
              customPrice: true,
              estimatedTime: '4-5 часов',
              minOrderValue: 2000,
              maxParticipants: 6,
              difficulty: 'Продвинутый',
              cuisine: 'Европейская',
              includesIngredients: true,
              includesRecipe: true,
              includesCertificate: true,
              isBaking: true
            },
            {
              id: 'demo-master-class-3',
              name: 'Основы кулинарии для начинающих',
              description: 'Базовый мастер-класс для тех, кто только начинает готовить. Научим основным техникам, работе с ножом, приготовлению соусов.',
              price: 0,
              category: 'master_class',
              category_id: 'master_class',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.7,
              masterClass: true,
              customPrice: true,
              estimatedTime: '2-3 часа',
              minOrderValue: 1000,
              maxParticipants: 10,
              difficulty: 'Начальный',
              cuisine: 'Универсальная',
              includesIngredients: true,
              includesRecipe: true,
              includesCertificate: true,
              isBasic: true
            },
            {
              id: 'demo-master-class-4',
              name: 'Секреты восточной кухни',
              description: 'Мастер-класс по приготовлению блюд восточной кухни: плов, манты, самса. Изучим специи и традиционные техники.',
              price: 0,
              category: 'master_class',
              category_id: 'master_class',
              image: null,
              chef: 'Демо повар',
              chefId: 'demo-chef-1',
              rating: 4.9,
              masterClass: true,
              customPrice: true,
              estimatedTime: '3-4 часа',
              minOrderValue: 1800,
              maxParticipants: 8,
              difficulty: 'Средний',
              cuisine: 'Восточная',
              includesIngredients: true,
              includesRecipe: true,
              includesCertificate: true,
              isEastern: true
            }
          ];
          allDishes.push(...masterClassDishes);
        }
        
        // Filter by category if specified
        let filteredDishes = allDishes;
        if (category) {
          console.log('=== FILTERING DISHES ===');
          console.log('Category to filter:', category);
          console.log('All dishes before filter:', allDishes.length);
          console.log('Sample dishes:', allDishes.slice(0, 3).map(d => ({ id: d.id, name: d.name, category: d.category, category_id: d.category_id })));
          
          filteredDishes = allDishes.filter(dish => {
            const matches = dish.category === category || dish.category_id === category;
            if (category === 'client_cook' && matches) {
              console.log('Found client_cook dish:', dish.name);
            }
            return matches;
          });
          
          console.log('Filtered dishes count:', filteredDishes.length);
          console.log('Filtered dishes:', filteredDishes.map(d => ({ id: d.id, name: d.name, category: d.category, category_id: d.category_id })));
        }
        
        resolve({
          success: true,
          dishes: filteredDishes
        });
      }, 500);
    });
  }
  
  return apiRequest(`/api/dishes${category ? `?category=${category}` : ''}`, { method: "GET" });
}

export async function placeOrder(orderData) {
  if (!API_BASE_URL || API_BASE_URL === "") {
    console.log("DEMO: Place Order", orderData);
    return new Promise((resolve) => {
      setTimeout(() => {
        const orderId = `order-${Date.now()}`;
        // Получаем chefId из первого товара в заказе или используем текущий chefId
        let chefId = 'demo-chef-1';
        if (orderData.items && orderData.items.length > 0) {
          chefId = orderData.items[0].chefId || orderData.items[0].chefEmail || 'demo-chef-1';
        }
        
        // Если не нашли chefId в товарах, пробуем найти в самом заказе
        if (chefId === 'demo-chef-1' && orderData.chefId) {
          chefId = orderData.chefId;
        }
        
        // Если все еще demo-chef-1, используем текущий chefId из localStorage
        if (chefId === 'demo-chef-1') {
          const currentChefId = localStorage.getItem('chefId');
          if (currentChefId) {
            chefId = currentChefId;
          }
        }

        const order = {
          id: orderId,
          ...orderData,
          chefId: chefId, // Добавляем chefId в заказ
          status: orderData.status || 'pending_confirmation',
          createdAt: new Date().toISOString(),
          // Добавляем правильные поля для сумм
          itemsTotal: orderData.subtotal || 0,
          deliveryFee: orderData.deliveryCost || 0,
          discount: orderData.discount || 0,
          total: orderData.payment.total || 0,
          // Добавляем информацию о транзакции
          transaction: {
            totalAmount: orderData.payment.total,
            commission: orderData.payment.commission || 0,
            chefAmount: orderData.payment.chefAmount || orderData.payment.total,
            status: 'reserved', // Деньги зарезервированы
            paymentMethod: orderData.payment.method
          }
        };
        
        // Save order to localStorage with size limit
        const orders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
        orders.push(order);
        
        // Безопасно сохраняем заказы с ограничением размера
        safeSetClientOrders(orders);
        
        // Create notification for chef
        createChefNotification(order);
        
        // Отправляем WebSocket событие (если доступно)
        if (window.socket && window.socket.connected) {
          window.socket.emit('newOrder', {
            orderId: order.id,
            chefId: chefId,
            clientId: order.customer?.id || 'unknown',
            status: order.status,
            timestamp: new Date().toISOString()
          });
        }
        
        resolve({
          success: true,
          order: order,
          message: 'Заказ успешно оформлен'
        });
      }, 1000);
    });
  }
  
  return apiRequest(`/api/orders`, {
    method: "POST",
    body: JSON.stringify(orderData)
  });
}

// Функция для получения продуктов фермерского рынка
export const getFarmersMarketProducts = async (category = null) => {
  console.log('DEMO: Get Farmers Market Products for category:', category);
  
  // Загружаем продукты, добавленные поварами
  const chefProducts = [];
  try {
    // Получаем все ключи из localStorage, которые начинаются с 'chef_products_'
    const allKeys = Object.keys(localStorage);
    const chefProductKeys = allKeys.filter(key => key.startsWith('chef_products_'));
    
    for (const key of chefProductKeys) {
      const products = JSON.parse(localStorage.getItem(key) || '[]');
      chefProducts.push(...products);
    }
    
    console.log('Loaded chef products:', chefProducts);
  } catch (error) {
    console.error('Error loading chef products:', error);
  }
  
  // Демо продукты фермерского рынка
  const demoProducts = [
    {
      id: 'prod-1',
      name: 'Свежие помидоры',
      description: 'Органические помидоры с местной фермы',
      price: 120,
      unit: 'кг',
      category: 'vegetables',
      farmer: 'Ферма "Зеленый сад"',
      origin: 'Казань, Татарстан',
      available: true,
      seasonal: true,
      organic: true,
      rating: 4.8,
      reviews: 15,
      image: null,
      type: 'product'
    },
    {
      id: 'prod-2',
      name: 'Домашний творог',
      description: 'Свежий творог из коровьего молока',
      price: 180,
      unit: 'кг',
      category: 'dairy',
      farmer: 'Молочная ферма "Буренка"',
      origin: 'Зеленодольск, Татарстан',
      available: true,
      seasonal: false,
      organic: true,
      rating: 4.9,
      reviews: 23,
      image: null,
      type: 'product'
    },
    {
      id: 'prod-3',
      name: 'Мед липовый',
      description: 'Натуральный липовый мед',
      price: 450,
      unit: 'л',
      category: 'honey',
      farmer: 'Пасека "Медовый край"',
      origin: 'Арск, Татарстан',
      available: true,
      seasonal: true,
      organic: true,
      rating: 5.0,
      reviews: 8,
      image: null,
      type: 'product'
    },
    {
      id: 'prod-4',
      name: 'Морковь свежая',
      description: 'Свежая морковь с грядки',
      price: 80,
      unit: 'кг',
      category: 'vegetables',
      farmer: 'Ферма "Овощной рай"',
      origin: 'Набережные Челны, Татарстан',
      available: true,
      seasonal: false,
      organic: false,
      rating: 4.5,
      reviews: 12,
      image: null,
      type: 'product'
    },
    {
      id: 'prod-5',
      name: 'Яблоки антоновка',
      description: 'Сочные яблоки сорта антоновка',
      price: 100,
      unit: 'кг',
      category: 'fruits',
      farmer: 'Сад "Яблочный край"',
      origin: 'Елабуга, Татарстан',
      available: true,
      seasonal: true,
      organic: true,
      rating: 4.7,
      reviews: 18,
      image: null,
      type: 'product'
    }
  ];
  
  // Объединяем демо-продукты с продуктами поваров
  const allProducts = [...demoProducts, ...chefProducts];
  
  // Если указана категория, фильтруем продукты
  if (category) {
    const filteredProducts = allProducts.filter(product => product.category === category);
    console.log('Filtered products for category', category, ':', filteredProducts);
    return filteredProducts;
  }
  
  return allProducts;
};

// Функция для создания запроса на приготовление
export const createCookingRequest = async (requestData) => {
  console.log('DEMO: Create Cooking Request:', requestData);
  
  // В реальном приложении здесь был бы API запрос
  const requestId = `cooking-request-${Date.now()}`;
  
  const cookingRequest = {
    id: requestId,
    ...requestData,
    status: 'pending',
    createdAt: new Date().toISOString(),
    estimatedPrice: requestData.cookingPrice || 0
  };
  
  // Сохраняем запрос в localStorage
  const existingRequests = JSON.parse(localStorage.getItem('cookingRequests') || '[]');
  existingRequests.push(cookingRequest);
  localStorage.setItem('cookingRequests', JSON.stringify(existingRequests));
  
  return cookingRequest;
};

// Функция для обновления статуса заказа
export async function updateOrderStatus(orderId, newStatus, chefId = null) {
  if (!API_BASE_URL || API_BASE_URL === "") {
    console.log("DEMO: Update Order Status", { orderId, newStatus, chefId });
    return new Promise((resolve) => {
      setTimeout(() => {
        // Обновляем заказ в localStorage
        const clientOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
        const updatedOrders = clientOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
            : order
        );
        
        // Безопасно сохраняем заказы с ограничением размера
        safeSetClientOrders(updatedOrders);

        // Создаем уведомление для клиента
        const clientNotifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
        const notification = {
          id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'orderUpdate',
          title: 'Обновление заказа',
          message: `Статус заказа #${orderId} изменен на: ${getStatusText(newStatus)}`,
          orderId: orderId,
          status: newStatus,
          timestamp: new Date().toISOString(),
          read: false
        };
        
        const updatedNotifications = [notification, ...clientNotifications].slice(0, 50);
        localStorage.setItem('clientNotifications', JSON.stringify(updatedNotifications));

        // Отправляем WebSocket событие
        if (window.socket && window.socket.connected) {
          window.socket.emit('statusUpdate', {
            orderId,
            status: newStatus,
            timestamp: new Date().toISOString(),
            type: 'client'
          });
        }

        resolve({ success: true, orderId, newStatus });
      }, 500);
    });
  }

  // Реальный API вызов
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status: newStatus, chefId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

// Функция для получения текста статуса на русском языке
function getStatusText(status) {
  const statusMap = {
    'pending_confirmation': 'Ожидает подтверждения',
    'confirmed': 'Подтвержден',
    'preparing': 'Готовится',
    'ready': 'Готов',
    'out_for_delivery': 'В пути',
    'delivered': 'Доставлен',
    'cancelled': 'Отменен',
    'completed': 'Завершен'
  };
  return statusMap[status] || status;
}


