import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../contexts/ToastContext';
import { getFarmersMarketProducts, createCookingRequest } from '../api/adapter';
import Rating from './Rating';
import '../App.css';

const FarmersMarket = () => {
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('products'); // 'products' или 'bringAndCook'
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Категории продуктов
  const productCategories = [
    { id: 'vegetables', name: t.vegetables, icon: '🥕' },
    { id: 'fruits', name: t.fruits, icon: '🍎' },
    { id: 'meat', name: t.meat, icon: '🥩' },
    { id: 'dairy', name: t.dairy, icon: '🥛' },
    { id: 'grains', name: t.grains, icon: '🌾' },
    { id: 'herbs', name: t.herbs, icon: '🌿' },
    { id: 'honey', name: t.honey, icon: '🍯' },
    { id: 'eggs', name: t.eggs, icon: '🥚' },
    { id: 'mushrooms', name: t.mushrooms, icon: '🍄' },
    { id: 'nuts', name: t.nuts, icon: '🥜' }
  ];


  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getFarmersMarketProducts(selectedCategory);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Ошибка загрузки продуктов');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showError]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleBuyProduct = (product) => {
    // Добавляем продукт в корзину
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
        type: 'product' // Отмечаем как продукт, а не блюдо
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    showSuccess(`${product.name} добавлен в корзину!`);
  };

  const handleRequestCooking = (product) => {
    // Переходим к форме запроса на приготовление
    setActiveTab('bringAndCook');
    showSuccess('Переходим к форме заказа приготовления');
  };

  const handleSubmitCookingRequest = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const requestData = {
      productsDescription: formData.get('products-description'),
      desiredDish: formData.get('desired-dish'),
      specialInstructions: formData.get('special-instructions'),
      cookingPrice: parseFloat(formData.get('cooking-price')) || 0
    };

    // Проверяем обязательные поля
    const missingFields = [];
    if (!requestData.productsDescription || requestData.productsDescription.trim() === '') {
      missingFields.push('описание продуктов');
    }
    if (!requestData.desiredDish || requestData.desiredDish.trim() === '') {
      missingFields.push('желаемое блюдо');
    }
    
    if (missingFields.length > 0) {
      showError(`Пожалуйста, заполните обязательные поля: ${missingFields.join(', ')}`);
      return;
    }

    try {
      await createCookingRequest(requestData);
      showSuccess('Запрос на приготовление отправлен! Повар свяжется с вами в ближайшее время.');
      
      // Очищаем форму
      e.target.reset();
    } catch (error) {
      console.error('Error creating cooking request:', error);
      showError('Ошибка отправки запроса');
    }
  };

  return (
    <div className="farmers-market">
      <div className="farmers-market-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={() => window.history.back()}
            style={{
              background: 'linear-gradient(135deg, #6c757d, #495057)',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(108, 117, 125, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.3)';
            }}
          >
            ← {t.common.back}
          </button>
          <h1>🏪 {t.farmersMarket}</h1>
        </div>
        <div className="market-tabs">
          <button 
            className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🛒 {t.localProducts}
          </button>
          <button 
            className={`tab-button ${activeTab === 'bringAndCook' ? 'active' : ''}`}
            onClick={() => setActiveTab('bringAndCook')}
          >
            👨‍🍳 {t.bringAndCook}
          </button>
        </div>
      </div>

      {activeTab === 'products' && (
        <div className="products-section">
          <div className="category-filters">
            <h3>{t.productCategories}:</h3>
            <div className="category-grid">
              {productCategories.map(category => (
                <button
                  key={category.id}
                  className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading">Загрузка продуктов...</div>
            ) : products.length === 0 ? (
              <div className="no-products">
                <h3>Продукты не найдены</h3>
                <p>В выбранной категории пока нет продуктов</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="product-placeholder">
                        {productCategories.find(cat => cat.id === product.category)?.icon || '📦'}
                      </div>
                    )}
                    {product.organic && <span className="organic-badge">🌱 Органический</span>}
                    {product.seasonal && <span className="seasonal-badge">🍂 Сезонный</span>}
                  </div>
                  
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-meta">
                      <div className="product-farmer">
                        <span className="farmer-label">Фермер:</span>
                        <span className="farmer-name">{product.farmer}</span>
                      </div>
                      <div className="product-origin">
                        <span className="origin-label">Происхождение:</span>
                        <span className="origin-text">{product.origin}</span>
                      </div>
                    </div>

                    <div className="product-rating">
                      <Rating 
                        rating={product.rating} 
                        readOnly={true} 
                        size="small" 
                        showValue={true}
                        showCount={true}
                        count={product.reviews}
                      />
                    </div>

                    <div className="product-price">
                      <span className="price">{product.price} ₽</span>
                      <span className="unit">за {product.unit}</span>
                    </div>

                    <div className="product-actions">
                      <button 
                        className="buy-button"
                        onClick={() => handleBuyProduct(product)}
                        disabled={!product.available}
                      >
                        🛒 {t.buyProduct}
                      </button>
                      <button 
                        className="cook-button"
                        onClick={() => handleRequestCooking(product)}
                      >
                        👨‍🍳 {t.requestCooking}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'bringAndCook' && (
        <div className="bring-and-cook-section">
          <div className="cooking-request-form">
            <h2>👨‍🍳 {t.bringYourProducts}</h2>
            <p>Опишите ваши продукты, и наши повара приготовят из них вкусные блюда!</p>
            
            <form className="cooking-form" onSubmit={handleSubmitCookingRequest}>
              <div className="form-group">
                <label htmlFor="products-description">{t.describeProducts}:</label>
                <textarea
                  id="products-description"
                  name="products-description"
                  placeholder="Например: 2 кг картофеля, 1 кг говядины, 500г лука..."
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="desired-dish">{t.desiredDish}:</label>
                <input
                  type="text"
                  id="desired-dish"
                  name="desired-dish"
                  placeholder="Например: борщ, плов, жаркое..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="special-instructions">{t.specialInstructions}:</label>
                <textarea
                  id="special-instructions"
                  name="special-instructions"
                  placeholder="Особые пожелания по приготовлению..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cooking-price">{t.cookingPrice}:</label>
                <input
                  type="number"
                  id="cooking-price"
                  name="cooking-price"
                  placeholder="Предлагаемая стоимость приготовления"
                  min="0"
                />
              </div>

              <button type="submit" className="submit-request-button">
                📝 {t.submitRequest}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmersMarket;
