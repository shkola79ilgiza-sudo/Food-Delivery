import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAvailableDishes } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import Rating from './Rating';
import HolidayAnalytics from './HolidayAnalytics';
import OrderHistoryAnalysis from './OrderHistoryAnalysis';
import QuickOrder from './QuickOrder';
import QuickAddToCart from './QuickAddToCart';
import PushNotifications from './PushNotifications';
import MenuFilters from './MenuFilters';
import DishDetails from './DishDetails';
import { useNotifications } from '../hooks/useNotifications';
import ClientCookingRequest from './ClientCookingRequest';
import ClientCookingRequests from './ClientCookingRequests';
import HelpGuestRequest from './HelpGuestRequest';
import MasterClassRequest from './MasterClassRequest';
import ClientHelpGuestRequests from './ClientHelpGuestRequests';
import ClientNotifications from './ClientNotifications';
import DiabeticMenuSection from './DiabeticMenuSection';
import StarRating from './StarRating';
import ReviewModal from './ReviewModal';
import AIRecommendations from './AIRecommendations';
import AnimatedIcon from './AnimatedIcon';
import ComplaintSystem from './ComplaintSystem';
import OrderTracking from './OrderTracking';
import ClientOrderHistory from './ClientOrderHistory';
import ClientFavorites from './ClientFavorites';
import ClientAddresses from './ClientAddresses';
import DishCardWithDiabeticCheck from './DishCardWithDiabeticCheck';

const ClientMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [filteredDishes, setFilteredDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDish, setSelectedDish] = useState(null);
  const [showDishDetails, setShowDishDetails] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diabeticFilter, setDiabeticFilter] = useState(false);
  const [maxCarbs, setMaxCarbs] = useState(30);
  const [maxSugar, setMaxSugar] = useState(10);
  const [hideHighSugar, setHideHighSugar] = useState(false);
  
  // Новые фильтры
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [halalFilter, setHalalFilter] = useState(false);
  const [dietFilter, setDietFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [cookingTimeFilter, setCookingTimeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Расширенные фильтры
  const [allergenFilter, setAllergenFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [calorieFilter, setCalorieFilter] = useState({ min: 0, max: 2000 });
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [spiceLevelFilter, setSpiceLevelFilter] = useState('all');
  const [vegetarianFilter, setVegetarianFilter] = useState(false);
  const [veganFilter, setVeganFilter] = useState(false);
  const [showHolidayAnalytics, setShowHolidayAnalytics] = useState(false);
  
  // Состояния для системы рейтингов
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDishForReview, setSelectedDishForReview] = useState(null);
  
  // Состояние для AI-рекомендаций
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showOrderAnalysis, setShowOrderAnalysis] = useState(false);
  const [animatingItems, setAnimatingItems] = useState([]);
  const [cartPulsing, setCartPulsing] = useState(false);
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [showCookingRequest, setShowCookingRequest] = useState(false);
  const [showCookingRequests, setShowCookingRequests] = useState(false);
  const [selectedCookingDish, setSelectedCookingDish] = useState(null);
  const [showHelpGuestRequest, setShowHelpGuestRequest] = useState(false);
  const [selectedHelpGuestDish, setSelectedHelpGuestDish] = useState(null);
  const [showMasterClassRequest, setShowMasterClassRequest] = useState(false);
  const [selectedMasterClassDish, setSelectedMasterClassDish] = useState(null);
  const [showClientNotifications, setShowClientNotifications] = useState(false);
  const [showDiabeticMenu, setShowDiabeticMenu] = useState(false);
  const [showHelpGuestRequests, setShowHelpGuestRequests] = useState(false);
  
  // Новые состояния для фич
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [showAddresses, setShowAddresses] = useState(false);
  
  // Используем WebSocket для уведомлений клиента
  const { unreadCount, joinRoom, leaveRoom, addNotification } = useNotifications('client');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Функция для переключения между разделами
  const switchToSection = (section) => {
    // Закрываем все разделы
    setShowCookingRequests(false);
    setShowHelpGuestRequests(false);
    setShowClientNotifications(false);
    setShowDiabeticMenu(false);
    
    // Открываем нужный раздел
    switch(section) {
      case 'cooking-requests':
        setShowCookingRequests(true);
        break;
      case 'help-guest-requests':
        setShowHelpGuestRequests(true);
        break;
      case 'notifications':
        setShowClientNotifications(true);
        break;
      case 'diabetic-menu':
        setShowDiabeticMenu(true);
        break;
      case 'orders':
        // Для заказов используем навигацию
        navigate('/client/orders');
        break;
      default:
        break;
    }
  };

  // Подключаемся к комнате клиента при монтировании
  useEffect(() => {
    const clientId = localStorage.getItem('clientId') || 'demo_client';
    joinRoom(clientId);
    
    return () => {
      leaveRoom(clientId);
    };
  }, [joinRoom, leaveRoom]);

  // Слушаем события уведомлений
  useEffect(() => {
    const handleNotificationAdded = (event) => {
      // Перезагружаем уведомления
      const clientId = localStorage.getItem('clientId') || 'demo_client';
      joinRoom(clientId);
    };

    const handleNotificationsUpdated = () => {
      // Перезагружаем уведомления
      const clientId = localStorage.getItem('clientId') || 'demo_client';
      joinRoom(clientId);
    };

    window.addEventListener('clientNotificationAdded', handleNotificationAdded);
    window.addEventListener('clientNotificationsUpdated', handleNotificationsUpdated);

    return () => {
      window.removeEventListener('clientNotificationAdded', handleNotificationAdded);
      window.removeEventListener('clientNotificationsUpdated', handleNotificationsUpdated);
    };
  }, [joinRoom]);

  // Слушаем события обновления уведомлений для бейджей
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      try {
        // Перезагружаем уведомления для обновления счетчика
        const clientId = localStorage.getItem('clientId') || 'demo_client';
        joinRoom(clientId);
        
        // Обновляем счетчик непрочитанных уведомлений
        const notifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        // unreadCount уже управляется хуком useNotifications
      } catch (error) {
        console.error('Error handling notifications update:', error);
      }
    };

    window.addEventListener('clientNotificationsUpdated', handleNotificationsUpdated);

    return () => {
      window.removeEventListener('clientNotificationsUpdated', handleNotificationsUpdated);
    };
  }, [joinRoom]);


  // Константы для фильтров
  const cuisines = [
    { id: 'all', name: 'Все кухни' },
    { id: 'tatar', name: 'Татарская' },
    { id: 'russian', name: 'Русская' },
    { id: 'european', name: 'Европейская' },
    { id: 'asian', name: 'Азиатская' },
    { id: 'mediterranean', name: 'Средиземноморская' },
    { id: 'american', name: 'Американская' }
  ];

  const diets = [
    { id: 'all', name: 'Любая диета' },
    { id: 'vegetarian', name: 'Вегетарианская' },
    { id: 'vegan', name: 'Веганская' },
    { id: 'keto', name: 'Кето' },
    { id: 'paleo', name: 'Палео' },
    { id: 'low_carb', name: 'Низкоуглеводная' },
    { id: 'gluten_free', name: 'Без глютена' }
  ];

  const cookingTimes = [
    { id: 'all', name: 'Любое время' },
    { id: 'fast', name: 'Быстро (до 30 мин)', max: 30 },
    { id: 'medium', name: 'Средне (30-60 мин)', min: 30, max: 60 },
    { id: 'slow', name: 'Долго (60+ мин)', min: 60 }
  ];

  // Расширенные константы для фильтров
  const allergens = [
    { id: 'gluten', name: 'Глютен', icon: '??' },
    { id: 'dairy', name: 'Молочные продукты', icon: '??' },
    { id: 'nuts', name: 'Орехи', icon: '??' },
    { id: 'eggs', name: 'Яйца', icon: '??' },
    { id: 'soy', name: 'Соя', icon: '??' },
    { id: 'fish', name: 'Рыба', icon: '??' },
    { id: 'shellfish', name: 'Морепродукты', icon: '??' },
    { id: 'sesame', name: 'Кунжут', icon: '??' }
  ];

  const spiceLevels = [
    { id: 'all', name: 'Любая острота' },
    { id: 'mild', name: 'Не острое', level: 0 },
    { id: 'medium', name: 'Средне острое', level: 1 },
    { id: 'hot', name: 'Острое', level: 2 },
    { id: 'very_hot', name: 'Очень острое', level: 3 }
  ];


  // Слушаем изменения корзины для синхронизации между компонентами
  useEffect(() => {
    const handleCartChange = () => {
      console.log('ClientMenu: Cart change event received, reloading...');
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
    };
    
    const handleCartUpdated = () => {
      console.log('ClientMenu: Cart updated event received, reloading...');
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        console.log('ClientMenu: Cart changed in localStorage, reloading...');
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
      }
    };
    
    window.addEventListener('cartChanged', handleCartChange);
    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartChanged', handleCartChange);
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Предопределенные категории
  const categories = [
    { id: 'halal', name: t.halalMenu, icon: '??' },
    { id: 'main', name: t.mainDishes, icon: '???' },
    { id: 'semi-finished', name: t.semiFinished, icon: '??' },
    { id: 'bakery', name: t.bakery, icon: '??' },
    { id: 'tatar', name: t.tatarCuisine, icon: '??' },
    { id: 'soups', name: t.soups, icon: '??' },
    { id: 'salads', name: t.salads, icon: '??' },
    { id: 'desserts', name: t.desserts, icon: '??' },
    { id: 'beverages', name: t.beverages, icon: '?•' },
    { id: 'diet', name: t.dietMenu, icon: '??' },
    { id: 'diabetic', name: (t.diabeticMenu && (t.diabeticMenu.title || t.diabeticMenu)) || 'Диабетическое меню', icon: '??', isSpecial: true },
    { id: 'client_cook', name: t.clientCooking, icon: '?????' },
    { id: 'master_class', name: t.masterClass, icon: '?????' },
    { id: 'help_guest', name: t.helpGuest, icon: '??' },
    { id: 'preparations', name: t.preparations, icon: '??' },
  ];

  // Загрузка блюд при выборе категории
  useEffect(() => {
    if (selectedCategory) {
    const fetchDishes = async () => {
        setLoading(true);
        try {
           // Отладочная информация убрана для предотвращения бесконечных ререндеров
          
          // Передаем ID категории в API для фильтрации
          const response = await getAvailableDishes(selectedCategory.id);
          if (response.success) {
            setDishes(response.dishes);
            setFilteredDishes(response.dishes); // Инициализируем фильтрованные блюда
        } else {
          setError('Не удалось загрузить меню');
        }
      } catch (err) {
        setError('Ошибка при загрузке меню');
        console.error('Error fetching dishes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
    }
  }, [selectedCategory]);

  // Загрузка корзины из localStorage при инициализации
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          console.log('?? Cart loaded from localStorage:');
          console.log('  - Items count:', parsedCart.length);
          console.log('  - Size in bytes:', new Blob([savedCart]).size);
          console.log('  - Size in KB:', (new Blob([savedCart]).size / 1024).toFixed(2));
          
          setCart(parsedCart);
        } catch (err) {
          console.error('Error parsing cart from localStorage:', err);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    };
    
    loadCart();
  }, []);

  // Сохранение корзины в localStorage при изменении (только если корзина не пустая)
  useEffect(() => {
    if (cart.length > 0) {
      try {
        const cartString = JSON.stringify(cart);
        const cartSize = new Blob([cartString]).size;
        
        console.log('?? Saving cart to localStorage:');
        console.log('  - Items count:', cart.length);
        console.log('  - Size in bytes:', cartSize);
        console.log('  - Size in KB:', (cartSize / 1024).toFixed(2));
        
        localStorage.setItem('cart', cartString);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart]);

  // Про?ерка а?торизации
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
    }
  }, [navigate]);

  // Функция для про?ерки диабетических блюд
  const isDiabeticFriendly = (dish) => {
    if (!diabeticFilter) return true;
    
    const carbs = dish.carbs || 0;
    const sugar = dish.sugar || 0;
    
     // Про?еряем лимиты угле?одо? и сахара
    if (carbs > maxCarbs || sugar > maxSugar) return false;
    
     // Скры?аем блюда с ?ысоким содержанием сахара если ?ключен фильтр
    if (hideHighSugar && sugar > 15) return false;
    
    return true;
  };

  // Расширенная функция фильтрации
  const isDishMatchingFilters = (dish) => {
    // Диабетический фильтр
    if (diabeticFilter && !isDiabeticFriendly(dish)) {
      return false;
    }

    // Фильтр по кухне
    if (cuisineFilter !== 'all' && dish.cuisine !== cuisineFilter) {
      return false;
    }

    // Фильтр халяль
    if (halalFilter && !dish.halal) {
      return false;
    }

    // Фильтр по диете
    if (dietFilter !== 'all' && !dish.diets?.includes(dietFilter)) {
      return false;
    }

    // Фильтр по цене
    if (dish.price < priceRange.min || dish.price > priceRange.max) {
      return false;
    }

    // Фильтр по ?ремени пригото?ления
    if (cookingTimeFilter !== 'all') {
      const timeFilter = cookingTimes.find(t => t.id === cookingTimeFilter);
      if (timeFilter) {
        const dishCookingTime = dish.cookingTime || 30; // По умолчанию 30 минут
        if (timeFilter.min && dishCookingTime < timeFilter.min) {
          return false;
        }
        if (timeFilter.max && dishCookingTime > timeFilter.max) {
          return false;
        }
      }
    }

    // Фильтр по аллергенам (исключаем блюда с выбранными аллергенами)
    if (allergenFilter.length > 0) {
      const dishAllergens = dish.allergens || [];
      const hasExcludedAllergen = allergenFilter.some(allergen => 
        dishAllergens.includes(allergen)
      );
      if (hasExcludedAllergen) {
        return false;
      }
    }

    // Фильтр по рейтингу
    if (ratingFilter > 0 && (dish.rating || 0) < ratingFilter) {
      return false;
    }

    // Фильтр по калориям
    if (dish.calories) {
      if (dish.calories < calorieFilter.min || dish.calories > calorieFilter.max) {
        return false;
      }
    }

    // Фильтр по ингредиентам
    if (ingredientFilter.trim()) {
      const ingredients = dish.ingredients || '';
      if (!ingredients.toLowerCase().includes(ingredientFilter.toLowerCase())) {
        return false;
      }
    }

    // Фильтр по остроте
    if (spiceLevelFilter !== 'all') {
      const spiceLevel = spiceLevels.find(s => s.id === spiceLevelFilter);
      if (spiceLevel && (dish.spiceLevel || 0) !== spiceLevel.level) {
        return false;
      }
    }

    // Фильтр по вегетарианству
    if (vegetarianFilter && !dish.isVegetarian) {
      return false;
    }

    // Фильтр по веганству
    if (veganFilter && !dish.isVegan) {
      return false;
    }


    return true;
  };

  // Сортиро?ка блюд (фильтрация теперь в MenuFilters)
  const sortedDishes = [...filteredDishes].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'price-asc') {
      return a.price - b.price;
    } else if (sortBy === 'price-desc') {
      return b.price - a.price;
    } else if (sortBy === 'cooking-time') {
      return (a.cookingTime || 30) - (b.cookingTime || 30);
    } else if (sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  // Отладочная информация для client_cook
  // Отладочная информация убрана для предот?ращения бесконечных ререндеро?

  // Обработчик ?ыбора категории
  const handleCategorySelect = (category) => {
    // Если это фермерский рынок, переходим на отдельную страницу
    if (category.id === 'farmers_market') {
      navigate('/client/farmers-market');
      return;
    }
    
    // Если это диабетическое меню, ?ключаем фильтр и показы?аем диабетические индикаторы
    if (category.id === 'diabetic') {
      setDiabeticFilter(true);
      setShowDiabeticMenu(true);
      setSelectedCategory(category);
      return;
    }
    
    setSelectedCategory(category);
    setShowDiabeticMenu(false); // Сбрасы?аем показ диабетических индикаторо?
    setDishes([]); // Очищаем блюда при ?ыборе но?ой категории
  };

  // Воз?рат к ?ыбору категории
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowDiabeticMenu(false); // Сбрасы?аем показ диабетических индикаторо?
    setDishes([]);
  };

  // Обработчик клика на блюдо для гото?ки с продуктами клиента
  const handleCookingRequest = (dish) => {
    if (dish.clientCooking) {
      setSelectedCookingDish(dish);
      setShowCookingRequest(true);
    }
  };

  // Обработчик отпра?ки запроса на гото?ку
  const handleCookingRequestSubmit = async (requestData) => {
    try {
      console.log('Cooking request submitted:', requestData);
      // Здесь будет отпра?ка запроса на гото?ку
      // В реальном приложении это будет API запрос
      showSuccess('Запрос на гото?ку отпра?лен! По?ар с?яжется с ?ами ? ближайшее ?ремя.');
    } catch (error) {
      console.error('Error submitting cooking request:', error);
      showError('Ошибка при отпра?ке запроса. Попробуйте еще раз.');
    }
  };

  // Обработчик клика на блюдо для помощи гостям
  const handleHelpGuestRequest = (dish) => {
    if (dish.helpGuest) {
      setSelectedHelpGuestDish(dish);
      setShowHelpGuestRequest(true);
    }
  };

  // Обработчик отпра?ки запроса помощи гостям
  const handleHelpGuestRequestSubmit = async (requestData) => {
    try {
      // Создаем запрос на помощь гостям
      const helpRequest = {
        id: `help-request-${Date.now()}`,
        type: 'help_guest',
        status: 'pending',
        clientId: localStorage.getItem('clientId') || 'demo_client',
        clientName: localStorage.getItem('clientName') || 'Клиент',
        dishId: requestData.dishId,
        dishName: requestData.dishName || 'Помощь ? гото?ке',
        chefId: requestData.chefId,
        eventDate: requestData.eventDate,
        eventTime: requestData.eventTime,
        numberOfGuests: requestData.numberOfGuests,
        eventType: requestData.eventType,
        budget: requestData.budget,
        specialRequests: requestData.specialRequests,
        contactPhone: requestData.contactPhone,
        address: requestData.address,
        dietaryRestrictions: requestData.dietaryRestrictions,
        preferredCuisine: requestData.preferredCuisine,
        servingStyle: requestData.servingStyle,
        estimatedTime: requestData.estimatedTime,
        minOrderValue: requestData.minOrderValue,
        maxGuests: requestData.maxGuests,
        includesPlanning: requestData.includesPlanning,
        includesServing: requestData.includesServing,
        includesCleanup: requestData.includesCleanup,
        isExpress: requestData.isExpress,
        isFullService: requestData.isFullService,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Сохраняем запрос ? localStorage
      const existingRequests = JSON.parse(localStorage.getItem('helpGuestRequests') || '[]');
      const updatedRequests = [helpRequest, ...existingRequests];
      localStorage.setItem('helpGuestRequests', JSON.stringify(updatedRequests));

      // Отпра?ляем у?едомление по?ару
      const chefNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'help_guest_request',
        title: 'Но?ый запрос на помощь гостям',
        message: `Клиент ${helpRequest.clientName} запросил помощь ? подгото?ке к приему гостей на ${helpRequest.eventDate} ? ${helpRequest.eventTime}`,
        requestId: helpRequest.id,
        orderId: helpRequest.id,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Сохраняем у?едомление по?ару
      const chefNotifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      const updatedChefNotifications = [chefNotification, ...chefNotifications].slice(0, 50);
      localStorage.setItem('chefNotifications', JSON.stringify(updatedChefNotifications));

      // Отпра?ляем событие для обно?ления у?едомлений по?ара
      window.dispatchEvent(new CustomEvent('chefNotificationAdded', { 
        detail: chefNotification 
      }));

      // Отпра?ляем событие для обно?ления счетчика
      window.dispatchEvent(new CustomEvent('chefNotificationsUpdated'));

      showSuccess('Запрос на помощь ? подгото?ке к приему гостей отпра?лен! По?ар с?яжется с ?ами ? ближайшее ?ремя.');
    } catch (error) {
      console.error('Error submitting help guest request:', error);
      showError('Ошибка при отпра?ке запроса. Попробуйте еще раз.');
    }
  };

  // Обработчик клика на блюдо для мастер-класса
  const handleMasterClassRequest = (dish) => {
    if (dish.masterClass) {
      setSelectedMasterClassDish(dish);
      setShowMasterClassRequest(true);
    }
  };

  // Обработчик отпра?ки запроса мастер-класса
  const handleMasterClassRequestSubmit = async (requestData) => {
    try {
      console.log('Master class request submitted:', requestData);
      // Здесь будет отпра?ка запроса на мастер-класс
      // В реальном приложении это будет API запрос
      showSuccess('Зая?ка на мастер-класс отпра?лена! По?ар с?яжется с ?ами для уточнения деталей.');
    } catch (error) {
      console.error('Error submitting master class request:', error);
      showError('Ошибка при отпра?ке зая?ки. Попробуйте еще раз.');
    }
  };

  // Обработчик изменения сортиро?ки
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Управление избранным
  const toggleFavorite = (item, type = 'dishes') => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"dishes":[],"chefs":[]}');
    const isAlreadyFavorite = favorites[type].some(fav => fav.id === item.id);
    
    if (isAlreadyFavorite) {
      favorites[type] = favorites[type].filter(fav => fav.id !== item.id);
      showSuccess(`Удалено из избранного`);
    } else {
      favorites[type].push(item);
      showSuccess(`${item.name} добавлено в избранное!`);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  const isFavorite = (itemId, type = 'dishes') => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"dishes":[],"chefs":[]}');
    return favorites[type].some(fav => fav.id === itemId);
  };

  // Добавление блюда в корзину
  const addToCart = (dish, event) => {
    // Анимация "падения" в корзину
    if (event) {
      const rect = event.target.getBoundingClientRect();
      const animatingItem = {
        id: Date.now() + Math.random(),
        dish: dish,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      setAnimatingItems(prev => [...prev, animatingItem]);
      
      // Удаляем анимируемый элемент через 1.2 секунды
      setTimeout(() => {
        setAnimatingItems(prev => prev.filter(item => item.id !== animatingItem.id));
      }, 1200);
      
      // Пульсация кнопки корзины
      setCartPulsing(true);
      setTimeout(() => setCartPulsing(false), 800);
      
      // Вибрация для мобильных устройств
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]); // Паттерн вибрации
      }
      
      // Звуковой эффект (опционально - создаем простой "плюх" звук)
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Высота звука
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // Если звук не поддерживается - игнорируем
      }
    }
    
    // Получаем текущую корзину из localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Проверяем, есть ли уже такое блюдо в корзине
    const existingItem = currentCart.find(item => item.id === dish.id);
    
    let updatedCart;
    if (existingItem) {
      // Увеличиваем количество существующего блюда
      updatedCart = currentCart.map(item => 
          item.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
    } else {
      // Добавляем новое блюдо в корзину
      updatedCart = [...currentCart, { ...dish, quantity: 1 }];
    }
    
    // Проверяем размер данных перед сохранением
    const cartString = JSON.stringify(updatedCart);
    const cartSize = new Blob([cartString]).size;
    
    // Если размер превышает 10MB (примерно 10,000,000 байт), очищаем корзину
    if (cartSize > 10000000) {
      console.warn('Cart size exceeded limit, clearing cart');
      localStorage.removeItem('cart');
      updatedCart = [{ ...dish, quantity: 1 }];
    }
    
    try {
      // Обновляем локальное состояние сначала
      setCart(updatedCart);
      
      // Сохраняем в localStorage с обработкой ошибок
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Отправляем custom event для обновления других компонентов
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
      // Показываем уведомление
      showSuccess(`"${dish.name}" ${t.dishAddedToCart}`);
    } catch (error) {
      console.error('? Error saving cart to localStorage:', error);
      
      // Если ошибка из-за превышения квоты, очищаем корзину и пробуем снова
      if (error.name === 'QuotaExceededError') {
        console.warn('Quota exceeded, clearing cart and retrying');
        localStorage.removeItem('cart');
        
        // Создаем минимальную корзину только с текущим блюдом (полные данные)
        const minimalCart = [{ ...dish, quantity: 1 }];
        
        try {
          localStorage.setItem('cart', JSON.stringify(minimalCart));
          setCart(minimalCart);
          showSuccess(`"${dish.name}" ${t.dishAddedToCart} (корзина была очищена из-за превышения лимита)`);
        } catch (retryError) {
          console.error('Failed to save even minimal cart:', retryError);
          showError('Ошибка сохранения корзины. Попробуйте очистить данные браузера.');
        }
      } else {
        showError('Ошибка сохранения корзины');
      }
    }
  };

  // Функция очистки localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      setCart([]);
      // Отправляем событие для обновления бейджей уведомлений
      window.dispatchEvent(new CustomEvent('clientNotificationsUpdated'));
      showSuccess('Данные браузера очищены');
      console.log('LocalStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      showError('Ошибка очистки данных браузера');
    }
  };

  // Функция ?осстано?ления демо-данных
  const restoreDemoData = () => {
    try {
      // Создаем демо-данные для по?ара
      const chefId = 'rustam_isaev_84%40mail.ru';
      const demoDishes = [
        {
          id: 'demo-dish-1',
          name: 'Борщ украинский',
          description: 'Классический борщ с го?ядиной и сметаной',
          price: 350,
          category: 'soups',
          category_id: 'soups',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.5
        },
        {
          id: 'demo-dish-2',
          name: 'Пло? узбекский',
          description: 'Традиционный пло? с бараниной и морко?ью',
          price: 450,
          category: 'tatar',
          category_id: 'tatar',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.8
        },
        {
          id: 'demo-dish-3',
          name: 'Цезарь с курицей',
          description: 'Салат с куриной грудкой, сухариками и соусом цезарь',
          price: 280,
          category: 'salads',
          category_id: 'salads',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.2
        },
        {
          id: 'demo-dish-4',
          name: 'Хлеб домашний',
          description: 'С?ежий домашний хлеб из печи',
          price: 120,
          category: 'bakery',
          category_id: 'bakery',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.7
        },
        {
          id: 'demo-dish-5',
          name: 'Пирожки с мясом',
          description: 'Вкусные татарские пирожки с мясной начинкой',
          price: 80,
          category: 'bakery',
          category_id: 'bakery',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.9
        },
        {
          id: 'demo-dish-6',
          name: 'Бешбармак',
          description: 'Традиционное татарское блюдо с лапшой и мясом',
          price: 520,
          category: 'tatar',
          category_id: 'tatar',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.6
        },
        {
          id: 'demo-dish-7',
          name: 'Стейк из го?ядины',
          description: 'Сочный стейк с картофелем фри',
          price: 650,
          category: 'main',
          category_id: 'main',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.4
        }
      ];

      // Сохраняем ? localStorage
      localStorage.setItem(`demo_menu_${chefId}`, JSON.stringify(demoDishes));
      
      console.log('?њ… Demo data restored:', demoDishes);
      showSuccess('Демо-данные ?осстано?лены! Обно?ите страницу.');
      
      // Обно?ляем страницу через 2 секунды
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error restoring demo data:', error);
      showError('Ошибка восстановления демо-данных');
    }
  };


  // Выход из аккаунта
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('role');
    navigate('/client/login');
  };

  // Подсчет общего количества товаров в корзине
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Функции для работы с отзывами
  const loadReviews = () => {
    const savedReviews = JSON.parse(localStorage.getItem('dishReviews') || '[]');
    setReviews(savedReviews);
  };

  const saveReviews = (newReviews) => {
    localStorage.setItem('dishReviews', JSON.stringify(newReviews));
    setReviews(newReviews);
  };

  const handleSubmitReview = async (review) => {
    const newReviews = [...reviews, review];
    saveReviews(newReviews);
    
    // Обновляем рейтинг блюда
    const dishReviews = newReviews.filter(r => r.dishId === review.dishId);
    const averageRating = dishReviews.reduce((sum, r) => sum + r.rating, 0) / dishReviews.length;
    
    // Обновляем рейтинг в блюде
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.id === review.dishId 
          ? { ...dish, rating: averageRating, reviewCount: dishReviews.length }
          : dish
      )
    );
    
    showSuccess('Спасибо за ваш отзыв!');
  };

  const getDishReviews = (dishId) => {
    return reviews.filter(review => review.dishId === dishId);
  };

  // Обработчик изменения фильтров
  const handleFiltersChange = (filteredDishes, filters) => {
    setFilteredDishes(filteredDishes);
    console.log('Filters applied:', filters);
    console.log('Filtered dishes count:', filteredDishes.length);
  };

  // Обработчик открытия деталей блюда
  const handleDishDetails = (dish) => {
    setSelectedDish(dish);
    setShowDishDetails(true);
  };

  // Обработчик закрытия деталей блюда
  const handleCloseDishDetails = () => {
    setShowDishDetails(false);
    setSelectedDish(null);
  };

  const getDishRating = (dishId) => {
    const dishReviews = getDishReviews(dishId);
    if (dishReviews.length === 0) return 0;
    return dishReviews.reduce((sum, review) => sum + review.rating, 0) / dishReviews.length;
  };

  // Загружаем отзывы при монтировании компонента
  useEffect(() => {
    loadReviews();
  }, []);

  return (
    <div className="client-menu-container page-with-bg" style={{
      backgroundImage: 'url("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      {/* Overlay для лучшей читаемости карточек */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(1px)',
        zIndex: 1
      }}></div>
      <header className="client-menu-header" style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative',
        zIndex: 2
      }}>
        <h1>{t.menu}</h1>
        <div className="client-menu-actions quick-actions">
          <button 
            onClick={() => {
              const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
              setCart(savedCart);
              console.log('Manual cart refresh from menu:', savedCart);
            }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="refresh" size={20} animation="rotate" />
            {t.refresh}
          </button>
          <button 
            onClick={clearLocalStorage}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="delete" size={20} animation="shake" />
            {t.clearAll}
          </button>
          <button 
            onClick={restoreDemoData}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="refresh" size={20} animation="rotate" />
            Восстановить блюда
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Небольшая задержка для предотвращения конфликтов кликов
              setTimeout(() => navigate('/client/cart'), 10);
            }}
            className={`modern-button light nav-button ${cartPulsing ? 'cart-pulse' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', overflow: 'visible', pointerEvents: 'auto', zIndex: 2 }}
          >
            <AnimatedIcon name="shopping" size={20} animation="bounce" />
            {t.cart}
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                right: '-20px',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                minWidth: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                animation: 'pulse 2s infinite',
                border: '2px solid white',
                padding: '3px 5px',
                lineHeight: '1'
              }}>
                {cartItemsCount > 99 ? '99+' : cartItemsCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setShowQuickOrder(true)}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="lightning" size={20} animation="glow" />
            Быстрый заказ
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOrderHistory(true); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ?? История заказов
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowFavorites(true); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ? Избранное
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddresses(true); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ?? Мои адреса
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/client/chat'); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ?? Чат с поваром
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              console.log('Notifications button clicked, current state:', showClientNotifications);
              // Небольшая задержка для предотвращения конфликтов
              setTimeout(() => {
                setShowClientNotifications(!showClientNotifications);
              }, 10);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className={`modern-button light nav-button ${showClientNotifications ? 'active' : ''}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              position: 'relative', 
              overflow: 'visible',
              zIndex: 1000,
              pointerEvents: 'auto'
            }}
          >
            ??
            Уведомления
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-12px',
                right: '-20px',
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                minWidth: '26px',
                height: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                padding: '3px 5px',
                lineHeight: '1',
                animation: 'pulse 2s infinite'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Кнопка для тестиро?ания у?едомлений */}
          <button
            onClick={() => {
              // Проверяем, не создавали ли мы уже тестовое уведомление сегодня
              const today = new Date().toDateString();
              const lastTestDate = localStorage.getItem('lastTestNotificationDate');
              
              if (lastTestDate === today) {
                showSuccess('Тестовое уведомление уже создано сегодня!');
                return;
              }
              
              const testNotification = {
                type: 'test',
                title: 'Тестовое уведомление',
                message: 'Это тестовое уведомление для проверки системы',
                timestamp: new Date().toISOString()
              };
              addNotification(testNotification);
              localStorage.setItem('lastTestNotificationDate', today);
              console.log('Test notification added');
              showSuccess('Тестовое уведомление создано!');
            }}
            className="modern-button light nav-button"
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ??
            Тест уведомлений
          </button>
          
          {/* Кнопка для очистки тестовых уведомлений */}
          <button
            onClick={() => {
              localStorage.removeItem('lastTestNotificationDate');
              showSuccess('Тестовые уведомления сброшены!');
            }}
            className="modern-button light nav-button"
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              marginLeft: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ???
            Сброс тестов
          </button>
          <button 
            onClick={() => setShowCookingRequests(!showCookingRequests)}
            className={`modern-button light nav-button ${showCookingRequests ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="chef" size={20} animation="rotate" />
            Мои запросы
          </button>
          <button 
            onClick={() => setShowDiabeticMenu(!showDiabeticMenu)}
            className={`modern-button light nav-button ${showDiabeticMenu ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="health" size={20} animation="glow" />
            Меню для диабетиков
          </button>
          <button 
            onClick={() => {
              console.log('Кнопка "Мои запросы на помощь" нажата. Текущее состояние:', showHelpGuestRequests);
              setShowHelpGuestRequests(!showHelpGuestRequests);
            }}
            className={`modern-button light nav-button ${showHelpGuestRequests ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="cooking" size={20} animation="pulse" />
            Мои запросы на помощь
          </button>
          <div className="client-menu-nav">
            <Link to="/client/orders" className="modern-button light nav-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AnimatedIcon name="orders" size={20} animation="bounce" />
              {t.orders}
            </Link>
            <ComplaintSystem 
              orderId="demo-order-123" 
              chefId="demo-chef-1"
              onComplaintSubmitted={(complaint) => {
                console.log('Complaint submitted:', complaint);
                showSuccess('Жалоба успешно отправлена!');
              }}
            />
            <Link to="/client/profile" className="modern-button light nav-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AnimatedIcon name="profile" size={20} animation="float" />
              {t.profile}
            </Link>
            <button onClick={handleLogout} className="modern-button red nav-button" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AnimatedIcon name="logout" size={20} animation="shake" />
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      {!selectedCategory ? (
        // Показываем категории
        <div className="client-menu-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="categories-section">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Link 
                to="/client/ai-coach" 
                className="ai-coach-button"
                style={{
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  display: 'inline-block',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                }}
              >
                ?? Помощник по питанию
              </Link>
            </div>
            
            {/* Со?еты и рекомендации - показы?ается только после нажатия кнопки */}
            {showHolidayAnalytics && (
              <div style={{
                animation: 'fadeIn 0.5s ease-in-out',
                marginBottom: '20px'
              }}>
                <HolidayAnalytics onClose={() => setShowHolidayAnalytics(false)} />
              </div>
            )}
            
            {/* Анализ заказов клиента - показывается только после нажатия кнопки */}
            {showOrderAnalysis && (
              <div style={{
                animation: 'fadeIn 0.5s ease-in-out',
                marginBottom: '20px'
              }}>
                <OrderHistoryAnalysis 
                  clientId={localStorage.getItem('clientId') || 'demo_client'} 
                  role="client" 
                />
              </div>
            )}
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '15px 25px',
                borderRadius: '10px',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'inline-block',
                margin: 0
              }}>{t.selectCategory}</h2>
            </div>
            
            {/* Панель фильтро? */}
            <div className="filters-panel" style={{
              background: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '15px',
              padding: '20px',
              marginTop: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>?? Фильтры и поиск</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setCuisineFilter('all');
                      setHalalFilter(false);
                      setDietFilter('all');
                      setPriceRange({ min: 0, max: 5000 });
                      setCookingTimeFilter('all');
                      setAllergenFilter([]);
                      setRatingFilter(0);
                      setCalorieFilter({ min: 0, max: 2000 });
                      setIngredientFilter('');
                      setSpiceLevelFilter('all');
                      setVegetarianFilter(false);
                      setVeganFilter(false);
                      setDiabeticFilter(false);
                    }}
                    style={{
                      background: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ??? Сбросить
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                      background: showFilters ? '#e74c3c' : '#3498db',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="filters-content" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  {/* Фильтр по кухне */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ??? Кухня
                    </label>
                    <select
                      value={cuisineFilter}
                      onChange={(e) => setCuisineFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    >
                      {cuisines.map(cuisine => (
                        <option key={cuisine.id} value={cuisine.id}>
                          {cuisine.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по диете */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Диета
                    </label>
                    <select
                      value={dietFilter}
                      onChange={(e) => setDietFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    >
                      {diets.map(diet => (
                        <option key={diet.id} value={diet.id}>
                          {diet.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по времени приготовления */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ? Время приготовления
                    </label>
                    <select
                      value={cookingTimeFilter}
                      onChange={(e) => setCookingTimeFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    >
                      {cookingTimes.map(time => (
                        <option key={time.id} value={time.id}>
                          {time.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Фильтр по цене */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Цена: {priceRange.min}? - {priceRange.max}?
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                        style={{
                          width: '80px',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '12px'
                        }}
                        placeholder="От"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 5000 }))}
                        style={{
                          width: '80px',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '12px'
                        }}
                        placeholder="До"
                      />
                    </div>
                  </div>

                  {/* Чекбоксы */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Дополнительно
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={halalFilter}
                          onChange={(e) => setHalalFilter(e.target.checked)}
                        />
                        ?? Халяль
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={diabeticFilter}
                          onChange={(e) => setDiabeticFilter(e.target.checked)}
                        />
                        ?? Диабетическое меню
                      </label>
                    </div>
                  </div>

                  {/* Расширенные фильтры */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Аллергены (исключить)
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                      {allergens.map(allergen => (
                        <label key={allergen.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                          <input
                            type="checkbox"
                            checked={allergenFilter.includes(allergen.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAllergenFilter([...allergenFilter, allergen.id]);
                              } else {
                                setAllergenFilter(allergenFilter.filter(id => id !== allergen.id));
                              }
                            }}
                          />
                          {allergen.icon} {allergen.name}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Фильтр по рейтингу */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ? Минимальный рейтинг: {ratingFilter}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Фильтр по калориям */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Калории
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={calorieFilter.min}
                        onChange={(e) => setCalorieFilter({...calorieFilter, min: parseInt(e.target.value) || 0})}
                        style={{
                          width: '80px',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '12px'
                        }}
                        placeholder="От"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={calorieFilter.max}
                        onChange={(e) => setCalorieFilter({...calorieFilter, max: parseInt(e.target.value) || 2000})}
                        style={{
                          width: '80px',
                          padding: '6px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '12px'
                        }}
                        placeholder="До"
                      />
                    </div>
                  </div>

                  {/* Фильтр по ингредиентам */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Поиск по ингредиентам
                    </label>
                    <input
                      type="text"
                      value={ingredientFilter}
                      onChange={(e) => setIngredientFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                      placeholder="Введите ингредиент..."
                    />
                  </div>

                  {/* Фильтр по остроте */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ??? Острота
                    </label>
                    <select
                      value={spiceLevelFilter}
                      onChange={(e) => setSpiceLevelFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    >
                      {spiceLevels.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Дополнительные чекбоксы */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Дополнительно
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={vegetarianFilter}
                          onChange={(e) => setVegetarianFilter(e.target.checked)}
                        />
                        ?? Только вегетарианские
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={veganFilter}
                          onChange={(e) => setVeganFilter(e.target.checked)}
                        />
                        ?? Только веганские
                      </label>
                    </div>
                  </div>

                  {/* Сортиро?ка */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? Сортиро?ка
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                    >
                      <option value="name">По наз?анию</option>
                      <option value="price-asc">Цена: по ?озрастанию</option>
                      <option value="price-desc">Цена: по убы?анию</option>
                      <option value="cooking-time">Время пригото?ления</option>
                      <option value="rating">По рейтингу</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Счетчик результато? */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: 'rgba(52, 152, 219, 0.1)', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#2c3e50'
              }}>
                Найдено блюд: <strong>{filteredDishes.length}</strong> из {dishes.length}
              </div>
            </div>
            
            {/* Кнопка AI Рекомендации */}
            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
              <button
                onClick={() => setShowAIRecommendations(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  margin: '0 auto'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }}
              >
                ?? AI Рекомендации
              </button>
            </div>

            <div className="categories-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {categories.map(category => (
                <div 
                  key={category.id} 
                  className="category-card"
                  onClick={() => handleCategorySelect(category)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '15px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  <div className="category-icon">
                    {category.icon}
                  </div>
                  <h3>{category.name}</h3>
                </div>
              ))}
            </div>
            
            {/* AI кнопки - перемещены вниз после сетки категорий */}
            <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowOrderAnalysis(!showOrderAnalysis)}
                  style={{
                    background: showOrderAnalysis ? 
                      'linear-gradient(135deg, #ff6b6b, #ff8e53)' : 
                      'linear-gradient(135deg, #17a2b8, #138496)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: showOrderAnalysis ? 
                      '0 4px 15px rgba(255, 107, 107, 0.4)' : 
                      '0 4px 15px rgba(23, 162, 184, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    if (showOrderAnalysis) {
                      e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)';
                    } else {
                      e.target.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    if (showOrderAnalysis) {
                      e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
                    } else {
                      e.target.style.boxShadow = '0 4px 15px rgba(23, 162, 184, 0.4)';
                    }
                  }}
                >
                  ?? Анализ заказов
                </button>
                
                <button
                  onClick={() => setShowHolidayAnalytics(!showHolidayAnalytics)}
                  style={{
                    background: showHolidayAnalytics ? 
                      'linear-gradient(135deg, #ff6b6b, #ff8e53)' : 
                      'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'rgba(255,255,255,0.8)',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: showHolidayAnalytics ? 
                      '0 4px 15px rgba(255, 107, 107, 0.4)' : 
                      '0 4px 15px rgba(40, 167, 69, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    if (showHolidayAnalytics) {
                      e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.6)';
                    } else {
                      e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.6)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    if (showHolidayAnalytics) {
                      e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
                    } else {
                      e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
                    }
                  }}
                >
                  <span style={{ color: 'rgba(0,0,0,0.7)', mixBlendMode: 'multiply', fontSize: '18px' }}>??</span> <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', fontSize: '16px' }}>AI-аналитика праздников</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="loading">Загрузка блюд...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        // Показы?аем блюда ?ыбранной категории
        <div className="client-menu-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="category-header">
            <button 
              className="back-to-categories-button"
              onClick={handleBackToCategories}
            >
              ?†ђ {t.backToCategories}
            </button>
            <h2>{selectedCategory.name}</h2>
            </div>
            
          <div className="menu-filters">
            <div className="sort-filter">
              <label htmlFor="sort">Сортиро?ать по:</label>
              <select id="sort" value={sortBy} onChange={handleSortChange}>
                <option value="name">{t.name}</option>
                <option value="price-asc">{t.priceAsc}</option>
                <option value="price-desc">{t.priceDesc}</option>
              </select>
            </div>
            
            {/* Диабетические фильтры */}
            {selectedCategory?.id === 'diabetic' && (
              <div className="diabetic-filters" style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '15px',
                marginTop: '15px',
                padding: '15px',
                background: 'rgba(76, 175, 80, 0.1)',
                borderRadius: '10px',
                border: '2px solid rgba(76, 175, 80, 0.3)'
              }}>
                <div className="diabetic-filter-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#2e7d32' }}>
                    <input
                      type="checkbox"
                      checked={diabeticFilter}
                      onChange={(e) => setDiabeticFilter(e.target.checked)}
                    />
                    ?? {t.diabeticMenu.filter}
                  </label>
                </div>
                
                {diabeticFilter && (
                  <>
                    <div className="diabetic-filter-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#2e7d32' }}>
                        <input
                          type="checkbox"
                          checked={hideHighSugar}
                          onChange={(e) => setHideHighSugar(e.target.checked)}
                        />
                        ?? {t.diabeticMenu.hideHighSugar}
                      </label>
                    </div>
                    
                    <div className="diabetic-filter-group">
                      <label style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {t.diabeticMenu.maxCarbs}:
                        <input
                          type="number"
                          value={maxCarbs}
                          onChange={(e) => setMaxCarbs(Number(e.target.value))}
                          min="0"
                          max="100"
                          style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #4caf50' }}
                        />
                      </label>
                    </div>
                    
                    <div className="diabetic-filter-group">
                      <label style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {t.diabeticMenu.maxSugar}:
                        <input
                          type="number"
                          value={maxSugar}
                          onChange={(e) => setMaxSugar(Number(e.target.value))}
                          min="0"
                          max="50"
                          style={{ marginLeft: '8px', padding: '4px', borderRadius: '4px', border: '1px solid #4caf50' }}
                        />
                      </label>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Фильтры меню */}
          <MenuFilters 
            dishes={dishes}
            onFiltersChange={handleFiltersChange}
          />

          {sortedDishes.length === 0 ? (
            <div className="no-dishes">
              <h3>{t.noDishes}</h3>
              <p>{t.noDishesDesc}</p>
              <button 
                className="back-to-categories-button"
                onClick={handleBackToCategories}
              >
                {t.chooseAnotherCategory}
              </button>
            </div>
          ) : (
            <div className="dishes-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {sortedDishes.map(dish => (
                <DishCardWithDiabeticCheck
                  key={dish.id}
                  dish={dish}
                  onAddToCart={(selectedDish) => addToCart(selectedDish)}
                  onViewDetails={(selectedDish) => handleDishDetails(selectedDish)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Анимируемые элементы */}
      {animatingItems.map(item => (
        <div
          key={item.id}
          style={{
            position: 'fixed',
            left: item.x,
            top: item.y,
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'flyToCart 1.2s ease-out forwards'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #4CAF50, #45a049)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
            transform: 'translate(-50%, -50%)'
          }}>
            ???
          </div>
        </div>
      ))}
      
      {/* Быстрый заказ */}
      {showQuickOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#2D5016' }}>
              ?? Быстрый заказ
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              Выберите блюдо для быстрого заказа
            </p>
            
            <div style={{ display: 'grid', gap: '10px', marginBottom: '20px' }}>
              {dishes.slice(0, 5).map(dish => (
                <div key={dish.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  addToCart(dish);
                  setShowQuickOrder(false);
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f5f5f5';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
                >
                  <img 
                    src={dish.image || '/images/placeholder.jpg'} 
                    alt={dish.name}
                    style={{
                      width: '50px',
                      height: '50px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginRight: '15px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{dish.name}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{dish.price} ?</p>
                  </div>
                  <button style={{
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}>
                    Заказать
                  </button>
                </div>
              ))}
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => setShowQuickOrder(false)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Стили для анимации */}
      <style jsx>{`
        @keyframes flyToCart {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translate(calc(-50vw + 50px), calc(-50vh + 50px)) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientMenu;
