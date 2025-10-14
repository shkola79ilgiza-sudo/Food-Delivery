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
  
  // ����� �������
  const [cuisineFilter, setCuisineFilter] = useState('all');
  const [halalFilter, setHalalFilter] = useState(false);
  const [dietFilter, setDietFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [cookingTimeFilter, setCookingTimeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // ����������� �������
  const [allergenFilter, setAllergenFilter] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [calorieFilter, setCalorieFilter] = useState({ min: 0, max: 2000 });
  const [ingredientFilter, setIngredientFilter] = useState('');
  const [spiceLevelFilter, setSpiceLevelFilter] = useState('all');
  const [vegetarianFilter, setVegetarianFilter] = useState(false);
  const [veganFilter, setVeganFilter] = useState(false);
  const [showHolidayAnalytics, setShowHolidayAnalytics] = useState(false);
  
  // ��������� ��� ������� ���������
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDishForReview, setSelectedDishForReview] = useState(null);
  
  // ��������� ��� AI-������������
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
  
  // ����� ��������� ��� ���
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [showAddresses, setShowAddresses] = useState(false);
  
  // ���������� WebSocket ��� ����������� �������
  const { unreadCount, joinRoom, leaveRoom, addNotification } = useNotifications('client');
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // ������� ��� ������������ ����� ���������
  const switchToSection = (section) => {
    // ��������� ��� �������
    setShowCookingRequests(false);
    setShowHelpGuestRequests(false);
    setShowClientNotifications(false);
    setShowDiabeticMenu(false);
    
    // ��������� ������ ������
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
        // ��� ������� ���������� ���������
        navigate('/client/orders');
        break;
      default:
        break;
    }
  };

  // ������������ � ������� ������� ��� ������������
  useEffect(() => {
    const clientId = localStorage.getItem('clientId') || 'demo_client';
    joinRoom(clientId);
    
    return () => {
      leaveRoom(clientId);
    };
  }, [joinRoom, leaveRoom]);

  // ������� ������� �����������
  useEffect(() => {
    const handleNotificationAdded = (event) => {
      // ������������� �����������
      const clientId = localStorage.getItem('clientId') || 'demo_client';
      joinRoom(clientId);
    };

    const handleNotificationsUpdated = () => {
      // ������������� �����������
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

  // ������� ������� ���������� ����������� ��� �������
  useEffect(() => {
    const handleNotificationsUpdated = () => {
      try {
        // ������������� ����������� ��� ���������� ��������
        const clientId = localStorage.getItem('clientId') || 'demo_client';
        joinRoom(clientId);
        
        // ��������� ������� ������������� �����������
        const notifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        // unreadCount ��� ����������� ����� useNotifications
      } catch (error) {
        console.error('Error handling notifications update:', error);
      }
    };

    window.addEventListener('clientNotificationsUpdated', handleNotificationsUpdated);

    return () => {
      window.removeEventListener('clientNotificationsUpdated', handleNotificationsUpdated);
    };
  }, [joinRoom]);


  // ��������� ��� ��������
  const cuisines = [
    { id: 'all', name: '��� �����' },
    { id: 'tatar', name: '���������' },
    { id: 'russian', name: '�������' },
    { id: 'european', name: '�����������' },
    { id: 'asian', name: '���������' },
    { id: 'mediterranean', name: '�����������������' },
    { id: 'american', name: '������������' }
  ];

  const diets = [
    { id: 'all', name: '����� �����' },
    { id: 'vegetarian', name: '��������������' },
    { id: 'vegan', name: '���������' },
    { id: 'keto', name: '����' },
    { id: 'paleo', name: '�����' },
    { id: 'low_carb', name: '���������������' },
    { id: 'gluten_free', name: '��� �������' }
  ];

  const cookingTimes = [
    { id: 'all', name: '����� �����' },
    { id: 'fast', name: '������ (�� 30 ���)', max: 30 },
    { id: 'medium', name: '������ (30-60 ���)', min: 30, max: 60 },
    { id: 'slow', name: '����� (60+ ���)', min: 60 }
  ];

  // ����������� ��������� ��� ��������
  const allergens = [
    { id: 'gluten', name: '������', icon: '??' },
    { id: 'dairy', name: '�������� ��������', icon: '??' },
    { id: 'nuts', name: '�����', icon: '??' },
    { id: 'eggs', name: '����', icon: '??' },
    { id: 'soy', name: '���', icon: '??' },
    { id: 'fish', name: '����', icon: '??' },
    { id: 'shellfish', name: '������������', icon: '??' },
    { id: 'sesame', name: '������', icon: '??' }
  ];

  const spiceLevels = [
    { id: 'all', name: '����� �������' },
    { id: 'mild', name: '�� ������', level: 0 },
    { id: 'medium', name: '������ ������', level: 1 },
    { id: 'hot', name: '������', level: 2 },
    { id: 'very_hot', name: '����� ������', level: 3 }
  ];


  // ������� ��������� ������� ��� ������������� ����� ������������
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

  // ���������������� ���������
  const categories = [
    { id: 'halal', name: t.halalMenu, icon: '??' },
    { id: 'main', name: t.mainDishes, icon: '???' },
    { id: 'semi-finished', name: t.semiFinished, icon: '??' },
    { id: 'bakery', name: t.bakery, icon: '??' },
    { id: 'tatar', name: t.tatarCuisine, icon: '??' },
    { id: 'soups', name: t.soups, icon: '??' },
    { id: 'salads', name: t.salads, icon: '??' },
    { id: 'desserts', name: t.desserts, icon: '??' },
    { id: 'beverages', name: t.beverages, icon: '?��' },
    { id: 'diet', name: t.dietMenu, icon: '??' },
    { id: 'diabetic', name: (t.diabeticMenu && (t.diabeticMenu.title || t.diabeticMenu)) || '������������� ����', icon: '??', isSpecial: true },
    { id: 'client_cook', name: t.clientCooking, icon: '?????' },
    { id: 'master_class', name: t.masterClass, icon: '?????' },
    { id: 'help_guest', name: t.helpGuest, icon: '??' },
    { id: 'preparations', name: t.preparations, icon: '??�' },
  ];

  // �������� ���� ��� ������ ���������
  useEffect(() => {
    if (selectedCategory) {
    const fetchDishes = async () => {
        setLoading(true);
        try {
           // ���������� ���������� ������ ��� �������������� ����������� ����������
          
          // �������� ID ��������� � API ��� ����������
          const response = await getAvailableDishes(selectedCategory.id);
          if (response.success) {
            setDishes(response.dishes);
            setFilteredDishes(response.dishes); // �������������� ������������� �����
        } else {
          setError('�� ������� ��������� ����');
        }
      } catch (err) {
        setError('������ ��� �������� ����');
        console.error('Error fetching dishes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
    }
  }, [selectedCategory]);

  // �������� ������� �� localStorage ��� �������������
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

  // ���������� ������� � localStorage ��� ��������� (������ ���� ������� �� ������)
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

  // ���?���� �?���������
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('role');
    
    if (!token || role !== 'client') {
      navigate('/client/login');
    }
  }, [navigate]);

  // ������� ��� ���?���� ������������� ����
  const isDiabeticFriendly = (dish) => {
    if (!diabeticFilter) return true;
    
    const carbs = dish.carbs || 0;
    const sugar = dish.sugar || 0;
    
     // ���?����� ������ ����?���? � ������
    if (carbs > maxCarbs || sugar > maxSugar) return false;
    
     // ����?��� ����� � ?������ ����������� ������ ���� ?������ ������
    if (hideHighSugar && sugar > 15) return false;
    
    return true;
  };

  // ����������� ������� ����������
  const isDishMatchingFilters = (dish) => {
    // ������������� ������
    if (diabeticFilter && !isDiabeticFriendly(dish)) {
      return false;
    }

    // ������ �� �����
    if (cuisineFilter !== 'all' && dish.cuisine !== cuisineFilter) {
      return false;
    }

    // ������ ������
    if (halalFilter && !dish.halal) {
      return false;
    }

    // ������ �� �����
    if (dietFilter !== 'all' && !dish.diets?.includes(dietFilter)) {
      return false;
    }

    // ������ �� ����
    if (dish.price < priceRange.min || dish.price > priceRange.max) {
      return false;
    }

    // ������ �� ?������ �������?�����
    if (cookingTimeFilter !== 'all') {
      const timeFilter = cookingTimes.find(t => t.id === cookingTimeFilter);
      if (timeFilter) {
        const dishCookingTime = dish.cookingTime || 30; // �� ��������� 30 �����
        if (timeFilter.min && dishCookingTime < timeFilter.min) {
          return false;
        }
        if (timeFilter.max && dishCookingTime > timeFilter.max) {
          return false;
        }
      }
    }

    // ������ �� ���������� (��������� ����� � ���������� �����������)
    if (allergenFilter.length > 0) {
      const dishAllergens = dish.allergens || [];
      const hasExcludedAllergen = allergenFilter.some(allergen => 
        dishAllergens.includes(allergen)
      );
      if (hasExcludedAllergen) {
        return false;
      }
    }

    // ������ �� ��������
    if (ratingFilter > 0 && (dish.rating || 0) < ratingFilter) {
      return false;
    }

    // ������ �� ��������
    if (dish.calories) {
      if (dish.calories < calorieFilter.min || dish.calories > calorieFilter.max) {
        return false;
      }
    }

    // ������ �� ������������
    if (ingredientFilter.trim()) {
      const ingredients = dish.ingredients || '';
      if (!ingredients.toLowerCase().includes(ingredientFilter.toLowerCase())) {
        return false;
      }
    }

    // ������ �� �������
    if (spiceLevelFilter !== 'all') {
      const spiceLevel = spiceLevels.find(s => s.id === spiceLevelFilter);
      if (spiceLevel && (dish.spiceLevel || 0) !== spiceLevel.level) {
        return false;
      }
    }

    // ������ �� ��������������
    if (vegetarianFilter && !dish.isVegetarian) {
      return false;
    }

    // ������ �� ���������
    if (veganFilter && !dish.isVegan) {
      return false;
    }


    return true;
  };

  // �������?�� ���� (���������� ������ � MenuFilters)
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

  // ���������� ���������� ��� client_cook
  // ���������� ���������� ������ ��� ������?������� ����������� ���������?

  // ���������� ?����� ���������
  const handleCategorySelect = (category) => {
    // ���� ��� ���������� �����, ��������� �� ��������� ��������
    if (category.id === 'farmers_market') {
      navigate('/client/farmers-market');
      return;
    }
    
    // ���� ��� ������������� ����, ?������� ������ � ������?��� ������������� ����������
    if (category.id === 'diabetic') {
      setDiabeticFilter(true);
      setShowDiabeticMenu(true);
      setSelectedCategory(category);
      return;
    }
    
    setSelectedCategory(category);
    setShowDiabeticMenu(false); // ������?��� ����� ������������� ����������?
    setDishes([]); // ������� ����� ��� ?����� ��?�� ���������
  };

  // ���?��� � ?����� ���������
  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setShowDiabeticMenu(false); // ������?��� ����� ������������� ����������?
    setDishes([]);
  };

  // ���������� ����� �� ����� ��� ����?�� � ���������� �������
  const handleCookingRequest = (dish) => {
    if (dish.clientCooking) {
      setSelectedCookingDish(dish);
      setShowCookingRequest(true);
    }
  };

  // ���������� �����?�� ������� �� ����?��
  const handleCookingRequestSubmit = async (requestData) => {
    try {
      console.log('Cooking request submitted:', requestData);
      // ����� ����� �����?�� ������� �� ����?��
      // � �������� ���������� ��� ����� API ������
      showSuccess('������ �� ����?�� �����?���! ��?�� �?������ � ?��� ? ��������� ?����.');
    } catch (error) {
      console.error('Error submitting cooking request:', error);
      showError('������ ��� �����?�� �������. ���������� ��� ���.');
    }
  };

  // ���������� ����� �� ����� ��� ������ ������
  const handleHelpGuestRequest = (dish) => {
    if (dish.helpGuest) {
      setSelectedHelpGuestDish(dish);
      setShowHelpGuestRequest(true);
    }
  };

  // ���������� �����?�� ������� ������ ������
  const handleHelpGuestRequestSubmit = async (requestData) => {
    try {
      // ������� ������ �� ������ ������
      const helpRequest = {
        id: `help-request-${Date.now()}`,
        type: 'help_guest',
        status: 'pending',
        clientId: localStorage.getItem('clientId') || 'demo_client',
        clientName: localStorage.getItem('clientName') || '������',
        dishId: requestData.dishId,
        dishName: requestData.dishName || '������ ? ����?��',
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

      // ��������� ������ ? localStorage
      const existingRequests = JSON.parse(localStorage.getItem('helpGuestRequests') || '[]');
      const updatedRequests = [helpRequest, ...existingRequests];
      localStorage.setItem('helpGuestRequests', JSON.stringify(updatedRequests));

      // �����?���� �?��������� ��?���
      const chefNotification = {
        id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'help_guest_request',
        title: '��?�� ������ �� ������ ������',
        message: `������ ${helpRequest.clientName} �������� ������ ? �������?�� � ������ ������ �� ${helpRequest.eventDate} ? ${helpRequest.eventTime}`,
        requestId: helpRequest.id,
        orderId: helpRequest.id,
        timestamp: new Date().toISOString(),
        read: false
      };

      // ��������� �?��������� ��?���
      const chefNotifications = JSON.parse(localStorage.getItem('chefNotifications') || '[]');
      const updatedChefNotifications = [chefNotification, ...chefNotifications].slice(0, 50);
      localStorage.setItem('chefNotifications', JSON.stringify(updatedChefNotifications));

      // �����?���� ������� ��� ����?����� �?��������� ��?���
      window.dispatchEvent(new CustomEvent('chefNotificationAdded', { 
        detail: chefNotification 
      }));

      // �����?���� ������� ��� ����?����� ��������
      window.dispatchEvent(new CustomEvent('chefNotificationsUpdated'));

      showSuccess('������ �� ������ ? �������?�� � ������ ������ �����?���! ��?�� �?������ � ?��� ? ��������� ?����.');
    } catch (error) {
      console.error('Error submitting help guest request:', error);
      showError('������ ��� �����?�� �������. ���������� ��� ���.');
    }
  };

  // ���������� ����� �� ����� ��� ������-������
  const handleMasterClassRequest = (dish) => {
    if (dish.masterClass) {
      setSelectedMasterClassDish(dish);
      setShowMasterClassRequest(true);
    }
  };

  // ���������� �����?�� ������� ������-������
  const handleMasterClassRequestSubmit = async (requestData) => {
    try {
      console.log('Master class request submitted:', requestData);
      // ����� ����� �����?�� ������� �� ������-�����
      // � �������� ���������� ��� ����� API ������
      showSuccess('���?�� �� ������-����� �����?����! ��?�� �?������ � ?��� ��� ��������� �������.');
    } catch (error) {
      console.error('Error submitting master class request:', error);
      showError('������ ��� �����?�� ���?��. ���������� ��� ���.');
    }
  };

  // ���������� ��������� �������?��
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // ���������� ���������
  const toggleFavorite = (item, type = 'dishes') => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"dishes":[],"chefs":[]}');
    const isAlreadyFavorite = favorites[type].some(fav => fav.id === item.id);
    
    if (isAlreadyFavorite) {
      favorites[type] = favorites[type].filter(fav => fav.id !== item.id);
      showSuccess(`������� �� ����������`);
    } else {
      favorites[type].push(item);
      showSuccess(`${item.name} ��������� � ���������!`);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  const isFavorite = (itemId, type = 'dishes') => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{"dishes":[],"chefs":[]}');
    return favorites[type].some(fav => fav.id === itemId);
  };

  // ���������� ����� � �������
  const addToCart = (dish, event) => {
    // �������� "�������" � �������
    if (event) {
      const rect = event.target.getBoundingClientRect();
      const animatingItem = {
        id: Date.now() + Math.random(),
        dish: dish,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      setAnimatingItems(prev => [...prev, animatingItem]);
      
      // ������� ����������� ������� ����� 1.2 �������
      setTimeout(() => {
        setAnimatingItems(prev => prev.filter(item => item.id !== animatingItem.id));
      }, 1200);
      
      // ��������� ������ �������
      setCartPulsing(true);
      setTimeout(() => setCartPulsing(false), 800);
      
      // �������� ��� ��������� ���������
      if (navigator.vibrate) {
        navigator.vibrate([30, 50, 30]); // ������� ��������
      }
      
      // �������� ������ (����������� - ������� ������� "����" ����)
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // ������ �����
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (e) {
        // ���� ���� �� �������������� - ����������
      }
    }
    
    // �������� ������� ������� �� localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // ���������, ���� �� ��� ����� ����� � �������
    const existingItem = currentCart.find(item => item.id === dish.id);
    
    let updatedCart;
    if (existingItem) {
      // ����������� ���������� ������������� �����
      updatedCart = currentCart.map(item => 
          item.id === dish.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
    } else {
      // ��������� ����� ����� � �������
      updatedCart = [...currentCart, { ...dish, quantity: 1 }];
    }
    
    // ��������� ������ ������ ����� �����������
    const cartString = JSON.stringify(updatedCart);
    const cartSize = new Blob([cartString]).size;
    
    // ���� ������ ��������� 10MB (�������� 10,000,000 ����), ������� �������
    if (cartSize > 10000000) {
      console.warn('Cart size exceeded limit, clearing cart');
      localStorage.removeItem('cart');
      updatedCart = [{ ...dish, quantity: 1 }];
    }
    
    try {
      // ��������� ��������� ��������� �������
      setCart(updatedCart);
      
      // ��������� � localStorage � ���������� ������
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      
      // ���������� custom event ��� ���������� ������ �����������
      window.dispatchEvent(new CustomEvent('cartChanged'));
      
      // ���������� �����������
      showSuccess(`"${dish.name}" ${t.dishAddedToCart}`);
    } catch (error) {
      console.error('? Error saving cart to localStorage:', error);
      
      // ���� ������ ��-�� ���������� �����, ������� ������� � ������� �����
      if (error.name === 'QuotaExceededError') {
        console.warn('Quota exceeded, clearing cart and retrying');
        localStorage.removeItem('cart');
        
        // ������� ����������� ������� ������ � ������� ������ (������ ������)
        const minimalCart = [{ ...dish, quantity: 1 }];
        
        try {
          localStorage.setItem('cart', JSON.stringify(minimalCart));
          setCart(minimalCart);
          showSuccess(`"${dish.name}" ${t.dishAddedToCart} (������� ���� ������� ��-�� ���������� ������)`);
        } catch (retryError) {
          console.error('Failed to save even minimal cart:', retryError);
          showError('������ ���������� �������. ���������� �������� ������ ��������.');
        }
      } else {
        showError('������ ���������� �������');
      }
    }
  };

  // ������� ������� localStorage
  const clearLocalStorage = () => {
    try {
      localStorage.clear();
      setCart([]);
      // ���������� ������� ��� ���������� ������� �����������
      window.dispatchEvent(new CustomEvent('clientNotificationsUpdated'));
      showSuccess('������ �������� �������');
      console.log('LocalStorage cleared successfully');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      showError('������ ������� ������ ��������');
    }
  };

  // ������� ?�������?����� ����-������
  const restoreDemoData = () => {
    try {
      // ������� ����-������ ��� ��?���
      const chefId = 'rustam_isaev_84%40mail.ru';
      const demoDishes = [
        {
          id: 'demo-dish-1',
          name: '���� ����������',
          description: '������������ ���� � ��?������ � ��������',
          price: 350,
          category: 'soups',
          category_id: 'soups',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.5
        },
        {
          id: 'demo-dish-2',
          name: '���? ���������',
          description: '������������ ���? � ��������� � �����?��',
          price: 450,
          category: 'tatar',
          category_id: 'tatar',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.8
        },
        {
          id: 'demo-dish-3',
          name: '������ � �������',
          description: '����� � ������� �������, ���������� � ������ ������',
          price: 280,
          category: 'salads',
          category_id: 'salads',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.2
        },
        {
          id: 'demo-dish-4',
          name: '���� ��������',
          description: '�?���� �������� ���� �� ����',
          price: 120,
          category: 'bakery',
          category_id: 'bakery',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.7
        },
        {
          id: 'demo-dish-5',
          name: '������� � �����',
          description: '������� ��������� ������� � ������ ��������',
          price: 80,
          category: 'bakery',
          category_id: 'bakery',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.9
        },
        {
          id: 'demo-dish-6',
          name: '���������',
          description: '������������ ��������� ����� � ������ � �����',
          price: 520,
          category: 'tatar',
          category_id: 'tatar',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.6
        },
        {
          id: 'demo-dish-7',
          name: '����� �� ��?�����',
          description: '������ ����� � ���������� ���',
          price: 650,
          category: 'main',
          category_id: 'main',
          image: null,
          chef: 'Rustam Isaev',
          rating: 4.4
        }
      ];

      // ��������� ? localStorage
      localStorage.setItem(`demo_menu_${chefId}`, JSON.stringify(demoDishes));
      
      console.log('?�� Demo data restored:', demoDishes);
      showSuccess('����-������ ?�������?����! ����?��� ��������.');
      
      // ����?���� �������� ����� 2 �������
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error restoring demo data:', error);
      showError('������ �������������� ����-������');
    }
  };


  // ����� �� ��������
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('clientId');
    localStorage.removeItem('role');
    navigate('/client/login');
  };

  // ������� ������ ���������� ������� � �������
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // ������� ��� ������ � ��������
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
    
    // ��������� ������� �����
    const dishReviews = newReviews.filter(r => r.dishId === review.dishId);
    const averageRating = dishReviews.reduce((sum, r) => sum + r.rating, 0) / dishReviews.length;
    
    // ��������� ������� � �����
    setDishes(prevDishes => 
      prevDishes.map(dish => 
        dish.id === review.dishId 
          ? { ...dish, rating: averageRating, reviewCount: dishReviews.length }
          : dish
      )
    );
    
    showSuccess('������� �� ��� �����!');
  };

  const getDishReviews = (dishId) => {
    return reviews.filter(review => review.dishId === dishId);
  };

  // ���������� ��������� ��������
  const handleFiltersChange = (filteredDishes, filters) => {
    setFilteredDishes(filteredDishes);
    console.log('Filters applied:', filters);
    console.log('Filtered dishes count:', filteredDishes.length);
  };

  // ���������� �������� ������� �����
  const handleDishDetails = (dish) => {
    setSelectedDish(dish);
    setShowDishDetails(true);
  };

  // ���������� �������� ������� �����
  const handleCloseDishDetails = () => {
    setShowDishDetails(false);
    setSelectedDish(null);
  };

  const getDishRating = (dishId) => {
    const dishReviews = getDishReviews(dishId);
    if (dishReviews.length === 0) return 0;
    return dishReviews.reduce((sum, review) => sum + review.rating, 0) / dishReviews.length;
  };

  // ��������� ������ ��� ������������ ����������
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
      {/* Overlay ��� ������ ���������� �������� */}
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
            ������������ �����
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // ��������� �������� ��� �������������� ���������� ������
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
            ������� �����
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowOrderHistory(true); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ?? ������� �������
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowFavorites(true); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ? ���������
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAddresses(true); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ?? ��� ������
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/client/chat'); }}
            className="modern-button light nav-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ?? ��� � �������
          </button>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              console.log('Notifications button clicked, current state:', showClientNotifications);
              // ��������� �������� ��� �������������� ����������
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
            �����������
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
          
          {/* ������ ��� �������?���� �?��������� */}
          <button
            onClick={() => {
              // ���������, �� ��������� �� �� ��� �������� ����������� �������
              const today = new Date().toDateString();
              const lastTestDate = localStorage.getItem('lastTestNotificationDate');
              
              if (lastTestDate === today) {
                showSuccess('�������� ����������� ��� ������� �������!');
                return;
              }
              
              const testNotification = {
                type: 'test',
                title: '�������� �����������',
                message: '��� �������� ����������� ��� �������� �������',
                timestamp: new Date().toISOString()
              };
              addNotification(testNotification);
              localStorage.setItem('lastTestNotificationDate', today);
              console.log('Test notification added');
              showSuccess('�������� ����������� �������!');
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
            ���� �����������
          </button>
          
          {/* ������ ��� ������� �������� ����������� */}
          <button
            onClick={() => {
              localStorage.removeItem('lastTestNotificationDate');
              showSuccess('�������� ����������� ��������!');
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
            ����� ������
          </button>
          <button 
            onClick={() => setShowCookingRequests(!showCookingRequests)}
            className={`modern-button light nav-button ${showCookingRequests ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="chef" size={20} animation="rotate" />
            ��� �������
          </button>
          <button 
            onClick={() => setShowDiabeticMenu(!showDiabeticMenu)}
            className={`modern-button light nav-button ${showDiabeticMenu ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="health" size={20} animation="glow" />
            ���� ��� ����������
          </button>
          <button 
            onClick={() => {
              console.log('������ "��� ������� �� ������" ������. ������� ���������:', showHelpGuestRequests);
              setShowHelpGuestRequests(!showHelpGuestRequests);
            }}
            className={`modern-button light nav-button ${showHelpGuestRequests ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AnimatedIcon name="cooking" size={20} animation="pulse" />
            ��� ������� �� ������
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
                showSuccess('������ ������� ����������!');
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
        // ���������� ���������
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
                ?? �������� �� �������
              </Link>
            </div>
            
            {/* ��?��� � ������������ - ������?����� ������ ����� ������� ������ */}
            {showHolidayAnalytics && (
              <div style={{
                animation: 'fadeIn 0.5s ease-in-out',
                marginBottom: '20px'
              }}>
                <HolidayAnalytics onClose={() => setShowHolidayAnalytics(false)} />
              </div>
            )}
            
            {/* ������ ������� ������� - ������������ ������ ����� ������� ������ */}
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
            
            {/* ������ �������? */}
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
                <h3 style={{ margin: 0, color: '#2c3e50' }}>?? ������� � �����</h3>
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
                    ??? ��������
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
                  {showFilters ? '������ �������' : '�������� �������'}
                </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="filters-content" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '15px'
                }}>
                  {/* ������ �� ����� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ??? �����
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

                  {/* ������ �� ����� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? �����
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

                  {/* ������ �� ������� ������������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ? ����� �������������
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

                  {/* ������ �� ���� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? ����: {priceRange.min}? - {priceRange.max}?
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
                        placeholder="��"
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
                        placeholder="��"
                      />
                    </div>
                  </div>

                  {/* �������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? �������������
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={halalFilter}
                          onChange={(e) => setHalalFilter(e.target.checked)}
                        />
                        ?? ������
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={diabeticFilter}
                          onChange={(e) => setDiabeticFilter(e.target.checked)}
                        />
                        ?? ������������� ����
                      </label>
                    </div>
                  </div>

                  {/* ����������� ������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? ��������� (���������)
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

                  {/* ������ �� �������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ? ����������� �������: {ratingFilter}
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

                  {/* ������ �� �������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? �������
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
                        placeholder="��"
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
                        placeholder="��"
                      />
                    </div>
                  </div>

                  {/* ������ �� ������������ */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? ����� �� ������������
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
                      placeholder="������� ����������..."
                    />
                  </div>

                  {/* ������ �� ������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ??? �������
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

                  {/* �������������� �������� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? �������������
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={vegetarianFilter}
                          onChange={(e) => setVegetarianFilter(e.target.checked)}
                        />
                        ?? ������ ��������������
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <input
                          type="checkbox"
                          checked={veganFilter}
                          onChange={(e) => setVeganFilter(e.target.checked)}
                        />
                        ?? ������ ���������
                      </label>
                    </div>
                  </div>

                  {/* �������?�� */}
                  <div className="filter-group">
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ?? �������?��
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
                      <option value="name">�� ���?����</option>
                      <option value="price-asc">����: �� ?����������</option>
                      <option value="price-desc">����: �� ���?����</option>
                      <option value="cooking-time">����� �������?�����</option>
                      <option value="rating">�� ��������</option>
                    </select>
                  </div>
                </div>
              )}
              
              {/* ������� ����������? */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: 'rgba(52, 152, 219, 0.1)', 
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#2c3e50'
              }}>
                ������� ����: <strong>{filteredDishes.length}</strong> �� {dishes.length}
              </div>
            </div>
            
            {/* ������ AI ������������ */}
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
                ?? AI ������������
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
            
            {/* AI ������ - ���������� ���� ����� ����� ��������� */}
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
                  ?? ������ �������
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
                  <span style={{ color: 'rgba(0,0,0,0.7)', mixBlendMode: 'multiply', fontSize: '18px' }}>??</span> <span style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.5)', fontSize: '16px' }}>AI-��������� ����������</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="loading">�������� ����...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        // ������?��� ����� ?�������� ���������
        <div className="client-menu-content" style={{ position: 'relative', zIndex: 2 }}>
          <div className="category-header">
            <button 
              className="back-to-categories-button"
              onClick={handleBackToCategories}
            >
              ?�� {t.backToCategories}
            </button>
            <h2>{selectedCategory.name}</h2>
            </div>
            
          <div className="menu-filters">
            <div className="sort-filter">
              <label htmlFor="sort">�������?��� ��:</label>
              <select id="sort" value={sortBy} onChange={handleSortChange}>
                <option value="name">{t.name}</option>
                <option value="price-asc">{t.priceAsc}</option>
                <option value="price-desc">{t.priceDesc}</option>
              </select>
            </div>
            
            {/* ������������� ������� */}
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

          {/* ������� ���� */}
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
      
      {/* ����������� �������� */}
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
      
      {/* ������� ����� */}
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
              ?? ������� �����
            </h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              �������� ����� ��� �������� ������
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
                    ��������
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
                �������
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ����� ��� �������� */}
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
