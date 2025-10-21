import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAvailableDishes } from "../api/adapter";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "../contexts/ToastContext";
import SideCart from "./SideCart";
import ModernDishCard from "./ModernDishCard";
import StickyCategories from "./StickyCategories";
import ModernFilters from "./ModernFilters";

const ModernClientMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sideCartOpen, setSideCartOpen] = useState(false);

  // Фильтры
  const [filters, setFilters] = useState({
    cuisine: "all",
    halal: false,
    diet: "all",
    priceRange: { min: 0, max: 5000 },
    cookingTime: "all",
    allergens: [],
    vegetarian: false,
    spicy: false,
    new: false,
  });

  const navigate = useNavigate();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();

  // Категории
  const categories = [
    { id: "main", name: "Основные", icon: "🍽️" },
    { id: "salads", name: "Салаты", icon: "🥗" },
    { id: "soups", name: "Супы", icon: "🍲" },
    { id: "desserts", name: "Десерты", icon: "🍰" },
    { id: "beverages", name: "Напитки", icon: "🥤" },
    { id: "bakery", name: "Выпечка", icon: "🥖" },
    { id: "tatar", name: "Татарская", icon: "🥘" },
    { id: "halal", name: "Халяль", icon: "🕌" },
    { id: "diet", name: "Диетическое", icon: "🥗" },
    { id: "preparations", name: "Заготовки", icon: "🥘" },
  ];

  // Загрузка блюд
  const loadDishes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAvailableDishes();

      // Добавляем демо данные если нет блюд
      if (!data || data.length === 0) {
        const demoDishes = [
          {
            id: 1,
            name: "Борщ украинский",
            description: "Классический борщ с говядиной и сметаной",
            price: 350,
            weight: "400г",
            image: "/images/borscht.jpg",
            category: "MAIN_COURSE",
            rating: 4.8,
            reviewsCount: 24,
            isNew: true,
            isPopular: true,
            isVegetarian: false,
            isSpicy: false,
          },
          {
            id: 2,
            name: "Цезарь с курицей",
            description: "Свежий салат с куриной грудкой и пармезаном",
            price: 420,
            weight: "300г",
            image: "/images/caesar.jpg",
            category: "SALAD",
            rating: 4.6,
            reviewsCount: 18,
            isNew: false,
            isPopular: true,
            isVegetarian: false,
            isSpicy: false,
          },
          {
            id: 3,
            name: "Тирамису",
            description: "Классический итальянский десерт с кофе и маскарпоне",
            price: 280,
            weight: "150г",
            image: "/images/tiramisu.jpg",
            category: "DESSERT",
            rating: 4.9,
            reviewsCount: 31,
            isNew: false,
            isPopular: true,
            isVegetarian: true,
            isSpicy: false,
          },
          {
            id: 4,
            name: "Том Ям",
            description: "Острый тайский суп с креветками и грибами",
            price: 450,
            weight: "350г",
            image: "/images/tom-yam.jpg",
            category: "SOUP",
            rating: 4.7,
            reviewsCount: 15,
            isNew: true,
            isPopular: false,
            isVegetarian: false,
            isSpicy: true,
          },
          {
            id: 5,
            name: "Стейк рибай",
            description: "Сочный говяжий стейк средней прожарки",
            price: 890,
            weight: "250г",
            image: "/images/ribeye.jpg",
            category: "MAIN_COURSE",
            rating: 4.9,
            reviewsCount: 42,
            isNew: false,
            isPopular: true,
            isVegetarian: false,
            isSpicy: false,
          },
          {
            id: 6,
            name: "Смузи ягодный",
            description: "Охлаждающий смузи из смешанных ягод",
            price: 180,
            weight: "300мл",
            image: "/images/smoothie.jpg",
            category: "BEVERAGE",
            rating: 4.5,
            reviewsCount: 12,
            isNew: true,
            isPopular: false,
            isVegetarian: true,
            isSpicy: false,
          },
        ];
        setDishes(demoDishes);
      } else {
        setDishes(data);
      }
    } catch (err) {
      setError("Ошибка загрузки блюд");
      showError("Не удалось загрузить меню");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDishes();
  }, [loadDishes]);

  // Фильтрация блюд
  const filteredDishes = (dishes || []).filter((dish) => {
    // Поиск
    if (
      searchQuery &&
      !dish.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Категория
    if (selectedCategory) {
      const categoryMap = {
        main: "MAIN_COURSE",
        salads: "SALAD",
        soups: "SOUP",
        desserts: "DESSERT",
        beverages: "BEVERAGE",
        bakery: "DESSERT",
        tatar: "MAIN_COURSE",
        halal: "MAIN_COURSE",
        diet: "MAIN_COURSE",
        preparations: "SEMI_FINISHED",
      };

      if (dish.category !== categoryMap[selectedCategory]) {
        return false;
      }
    }

    // Цена
    if (
      dish.price < filters.priceRange.min ||
      dish.price > filters.priceRange.max
    ) {
      return false;
    }

    // Вегетарианское
    if (filters.vegetarian && !dish.isVegetarian) {
      return false;
    }

    // Острое
    if (filters.spicy && !dish.isSpicy) {
      return false;
    }

    // Новинки
    if (filters.new && !dish.isNew) {
      return false;
    }

    return true;
  });

  // Работа с корзиной
  const handleAddToCart = (dish) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === dish.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...dish, quantity: 1 }];
      }
    });
    showSuccess(`${dish.name} добавлено в корзину!`);
  };

  const handleRemoveFromCart = (dishId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== dishId));
  };

  const handleUpdateQuantity = (dishId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(dishId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === dishId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      cuisine: "all",
      halal: false,
      diet: "all",
      priceRange: { min: 0, max: 5000 },
      cookingTime: "all",
      allergens: [],
      vegetarian: false,
      spicy: false,
      new: false,
    });
    setSelectedCategory(null);
    setSearchQuery("");
  };

  const handleRefresh = () => {
    loadDishes();
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("role");
    localStorage.removeItem("clientId");
    navigate("/");
  };

  return (
    <div className="modern-menu-container">
      {/* Современная навигация сверху */}
      <nav className="modern-top-nav">
        <div className="nav-brand">
          <span className="brand-icon">🍽️</span>
          <span className="brand-text">Food Delivery</span>
        </div>

        <div className="nav-search">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-search-input"
            />
          </div>
        </div>

        <div className="nav-actions">
          <button className="cart-button" onClick={() => setSideCartOpen(true)}>
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{cart.length}</span>
          </button>

          <button className="profile-button" onClick={handleLogout}>
            <span className="profile-icon">👤</span>
          </button>
        </div>
      </nav>

      {/* Sticky категории */}
      <StickyCategories
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Основной контент */}
      <main className="modern-content">
        {/* Hero секция */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Вкусная еда на заказ</h1>
            <p className="hero-subtitle">
              Свежие блюда от лучших поваров города
            </p>

            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-number">{(dishes || []).length}+</span>
                <span className="stat-label">Блюд</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-label">Поваров</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4.8</span>
                <span className="stat-label">Рейтинг</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="floating-food">
              <span className="food-item">🍕</span>
              <span className="food-item">🍔</span>
              <span className="food-item">🍜</span>
              <span className="food-item">🥗</span>
              <span className="food-item">🍰</span>
            </div>
          </div>
        </section>

        {/* Фильтры */}
        <ModernFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
        />

        {/* Сетка блюд */}
        <section className="dishes-section">
          <div className="section-header">
            <h2 className="section-title">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Все блюда"}
            </h2>
            <span className="dishes-count">{filteredDishes.length} блюд</span>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Загружаем вкусные блюда...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <span className="error-icon">😞</span>
              <h3>Упс! Что-то пошло не так</h3>
              <p>{error}</p>
              <button onClick={handleRefresh} className="retry-btn">
                Попробовать снова
              </button>
            </div>
          ) : (
            <div className="modern-dishes-grid">
              {filteredDishes.map((dish) => (
                <ModernDishCard
                  key={dish.id}
                  dish={dish}
                  onAddToCart={handleAddToCart}
                  onRemoveFromCart={handleRemoveFromCart}
                  cartQuantity={
                    cart.find((item) => item.id === dish.id)?.quantity || 0
                  }
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Side Cart */}
      <SideCart
        isOpen={sideCartOpen}
        onClose={() => setSideCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
      />

      {/* Floating Action Button */}
      <div className="fab-container">
        <button
          className="fab-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="fab-icon">🔍</span>
        </button>
      </div>
    </div>
  );
};

export default ModernClientMenu;
