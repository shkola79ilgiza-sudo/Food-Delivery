/**
 * Адаптер для совместимости старого API с новым Backend
 * Преобразует вызовы старого API в вызовы нового Backend API
 */

import { authAPI, dishesAPI, ordersAPI, reviewsAPI } from './backend';
// Импортируем старый API для fallback
import * as oldAPI from '../api';

// Флаг для переключения между mock и реальным backend
const USE_REAL_BACKEND = false; // Временно используем mock данные, пока Backend не запущен

// Константы категорий (для совместимости со старым API)
export const Categories = [
  { id: 'main', name: 'Основные блюда', icon: '🍖' },
  { id: 'salads', name: 'Салаты', icon: '🥗' },
  { id: 'soups', name: 'Супы', icon: '🍲' },
  { id: 'desserts', name: 'Десерты', icon: '🍰' },
  { id: 'beverages', name: 'Напитки', icon: '🥤' },
  { id: 'bakery', name: 'Выпечка', icon: '🥐' },
  { id: 'semi-finished', name: 'Полуфабрикаты', icon: '🥟' },
  { id: 'tatar', name: 'Татарская кухня', icon: '🍜' },
  { id: 'halal', name: 'Халяль', icon: '☪️' },
  { id: 'diet', name: 'Диетическое меню', icon: '🥬' },
];

/**
 * Получить доступные блюда
 */
export const getAvailableDishes = async (categoryId) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.getAvailableDishes(categoryId);
  }

  try {
    // Маппинг категорий frontend → backend
    const categoryMap = {
      'main': 'MAIN_COURSE',
      'salads': 'SALAD',
      'soups': 'SOUP',
      'desserts': 'DESSERT',
      'beverages': 'BEVERAGE',
      'bakery': 'DESSERT', // Выпечка как десерты
      'semi-finished': 'SEMI_FINISHED',
      'tatar': 'MAIN_COURSE', // Татарская кухня как основное блюдо
      'halal': 'MAIN_COURSE', // Халяль как основное блюдо
      'diet': 'MAIN_COURSE',  // Диет меню как основное блюдо
    };

    const backendCategory = categoryMap[categoryId];
    
    const params = {};
    if (backendCategory) {
      params.category = backendCategory;
    }

    // Если нет категории, получаем все блюда
    const dishes = await dishesAPI.getAll(params);

    // Если категория не найдена в базе, возвращаем пустой массив
    if (!dishes || dishes.length === 0) {
      return {
        success: true,
        dishes: [],
        message: `Блюда категории "${categoryId}" не найдены`
      };
    }

    // Преобразуем формат backend → frontend
    return {
      success: true,
      dishes: dishes.map(dish => ({
        id: dish.id,
        name: dish.name,
        description: dish.description,
        category: dish.category,
        price: dish.price,
        image: dish.image,
        calories: dish.calories,
        protein: dish.protein,
        carbs: dish.carbs,
        fat: dish.fat,
        fiber: dish.fiber,
        ingredients: dish.ingredients ? dish.ingredients.split(',').map(i => i.trim()) : [],
        tags: dish.tags ? dish.tags.split(',').map(t => t.trim()) : [],
        isVegan: dish.isVegan,
        isHalal: dish.isHalal,
        isGlutenFree: dish.isGlutenFree,
        diabeticFriendly: dish.diabeticFriendly,
        cookingTime: dish.cookingTime,
        servingSize: dish.servingSize,
        rating: dish.rating,
        reviewsCount: dish.reviewsCount,
        ordersCount: dish.ordersCount,
        isAvailable: dish.isAvailable,
        chef: dish.chef ? {
          id: dish.chef.id,
          name: `${dish.chef.user.firstName} ${dish.chef.user.lastName}`,
          rating: dish.chef.rating,
          specialization: dish.chef.specialization,
        } : null,
      })),
    };
  } catch (error) {
    console.error('Error fetching dishes from backend:', error);
    
    // Если ошибка 500, возвращаем пустой массив вместо ошибки
    if (error.status === 500 || error.message?.includes('500')) {
      return {
        success: true,
        dishes: [],
        message: `Блюда категории "${categoryId}" не найдены в базе данных`
      };
    }
    
    return {
      success: false,
      error: error.message,
      dishes: [],
    };
  }
};

/**
 * Получить все блюда
 */
export const getAllDishes = async () => {
  // Используем getAvailableDishes без категории
  return getAvailableDishes(null);
};

/**
 * Создать заказ
 */
export const createOrder = async (orderData) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.placeOrder(orderData);
  }

  try {
    // Преобразуем формат frontend → backend
    const backendOrderData = {
      items: orderData.items.map(item => ({
        dishId: item.dishId,
        quantity: item.quantity,
        notes: item.notes || '',
      })),
      deliveryAddress: orderData.deliveryAddress,
      notes: orderData.notes || '',
    };

    const order = await ordersAPI.create(backendOrderData);

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items,
        createdAt: order.createdAt,
      },
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Получить заказы клиента
 */
export const getClientOrders = async () => {
  if (!USE_REAL_BACKEND) {
    // Старый API не имеет этой функции, возвращаем пустой массив
    return { success: true, orders: [] };
  }

  try {
    const orders = await ordersAPI.getMyOrders();
    return {
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.items,
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
      })),
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return {
      success: false,
      error: error.message,
      orders: [],
    };
  }
};

/**
 * Получить меню повара
 */
export const getChefMenu = async (chefId, categoryId) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.getChefMenu(chefId, categoryId);
  }

  try {
    let dishes;
    if (chefId === 'me' || !chefId) {
      dishes = await dishesAPI.getMyDishes();
    } else {
      dishes = await dishesAPI.getByChef(chefId);
    }

    // Фильтрация по категории если указана
    if (categoryId && dishes) {
      const categoryMap = {
        'main': 'MAIN_COURSE',
        'salads': 'SALAD',
        'soups': 'SOUP',
        'desserts': 'DESSERT',
        'beverages': 'BEVERAGE',
        'bakery': 'DESSERT',
        'semi-finished': 'SEMI_FINISHED',
        'tatar': 'MAIN_COURSE',
        'halal': 'MAIN_COURSE',
        'diet': 'MAIN_COURSE',
      };
      const backendCategory = categoryMap[categoryId];
      dishes = dishes.filter(dish => dish.category === backendCategory);
    }

    return {
      success: true,
      dishes: dishes || [],
    };
  } catch (error) {
    console.error('Error fetching chef menu:', error);
    return {
      success: false,
      error: error.message,
      dishes: [],
    };
  }
};

/**
 * Создать блюдо
 */
export const createDish = async (chefId, dishData) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.createDish(chefId, dishData);
  }

  try {
    // Маппинг категорий frontend → backend
    const categoryMap = {
      'main': 'MAIN_COURSE',
      'salads': 'SALAD',
      'soups': 'SOUP',
      'desserts': 'DESSERT',
      'beverages': 'BEVERAGE',
      'bakery': 'DESSERT',
      'semi-finished': 'SEMI_FINISHED',
      'tatar': 'MAIN_COURSE',
      'halal': 'MAIN_COURSE',
      'diet': 'MAIN_COURSE',
    };

    const backendDishData = {
      name: dishData.name,
      description: dishData.description,
      category: categoryMap[dishData.category] || 'MAIN_COURSE',
      price: parseFloat(dishData.price),
      image: dishData.image || '',
      calories: parseInt(dishData.calories) || 0,
      protein: parseFloat(dishData.protein) || 0,
      carbs: parseFloat(dishData.carbs) || 0,
      fat: parseFloat(dishData.fat) || 0,
      fiber: parseFloat(dishData.fiber) || 0,
      ingredients: Array.isArray(dishData.ingredients) 
        ? dishData.ingredients.join(', ') 
        : dishData.ingredients || '',
      tags: Array.isArray(dishData.tags) 
        ? dishData.tags.join(', ') 
        : dishData.tags || '',
      isVegan: dishData.isVegan || false,
      isHalal: dishData.isHalal || false,
      isGlutenFree: dishData.isGlutenFree || false,
      diabeticFriendly: dishData.diabeticFriendly || false,
      cookingTime: parseInt(dishData.cookingTime) || 30,
      servingSize: dishData.servingSize || '1 порция',
      isAvailable: dishData.isAvailable !== false,
    };

    const dish = await dishesAPI.create(backendDishData);

    return {
      success: true,
      dish,
      message: 'Блюдо успешно создано',
    };
  } catch (error) {
    console.error('Error creating dish:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Обновить блюдо
 */
export const updateDish = async (chefId, dishId, updates) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.updateDish(chefId, dishId, updates);
  }

  try {
    // Маппинг категорий frontend → backend
    const categoryMap = {
      'main': 'MAIN_COURSE',
      'salads': 'SALAD',
      'soups': 'SOUP',
      'desserts': 'DESSERT',
      'beverages': 'BEVERAGE',
      'bakery': 'DESSERT',
      'semi-finished': 'SEMI_FINISHED',
      'tatar': 'MAIN_COURSE',
      'halal': 'MAIN_COURSE',
      'diet': 'MAIN_COURSE',
    };

    const backendUpdates = { ...updates };
    
    if (updates.category && categoryMap[updates.category]) {
      backendUpdates.category = categoryMap[updates.category];
    }

    if (updates.ingredients && Array.isArray(updates.ingredients)) {
      backendUpdates.ingredients = updates.ingredients.join(', ');
    }

    if (updates.tags && Array.isArray(updates.tags)) {
      backendUpdates.tags = updates.tags.join(', ');
    }

    const dish = await dishesAPI.update(dishId, backendUpdates);

    return {
      success: true,
      dish,
      message: 'Блюдо успешно обновлено',
    };
  } catch (error) {
    console.error('Error updating dish:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Удалить блюдо
 */
export const deleteDish = async (chefId, dishId) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.deleteDish(chefId, dishId);
  }

  try {
    await dishesAPI.delete(dishId);
    
    return {
      success: true,
      message: 'Блюдо успешно удалено',
    };
  } catch (error) {
    console.error('Error deleting dish:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Логин пользователя
 */
export const login = async (email, password, role = 'client') => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.login(email, password, role);
  }

  try {
    const data = await authAPI.login(email, password);
    
    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error('Error logging in:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Регистрация пользователя
 */
export const register = async (userData) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.register(userData);
  }

  try {
    const data = await authAPI.register(userData);
    
    return {
      success: true,
      user: data.user,
      token: data.token,
    };
  } catch (error) {
    console.error('Error registering:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Получить профиль пользователя
 */
export const getProfile = async () => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.getProfile();
  }

  try {
    const user = await authAPI.getMe();
    
    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Обновить статус заказа
 */
export const updateOrderStatus = async (orderId, newStatus, chefId = null) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.updateOrderStatus(orderId, newStatus, chefId);
  }

  try {
    const order = await ordersAPI.updateStatus(orderId, newStatus);
    
    return {
      success: true,
      order,
      message: 'Статус заказа обновлен',
    };
  } catch (error) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Получить данные повара
 */
export const getChefData = async (chefId) => {
  if (!USE_REAL_BACKEND) {
    return oldAPI.getChefData(chefId);
  }

  try {
    // Backend API пока не имеет этого метода, используем fallback
    return oldAPI.getChefData(chefId);
  } catch (error) {
    console.error('Error fetching chef data:', error);
    return null;
  }
};

/**
 * Оформить заказ (алиас для createOrder)
 */
export const placeOrder = async (orderData) => {
  return createOrder(orderData);
};

/**
 * Получить продукты фермерского рынка
 */
export const getFarmersMarketProducts = async (category = null) => {
  // Backend API пока не имеет этого метода, используем fallback
  return oldAPI.getFarmersMarketProducts(category);
};

/**
 * Создать запрос на приготовление
 */
export const createCookingRequest = async (requestData) => {
  // Backend API пока не имеет этого метода, используем fallback
  return oldAPI.createCookingRequest(requestData);
};

// Экспортируем флаг для проверки
export { USE_REAL_BACKEND };

