import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAvailableDishes } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import SearchBar from './SearchBar';
import Rating from './Rating';
import HolidayAnalytics from './HolidayAnalytics';
import OrderHistoryAnalysis from './OrderHistoryAnalysis';
import QuickOrder from './QuickOrder';
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

const ClientMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [favorites, setFavorites] = useState([]);
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
    { id: 'gluten', name: 'Глютен', icon: '🌾' },
    { id: 'dairy', name: 'Молочные продукты', icon: '🥛' },
    { id: 'nuts', name: 'Орехи', icon: '🥜' },
    { id: 'eggs', name: 'Яйца', icon: '🥚' },
    { id: 'soy', name: 'Соя', icon: '🫘' },
    { id: 'fish', name: 'Рыба', icon: '🐟' },
    { id: 'shellfish', name: 'Морепродукты', icon: '🦐' },
    { id: 'sesame', name: 'Кунжут', icon: '🌰' }
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
    
    const handleStorageChange = (e) => {
      if (e.key === 'cart') {
        console.log('ClientMenu: Cart changed in localStorage, reloading...');
        const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(savedCart);
      }
    };
    
    window.addEventListener('cartChanged', handleCartChange);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('cartChanged', handleCartChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Предопределенные категории
  const categories = [
    { id: 'halal', name: t.halalMenu, icon: '🕌' },
    { id: 'main', name: t.mainDishes, icon: '🍽️' },
    { id: 'semi-finished', name: t.semiFinished, icon: '🥟' },
    { id: 'bakery', name: t.bakery, icon: '🥖' },
    { id: 'tatar', name: t.tatarCuisine, icon: '🥟' },
    { id: 'soups', name: t.soups, icon: '🍲' },
    { id: 'salads', name: t.salads, icon: '🥗' },
    { id: 'desserts', name: t.desserts, icon: '🍰' },
    { id: 'beverages', name: t.beverages, icon: '☕•' },
    { id: 'diet', name: t.dietMenu, icon: '🥗' },
    { id: 'diabetic', name: t.diabeticMenu.title, icon: '🩺', isSpecial: true },
    { id: 'client_cook', name: t.clientCooking, icon: '👨‍🍳' },
    { id: 'master_class', name: t.masterClass, icon: '👨‍🍳' },
    { id: 'help_guest', name: t.helpGuest, icon: '👥' },
    { id: 'preparations', name: t.preparations, icon: '🥘' },
    { id: 'farmers_market', name: t.farmersMarket, icon: '🏪', isSpecial: true }
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
          console.log('🛒 Cart loaded from localStorage:');
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
        
        console.log('💾 Saving cart to localStorage:');
        console.log('  - Items count:', cart.length);
        console.log('  - Size in bytes:', cartSize);
        console.log('  - Size in KB:', (cartSize / 1024).toFixed(2));
        
        localStorage.setItem('cart', cartString);
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cart]);

  // Про☕ерка а☕торизации
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
    }
  }, [navigate]);

  // Функция для про☕ерки диабетических блюд
  const isDiabeticFriendly = (dish) => {
    if (!diabeticFilter) return true;
    
    const carbs = dish.carbs || 0;
    const sugar = dish.sugar || 0;
    
     // Про☕еряем лимиты угле☕одо☕ и сахара
    if (carbs > maxCarbs || sugar > maxSugar) return false;
    
     // Скры☕аем блюда с ☕ысоким содержанием сахара если ☕ключен фильтр
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

    // Фильтр по ☕ремени пригото☕ления
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

    // Поиск по наз☕анию и описанию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!dish.name.toLowerCase().includes(query) && 
          !dish.description.toLowerCase().includes(query)) {
        return false;
      }
    }

    return true;
  };

  // Фильтрация и сортиро☕ка блюд
  const filteredDishes = dishes.filter(isDishMatchingFilters);
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
  // Отладочная информация убрана для предот☕ращения бесконечных ререндеро☕

  // Обработчик ☕ыбора категории
  const handleCategorySelect = (category) => {
    // Если это фермерский рынок, переходим на отдельную страницу
    if (category.id === 'farmers_market') {
      navigate('/client/farmers-market');
      return;
    }
    
    // Если это диабетическое меню, ☕ключаем фильтр и показы☕аем диабетические индикаторы
    if (category.id === 'diabetic') {
      setDiabeticFilter(true);
      setShowDiabeticMenu(true);
      setSelectedCategory(category);
      return;
    }
    
    setSelectedCategory(category);
    setShowDiabeticMenu(false); // Сбрасы☕аем показ диабетических индикаторо☕
    setDishes([]); // Очищаем блюда при ☕ыборе но☕ой категории
  };

  // Воз☕рат к ☕ыбору категории
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowDiabeticMenu(false); // Сбрасы☕аем показ диабетических индикаторо☕
    setDishes([]);
  };

  // Обработчик клика на блюдо для гото☕ки с продуктами клиента
  const handleCookingRequest = (dish) => {
    if (dish.clientCooking) {
      setSelectedCookingDish(dish);
      setShowCookingRequest(true);
    }
  };

  // Обработчик отпра☕ки запроса на гото☕ку
  const handleCookingRequestSubmit = async (requestData) => {
    try {
      console.log('Cooking request submitted:', requestData);
      // Здесь будет отпра☕ка запроса на гото☕ку
      // В реальном приложении это будет API запрос
      showSuccess('Запрос на гото☕ку отпра☕лен! По☕ар с☕яжется с ☕ами ☕ ближайшее ☕ремя.');
    } catch (error) {
      console.error('Error submitting cooking request:', error);
      showError('Ошибка при отпра☕ке запроса. Попробуйте еще раз.');
    }
  };

  // Обработчик клика на блюдо для помощи гостям
  const handleHelpGuestRequest = (dish) => {
    if (dish.helpGuest) {
      setSelectedHelpGuestDish(dish);
      setShowHelpGuestRequest(true);
    }
  };

  // Обработчик отпра☕ки запроса помощи гостям
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
        dishName: requestData.dishName || 'Помощь ☕ гото☕ке',
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

      // Сохраняем запрос ☕ localStorage
      const existingRequests = JSON.parse(localStorage.getItem('helpGuestRequests') || '[]');
      const updatedRequests = [helpRequest, ...existingRequests];
      localStorage.setItem('helpGuestRequests', JSON.stringify(updatedRequests));

      // Отпра☕ляем у☕едомление по☕ару
      const chefNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'help_guest_request',
        title: 'Но☕ый запрос на помощь гостям',
        message: `Клиент ${helpRequest.clientName} запросил помощь ☕ подгото☕ке к приему гостей на ${helpRequest.eventDate} ☕ ${helpRequest.eventTime}`,
        requestId: helpRequest.id,
        orderId: helpRequest.id,
        timestamp: new Date().toISOString(),
        read: false
      };

      // Сохраняем у☕едомление по☕ару
      const chefNotifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      const updatedChefNotifications = [chefNotification, ...chefNotifications].slice(0, 50);
      localStorage.setItem('chefNotifications', JSON.stringify(updatedChefNotifications));

      // Отпра☕ляем событие для обно☕ления у☕едомлений по☕ара
      window.dispatchEvent(new CustomEvent('chefNotificationAdded', { 
        detail: chefNotification 
      }));

      // Отпра☕ляем событие для обно☕ления счетчика
      window.dispatchEvent(new CustomEvent('chefNotificationsUpdated'));

      showSuccess('Запрос на помощь ☕ подгото☕ке к приему гостей отпра☕лен! По☕ар с☕яжется с ☕ами ☕ ближайшее ☕ремя.');
    } catch (error) {
      console.error('Error submitting help guest request:', error);
      showError('Ошибка при отпра☕ке запроса. Попробуйте еще раз.');
    }
  };

  // Обработчик клика на блюдо для мастер-класса
  const handleMasterClassRequest = (dish) => {
    if (dish.masterClass) {
      setSelectedMasterClassDish(dish);
      setShowMasterClassRequest(true);
    }
  };

  // Обработчик отпра☕ки запроса мастер-класса
  const handleMasterClassRequestSubmit = async (requestData) => {
    try {
      console.log('Master class request submitted:', requestData);
      // Здесь будет отпра☕ка запроса на мастер-класс
      // В реальном приложении это будет API запрос
      showSuccess('Зая☕ка на мастер-класс отпра☕лена! По☕ар с☕яжется с ☕ами для уточнения деталей.');
    } catch (error) {
      console.error('Error submitting master class request:', error);
      showError('Ошибка при отпра☕ке зая☕ки. Попробуйте еще раз.');
    }
  };

  // Обработчик изменения сортиро☕ки
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Доба☕ление блюда ☕ корзину
  const addToCart = (dish, event) => {
    // Отладочная информация убрана для предот☕ращения бесконечных ререндеро☕
    
    // Анимация "падения" ☕ корзину
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
      setTimeout(() => setCartPulsing(false), 600);
      
      // Вибрация для мобильных устройст☕
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    // Получаем текущую корзину из localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Про☕еряем, есть ли уже такое блюдо ☕ корзине
    const existingItem = currentCart.find(item => item.id === dish.id);
    
    let updatedCart;
    if (existingItem) {
      // У☕еличи☕аем количест☕о сущест☕ующего блюда
      updatedCart = currentCart.map(item => 
          item.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
    } else {
      // Доба☕ляем но☕ое блюдо ☕ корзину
      updatedCart = [...currentCart, { ...dish, quantity: 1 }];
    }
    
    // Про☕еряем размер данных перед сохранением
    const cartString = JSON.stringify(updatedCart);
    const cartSize = new Blob([cartString]).size;
    
    // Если размер пре☕ышает 10MB (примерно 10,000,000 байт), очищаем корзину
    if (cartSize > 10000000) {
      console.warn('Cart size exceeded limit, clearing cart');
      localStorage.removeItem('cart');
      updatedCart = [{ ...dish, quantity: 1 }];
    }
    
    try {
      // Обно☕ляем локальное состояние сначала
      setCart(updatedCart);
      
      // Сохраняем ☕ localStorage с обработкой ошибок
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // Отпра☕ляем custom event для обно☕ления других компоненто☕
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
      // Показываем уведомление
      showSuccess(`"${dish.name}" ${t.dishAddedToCart}`);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      
      // Если ошибка из-за пре☕ышения к☕оты, очищаем корзину и пробуем сно☕а
      if (error.name === 'QuotaExceededError') {
        console.warn('Quota exceeded, clearing cart and retrying');
        localStorage.removeItem('cart');
        
        // Создаем минимальную корзину только с текущим блюдом (полные данные)
        const minimalCart = [{ ...dish, quantity: 1 }];
        
        try {
          localStorage.setItem('cart', JSON.stringify(minimalCart));
          setCart(minimalCart);
          showSuccess(`"${dish.name}" ${t.dishAddedToCart} (корзина была очищена из-за пре☕ышения лимита)`);
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
      setFavorites([]);
      showSuccess('Данные браузера очищены');
      console.log('LocalStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      showError('Ошибка очистки данных браузера');
    }
  };

  // Функция ☕осстано☕ления демо-данных
  const restoreDemoData = () => {
    try {
      // Создаем демо-данные для по☕ара
      const chefId = 'rustam_isaev_84%40mail.ru';
      const demoDishes = [
        {
          id: 'demo-dish-1',
          name: 'Борщ украинский',
          description: 'Классический борщ с го☕ядиной и сметаной',
          price: 350,
          category: 'soups',
          category_id: 'soups',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.5
        },
        {
          id: 'demo-dish-2',
          name: 'Пло☕ узбекский',
          description: 'Традиционный пло☕ с бараниной и морко☕ью',
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
          description: 'С☕ежий домашний хлеб из печи',
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
          name: 'Стейк из го☕ядины',
          description: 'Сочный стейк с картофелем фри',
          price: 650,
          category: 'main',
          category_id: 'main',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.4
        }
      ];

      // Сохраняем ☕ localStorage
      localStorage.setItem(`demo_menu_${chefId}`, JSON.stringify(demoDishes));
      
      console.log('☕њ… Demo data restored:', demoDishes);
      showSuccess('Демо-данные ☕осстано☕лены! Обно☕ите страницу.');
      
      // Обно☕ляем страницу через 2 секунды
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error restoring demo data:', error);
      showError('Ошибка восстановления демо-данных');
    }
  };

  // Функции поиска
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = dishes.filter(dish => 
        dish.name.toLowerCase().includes(query.toLowerCase()) ||
        dish.description.toLowerCase().includes(query.toLowerCase())
      );
      setSearchSuggestions(filtered.map(dish => dish.name));
      } else {
      setSearchSuggestions([]);
    }
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setSearchSuggestions([]);
  };

  // Функции избранного
  const toggleFavorite = (dishId) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId];
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Загрузка избранного
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  }, []);


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
    <div className="client-menu-container" style={{
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
        <div className="client-menu-actions">
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
          <Link to="/client/cart" className={`modern-button light nav-button ${cartPulsing ? 'cart-pulse' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
            <AnimatedIcon name="shopping" size={20} animation="bounce" />
            {t.cart}
            {cartItemsCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '12px',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                animation: 'pulse 2s infinite'
              }}>
                {cartItemsCount}
              </span>
            )}
          </Link>
          <button 
            onClick={() => setShowQuickOrder(true)}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="lightning" size={20} animation="glow" />
            Быстрый заказ
          </button>
          <button 
            onClick={() => setShowClientNotifications(!showClientNotifications)}
            className={`modern-button light nav-button ${showClientNotifications ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
          >
            <AnimatedIcon name="notifications" size={20} animation="pulse" />
            Уведомления
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ff4444',
                color: 'white',
                borderRadius: '50%',
                minWidth: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                border: '2px solid white'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Кнопка для тестиро☕ания у☕едомлений */}
          <button
            onClick={() => {
              const testNotification = {
                type: 'test',
                title: 'Тестовое уведомление',
                message: 'Это тестовое уведомление для проверки системы',
                timestamp: new Date().toISOString()
              };
              addNotification(testNotification);
              console.log('Test notification added');
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
            <AnimatedIcon name="test" size={16} animation="pulse" />
            Тест уведомлений
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
                🍎 Помощник по питанию
              </Link>
            </div>
            
            {/* Со☕еты и рекомендации - показы☕ается только после нажатия кнопки */}
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
            <div className="search-section">
              <SearchBar
                placeholder={t.search}
                onSearch={handleSearch}
                onClear={handleSearchClear}
                suggestions={searchSuggestions}
                onSuggestionSelect={(suggestion) => {
                  setSearchQuery(suggestion);
                  // Найти блюдо по наз☕анию и перейти к его категории
                  const dish = dishes.find(d => d.name === suggestion);
                  if (dish) {
                    const category = categories.find(c => c.id === dish.category);
                    if (category) {
                      setSelectedCategory(category);
                    }
                  }
                }}
              />
            </div>
            
            {/* Панель фильтро☕ */}
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
                <h3 style={{ margin: 0, color: '#2c3e50' }}>🔍 Фильтры и поиск</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      setSearchQuery('');
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
                    🗑️ Сбросить
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
                      🍽️ Кухня
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
                      🥘 Диета
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
                      ⏰ Время приготовления
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
                      💰 Цена: {priceRange.min}₽ - {priceRange.max}₽
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
                      ⚙️ Дополнительно
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={halalFilter}
                          onChange={(e) => setHalalFilter(e.target.checked)}
                        />
                        🕌 Халяль
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={diabeticFilter}
                          onChange={(e) => setDiabeticFilter(e.target.checked)}
                        />
                        🩺 Диабетическое меню
                      </label>
                    </div>
                  </div>

                  {/* Расширенные фильтры */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      🚫 Аллергены (исключить)
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
                      ⭐ Минимальный рейтинг: {ratingFilter}
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
                      🔥 Калории
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
                      🥕 Поиск по ингредиентам
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
                      🌶️ Острота
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
                      🥬 Дополнительно
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={vegetarianFilter}
                          onChange={(e) => setVegetarianFilter(e.target.checked)}
                        />
                        🥬 Только вегетарианские
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={veganFilter}
                          onChange={(e) => setVeganFilter(e.target.checked)}
                        />
                        🌱 Только веганские
                      </label>
                    </div>
                  </div>

                  {/* Сортиро☕ка */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      🔄 Сортиро☕ка
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
                      <option value="name">По наз☕анию</option>
                      <option value="price-asc">Цена: по ☕озрастанию</option>
                      <option value="price-desc">Цена: по убы☕анию</option>
                      <option value="cooking-time">Время пригото☕ления</option>
                      <option value="rating">По рейтингу</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* Счетчик результато☕ */}
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
                🤖 AI Рекомендации
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
                  📊 Анализ заказов
                </button>
                
                <button
                  onClick={() => setShowHolidayAnalytics(!showHolidayAnalytics)}
                  style={{
                    background: showHolidayAnalytics ? 
                      'linear-gradient(135deg, #ff6b6b, #ff8e53)' : 
                      'linear-gradient(135deg, #28a745, #20c997)',
                    color: 'white',
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
                  🎉 AI-аналитика праздников
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
        // Показы☕аем блюда ☕ыбранной категории
        <div className="client-menu-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="category-header">
            <button 
              className="back-to-categories-button"
              onClick={handleBackToCategories}
            >
              ☕†ђ {t.backToCategories}
            </button>
            <h2>{selectedCategory.name}</h2>
            </div>
            
          <div className="menu-filters">
            <div className="sort-filter">
              <label htmlFor="sort">Сортиро☕ать по:</label>
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
                    🩺 {t.diabeticMenu.filter}
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
                        🚫 {t.diabeticMenu.hideHighSugar}
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginTop: '20px'
            }}>
              {sortedDishes.map(dish => (
                <div key={dish.id} className="dish-card" style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '15px',
                  padding: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)'
                  }
                }}>
                  <div className="dish-image">
                    {dish.photo || dish.image ? (
                      <img src={dish.photo || dish.image} alt={dish.name} />
                    ) : (
                      <div className="placeholder-image">🍽️</div>
                    )}
                    <div className="dish-actions">
                      <button
                        className={`favorite-button ${favorites.includes(dish.id) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(dish.id);
                        }}
                        title={favorites.includes(dish.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                      >
                        {favorites.includes(dish.id) ? '❤️' : '🤍'}
                      </button>
                      <button
                        className="qr-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dish/${dish.chefId || 'unknown'}/${dish.id}/passport`);
                        }}
                        title="Паспорт блюда"
                      >
                        ⭐
                      </button>
                      <button
                        className="quick-add-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(dish, e);
                        }}
                        title="Быстро добавить в корзину"
                        style={{
                          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '40px',
                          height: '40px',
                          cursor: 'pointer',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.1)';
                          e.target.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="dish-info">
                    <h3>{dish.name}</h3>
                    <p className="dish-description">{dish.description}</p>
                    
                    {/* Диабетические индикаторы - показываются только при включенном диабетическом меню */}
                    {showDiabeticMenu && (
                    <div className="diabetic-indicators" style={{ marginBottom: '10px' }}>
                      {dish.carbs !== undefined && (
                        <span className="diabetic-badge" style={{
                          display: 'inline-block',
                          background: dish.carbs <= 20 ? '#4caf50' : dish.carbs <= 40 ? '#ff9800' : '#f44336',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '5px'
                        }}>
                          🍞 {dish.carbs}g {t.diabeticMenu.carbs}
                        </span>
                      )}
                      {dish.sugar !== undefined && (
                        <span className="diabetic-badge" style={{
                          display: 'inline-block',
                          background: dish.sugar <= 5 ? '#4caf50' : dish.sugar <= 15 ? '#ff9800' : '#f44336',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '5px'
                        }}>
                          🍯 {dish.sugar}g {t.diabeticMenu.sugar}
                        </span>
                      )}
                      {dish.glycemicIndex && (
                        <span className="diabetic-badge" style={{
                          display: 'inline-block',
                          background: dish.glycemicIndex <= 55 ? '#4caf50' : dish.glycemicIndex <= 70 ? '#ff9800' : '#f44336',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '5px'
                        }}>
                            📊 Р“Р {dish.glycemicIndex}
                        </span>
                      )}
                      {dish.sugarSubstitutes && (
                        <span className="diabetic-badge" style={{
                          display: 'inline-block',
                          background: '#2196f3',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          marginRight: '5px'
                        }}>
                          🍯 {t.diabeticMenu.sugarSubstitutes}
                        </span>
                      )}
                    </div>
                    )}
                    
                    <div className="dish-meta">
                      <span className="dish-category">
                        {categories.find(cat => cat.id === dish.category)?.name || dish.category}
                      </span>
                      <span className="dish-price">{dish.price} ₽</span>
                    </div>
                    
                    {/* Рейтинг и отзывы */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StarRating 
                          rating={getDishRating(dish.id)} 
                          size="small"
                        />
                        <span style={{ 
                          fontSize: '12px', 
                          color: '#666',
                          fontWeight: 'bold'
                        }}>
                          ({getDishReviews(dish.id).length})
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDishForReview(dish);
                          setShowReviewModal(true);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'scale(1.05)';
                          e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        ⭐ Отзыв
                      </button>
                    </div>

                    {/* Количество в корзине и управление */}
                    {(() => {
                      const cartItem = cart.find(item => item.id === dish.id);
                      return cartItem ? (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '10px',
                          padding: '8px 12px',
                          background: 'rgba(76, 175, 80, 0.1)',
                          borderRadius: '8px',
                          border: '1px solid rgba(76, 175, 80, 0.3)'
                        }}>
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold',
                            color: '#2e7d32'
                          }}>
                            В корзине: {cartItem.quantity}
                          </span>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedCart = cart.map(item => 
                                  item.id === dish.id 
                                    ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                                    : item
                                );
                                setCart(updatedCart);
                                localStorage.setItem('cart', JSON.stringify(updatedCart));
                                window.dispatchEvent(new CustomEvent('cartChanged'));
                              }}
                              style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              -
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const updatedCart = cart.map(item => 
                                  item.id === dish.id 
                                    ? { ...item, quantity: item.quantity + 1 }
                                    : item
                                );
                                setCart(updatedCart);
                                localStorage.setItem('cart', JSON.stringify(updatedCart));
                                window.dispatchEvent(new CustomEvent('cartChanged'));
                              }}
                              style={{
                                background: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    {/* Время приготовления и дополнительная информация */}
                    <div className="dish-details" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px',
                      fontSize: '14px',
                      color: '#666'
                    }}>
                      <div className="cooking-time" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: 'rgba(52, 152, 219, 0.1)',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⏰ Время приготовления: {dish.cookingTime || 30} мин
                      </div>
                      
                      <div className="dish-badges" style={{ display: 'flex', gap: '5px' }}>
                        {dish.halal && (
                          <span style={{
                            background: '#4caf50',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            🕌 Халяль
                          </span>
                        )}
                        {dish.vegetarian && (
                          <span style={{
                            background: '#8bc34a',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            🥘 Вег
                          </span>
                        )}
                        {dish.vegan && (
                          <span style={{
                            background: '#4caf50',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            🌱 Веган
                          </span>
                        )}
                        {dish.glutenFree && (
                          <span style={{
                            background: '#ff9800',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}>
                            🌾 Без глютена
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="dish-rating">
                      <Rating 
                        rating={dish.rating || 0} 
                        readOnly={true} 
                        size="small" 
                        showValue={true}
                      />
                    </div>
                    {dish.clientCooking ? (
                      <button 
                        className="cooking-request-button"
                        onClick={() => handleCookingRequest(dish)}
                        style={{
                          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          width: '100%'
                        }}
                      >
                        👨‍🍳 Запросить готовку
                      </button>
                    ) : dish.helpGuest ? (
                      <button 
                        className="help-guest-button"
                        onClick={() => handleHelpGuestRequest(dish)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          width: '100%'
                        }}
                      >
                        👥 Помощь гостям
                      </button>
                    ) : dish.masterClass ? (
                      <button 
                        className="master-class-button"
                        onClick={() => handleMasterClassRequest(dish)}
                        style={{
                          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          width: '100%'
                        }}
                      >
                        👨‍🍳 Записаться
                      </button>
                    ) : (
                      <button 
                        className="add-to-cart-button"
                        onClick={(e) => {
                          addToCart(dish, e);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '12px 20px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '14px',
                          transition: 'all 0.3s ease',
                          width: '100%'
                        }}
                      >
                        {t.addToCart}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Анимируемые элементы */}
      {animatingItems.map(item => (
        <div
          key={item.id}
          className="animating-item"
          style={{
            left: item.x - 20,
            top: item.y - 20,
            width: '40px',
            height: '40px',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          🍽️
        </div>
      ))}

      {showQuickOrder && (
        <QuickOrder 
          dishes={dishes} 
          onClose={() => setShowQuickOrder(false)} 
        />
      )}

      {showCookingRequest && selectedCookingDish && (
        <ClientCookingRequest
          dish={selectedCookingDish}
          onClose={() => {
            setShowCookingRequest(false);
            setSelectedCookingDish(null);
          }}
          onRequestSubmit={handleCookingRequestSubmit}
        />
      )}

      {showHelpGuestRequest && selectedHelpGuestDish && (
        <HelpGuestRequest
          dish={selectedHelpGuestDish}
          onClose={() => {
            setShowHelpGuestRequest(false);
            setSelectedHelpGuestDish(null);
          }}
          onRequestSubmit={handleHelpGuestRequestSubmit}
        />
      )}

      {showMasterClassRequest && selectedMasterClassDish && (
        <MasterClassRequest
          dish={selectedMasterClassDish}
          onClose={() => {
            setShowMasterClassRequest(false);
            setSelectedMasterClassDish(null);
          }}
          onRequestSubmit={handleMasterClassRequestSubmit}
        />
      )}

      {/* Диабетическое меню - модальное окно */}
      {showDiabeticMenu && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDiabeticMenu(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Кнопка закрытия */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10000
            }}>
              <button
                onClick={() => setShowDiabeticMenu(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = '#dc3545';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Заголовок модального окна */}
            <div style={{
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              padding: '20px 60px 20px 20px',
              borderRadius: '15px 15px 0 0',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => setShowDiabeticMenu(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ← Назад
                </button>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  flex: 1
                }}>
                  🩺 Меню для диабетиков
                </h2>
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.9
              }}>
                Специальные блюда с низким содержанием сахара
              </div>
            </div>
            
            {/* Содержимое */}
            <div style={{ padding: '0' }}>
              <DiabeticMenuSection 
                dishes={dishes.filter(dish => dish.diabeticFriendly === true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Мои запросы на готовку - модальное окно */}
      {showCookingRequests && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCookingRequests(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Кнопка закрытия */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10000
            }}>
              <button
                onClick={() => setShowCookingRequests(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = '#dc3545';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Заголовок модального окна */}
            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              color: 'white',
              padding: '20px 60px 20px 20px',
              borderRadius: '15px 15px 0 0',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => setShowCookingRequests(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ← Назад
                </button>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  flex: 1
                }}>
                  👨‍🍳 Мои запросы на готовку
                </h2>
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.9
              }}>
                Управляйте своими запросами на кулинарные услуги
              </div>
            </div>
            
            {/* Содержимое */}
            <div style={{ padding: '0' }}>
              <ClientCookingRequests />
            </div>
          </div>
        </div>
      )}

      {/* Запросы на помощь гостям - модальное окно */}
      {showHelpGuestRequests && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowHelpGuestRequests(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Кнопка закрытия */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10000
            }}>
              <button
                onClick={() => setShowHelpGuestRequests(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = '#dc3545';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Заголовок модального окна */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 60px 20px 20px',
              borderRadius: '15px 15px 0 0',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => setShowHelpGuestRequests(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ← Назад
                </button>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  flex: 1
                }}>
                  🍽️ Мои запросы на помощь в готовке
                </h2>
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.9
              }}>
                Управляйте своими запросами на кулинарную помощь
              </div>
            </div>
            
            {/* Содержимое */}
            <div style={{ padding: '0' }}>
              <ClientHelpGuestRequests />
            </div>
          </div>
        </div>
      )}

      {/* Уведомления клиента - модальное окно */}
      {showClientNotifications && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowClientNotifications(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Кнопка закрытия */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10000
            }}>
              <button
                onClick={() => setShowClientNotifications(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = '#dc3545';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Заголовок модального окна */}
            <div style={{
              background: 'linear-gradient(135deg, #6f42c1 0%, #e83e8c 100%)',
              color: 'white',
              padding: '20px 60px 20px 20px',
              borderRadius: '15px 15px 0 0',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => setShowClientNotifications(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ← Назад
                </button>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  flex: 1
                }}>
                  🔔 Уведомления
                </h2>
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.9
              }}>
                Все ваши уведомления и обновления
              </div>
            </div>
            
            {/* Содержимое */}
            <div style={{ padding: '0' }}>
              <ClientNotifications 
                onClose={() => setShowClientNotifications(false)}
                onSwitchToSection={switchToSection}
              />
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно для отзывов */}
      {showReviewModal && selectedDishForReview && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedDishForReview(null);
          }}
          dish={selectedDishForReview}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Модальное окно AI-рекомендаций */}
      {showAIRecommendations && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAIRecommendations(false);
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Кнопка закрытия */}
            <div style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              zIndex: 10000
            }}>
              <button
                onClick={() => setShowAIRecommendations(false)}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'scale(1.1)';
                  e.target.style.background = '#c82333';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.background = '#dc3545';
                }}
              >
                ✕
              </button>
            </div>
            
            {/* Заголовок модального окна */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 60px 20px 20px',
              borderRadius: '15px 15px 0 0',
              position: 'relative'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => setShowAIRecommendations(false)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.3)';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.2)';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ← Назад
                </button>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  flex: 1
                }}>
                  🤖 AI Рекомендации
                </h2>
              </div>
              <div style={{
                fontSize: '14px',
                opacity: 0.9
              }}>
                Персональные рекомендации на основе ваших предпочтений
              </div>
            </div>
            
            {/* Содержимое */}
            <div style={{ padding: '20px' }}>
              <AIRecommendations 
                dishes={dishes}
                onDishSelect={(dish) => {
                  const category = categories.find(c => c.id === dish.category);
                  if (category) {
                    setShowAIRecommendations(false);
                    handleCategorySelect(category);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ClientMenu;
