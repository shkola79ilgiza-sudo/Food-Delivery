import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const GuestMenu = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Моковые данные для демонстрации
  const mockDishes = [
    {
      id: 1,
      name: 'Борщ украинский',
      description: 'Классический борщ с говядиной и сметаной',
      price: 350,
      category: 'russian',
      cookingTime: 90,
      image: '/images/tatar.jpg',
      chef: 'Анна Петрова',
      rating: 4.8,
      reviews: 24
    },
    {
      id: 2,
      name: 'Плов узбекский',
      description: 'Традиционный плов с бараниной и морковью',
      price: 450,
      category: 'tatar',
      cookingTime: 120,
      image: '/images/tatar.jpg',
      chef: 'Мухаммад Алиев',
      rating: 4.9,
      reviews: 18
    },
    {
      id: 3,
      name: 'Эчпочмак',
      description: 'Татарские треугольные пирожки с мясом и картошкой',
      price: 180,
      category: 'tatar',
      cookingTime: 45,
      image: '/images/tatar.jpg',
      chef: 'Гульнара Хакимова',
      rating: 4.9,
      reviews: 35
    },
    {
      id: 4,
      name: 'Бешбармак',
      description: 'Традиционное татарское блюдо с лапшой и мясом',
      price: 520,
      category: 'tatar',
      cookingTime: 150,
      image: '/images/tatar.jpg',
      chef: 'Рашид Ибрагимов',
      rating: 4.8,
      reviews: 28
    },
    {
      id: 5,
      name: 'Салат Цезарь',
      description: 'Свежий салат с курицей и пармезаном',
      price: 280,
      category: 'european',
      cookingTime: 15,
      image: '/images/tatar.jpg',
      chef: 'Елена Смирнова',
      rating: 4.6,
      reviews: 31
    },
    {
      id: 6,
      name: 'Пицца Маргарита',
      description: 'Классическая пицца с томатами и моцареллой',
      price: 420,
      category: 'european',
      cookingTime: 25,
      image: '/images/tatar.jpg',
      chef: 'Джованни Росси',
      rating: 4.7,
      reviews: 42
    },
    {
      id: 7,
      name: 'Чак-чак',
      description: 'Сладкое татарское лакомство с медом',
      price: 200,
      category: 'tatar',
      cookingTime: 60,
      image: '/images/tatar.jpg',
      chef: 'Айгуль Мингазова',
      rating: 4.9,
      reviews: 22
    },
    {
      id: 8,
      name: 'Щи русские',
      description: 'Традиционные русские щи с капустой',
      price: 320,
      category: 'russian',
      cookingTime: 75,
      image: '/images/tatar.jpg',
      chef: 'Иван Петров',
      rating: 4.7,
      reviews: 19
    }
  ];

  const categories = [
    { id: 'all', name: 'Все блюда' },
    { id: 'tatar', name: 'Татарская кухня' },
    { id: 'russian', name: 'Русская кухня' },
    { id: 'european', name: 'Европейская кухня' }
  ];

  useEffect(() => {
    // Имитация загрузки данных
    setTimeout(() => {
      setDishes(mockDishes);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dish.chef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOrderClick = () => {
    // Перенаправляем на регистрацию с сообщением
    navigate('/client/register', { 
      state: { 
        message: 'Для оформления заказа необходимо зарегистрироваться' 
      } 
    });
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh',
        fontSize: '18px',
        color: '#2D5016'
      }}>
        Загрузка меню...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      {/* Заголовок */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        padding: '20px',
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{
          color: '#2D5016',
          fontSize: '2.5rem',
          marginBottom: '10px',
          fontWeight: '700'
        }}>
          🍽️ Меню ресторана
        </h1>
        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          marginBottom: '20px'
        }}>
          Просматривайте блюда без регистрации
        </p>
        
        {/* Кнопка регистрации */}
        <button
          onClick={() => navigate('/client/register')}
          style={{
            background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)',
            marginRight: '15px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
          }}
        >
          📝 Зарегистрироваться
        </button>
        
        <button
          onClick={() => navigate('/client/login')}
          style={{
            background: 'transparent',
            color: '#2D5016',
            border: '2px solid #2D5016',
            borderRadius: '25px',
            padding: '10px 28px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2D5016';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#2D5016';
          }}
        >
          🔑 Войти
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '15px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Поиск */}
          <div style={{ flex: '1', minWidth: '300px' }}>
            <input
              type="text"
              placeholder="🔍 Поиск по блюдам, поварам..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2D5016'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>

          {/* Категории */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '12px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Список блюд */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '25px'
      }}>
        {filteredDishes.map(dish => (
          <div
            key={dish.id}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {/* Изображение блюда */}
            <div style={{
              height: '200px',
              background: `url(${dish.image}) center/cover`,
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                padding: '5px 12px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2D5016'
              }}>
                ⭐ {dish.rating} ({dish.reviews})
              </div>
            </div>

            {/* Информация о блюде */}
            <div style={{ padding: '20px' }}>
              <h3 style={{
                color: '#2D5016',
                fontSize: '1.3rem',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                {dish.name}
              </h3>
              
              <p style={{
                color: '#666',
                fontSize: '14px',
                marginBottom: '10px',
                lineHeight: '1.4'
              }}>
                {dish.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{
                  color: '#2D5016',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {dish.price}₽
                </span>
                
                <span style={{
                  color: '#666',
                  fontSize: '14px'
                }}>
                  👨‍🍳 {dish.chef}
                </span>
              </div>

              {/* Кнопка заказа */}
              <button
                onClick={handleOrderClick}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2D5016 0%, #4A7C59 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(45, 80, 22, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(45, 80, 22, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(45, 80, 22, 0.3)';
                }}
              >
                🛒 Заказать (требуется регистрация)
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Сообщение если нет блюд */}
      {filteredDishes.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#666',
          fontSize: '18px'
        }}>
          😔 Блюда не найдены. Попробуйте изменить поисковый запрос.
        </div>
      )}
    </div>
  );
};

export default GuestMenu;
