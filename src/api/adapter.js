/**
 * Адаптер для совместимости старого API с новым Backend
 * Преобразует вызовы старого API в вызовы нового Backend API
 */

import { dishesAPI, ordersAPI } from './backend';
// Импортируем старый API для fallback
import * as oldAPI from '../api';

// Флаг для переключения между mock и реальным backend
const USE_REAL_BACKEND = true;

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
      'bakery': 'MAIN_COURSE', // Временно маппим на MAIN_COURSE
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

// Экспортируем флаг для проверки
export { USE_REAL_BACKEND };

