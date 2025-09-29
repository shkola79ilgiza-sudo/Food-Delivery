import { safeSetClientOrders } from './safeStorage';

// Утилита для создания тестовых данных
export const createTestOrders = () => {
  const testOrders = [
    {
      id: 'order-1757919842813',
      customerName: 'Иван Петров',
      customerEmail: 'ivan@example.com',
      customerPhone: '+7 (999) 123-45-67',
      status: 'pending_confirmation',
      chefId: 'chef-1',
      items: [
        {
          id: 'dish-1',
          name: 'Плов с бараниной',
          price: 450,
          quantity: 2,
          photo: '/api/placeholder/60/60',
          category: 'main'
        },
        {
          id: 'dish-2',
          name: 'Чак-чак',
          price: 200,
          quantity: 1,
          photo: '/api/placeholder/60/60',
          category: 'dessert'
        }
      ],
      itemsTotal: 1100,
      discount: 0,
      deliveryFee: 150,
      total: 1250,
      deliveryAddress: 'ул. Ленина, д. 10, кв. 5',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'order-1757919191085',
      customerName: 'Мария Сидорова',
      customerEmail: 'maria@example.com',
      customerPhone: '+7 (999) 234-56-78',
      status: 'reserved',
      chefId: 'chef-1',
      items: [
        {
          id: 'dish-3',
          name: 'Бешбармак',
          price: 380,
          quantity: 1,
          photo: '/api/placeholder/60/60',
          category: 'main'
        },
        {
          id: 'dish-4',
          name: 'Эчпочмак',
          price: 120,
          quantity: 3,
          photo: '/api/placeholder/60/60',
          category: 'bakery'
        }
      ],
      itemsTotal: 740,
      discount: 50,
      deliveryFee: 0,
      total: 690,
      deliveryAddress: 'пр. Победы, д. 25, кв. 12',
      paymentMethod: 'cash',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 часа назад
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 час назад
    },
    {
      id: 'order-1757911132133',
      customerName: 'Алексей Козлов',
      customerEmail: 'alex@example.com',
      customerPhone: '+7 (999) 345-67-89',
      status: 'delivered',
      chefId: 'chef-1',
      items: [
        {
          id: 'dish-5',
          name: 'Манты',
          price: 300,
          quantity: 2,
          photo: '/api/placeholder/60/60',
          category: 'main'
        },
        {
          id: 'dish-6',
          name: 'Баклажанная икра',
          price: 180,
          quantity: 1,
          photo: '/api/placeholder/60/60',
          category: 'appetizer'
        }
      ],
      itemsTotal: 780,
      discount: 0,
      deliveryFee: 100,
      total: 880,
      deliveryAddress: 'ул. Гагарина, д. 15, кв. 8',
      paymentMethod: 'card',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 день назад
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
      rating: 5, // Уже оценен
      ratedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 час назад
      reviews: [
        {
          id: 'review-1',
          text: 'Отличный плов! Очень вкусно и быстро доставили.',
          rating: 5,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          customerName: 'Алексей Козлов'
        }
      ]
    }
  ];

  // Сохраняем тестовые заказы в localStorage
  safeSetClientOrders(testOrders);
  
  return testOrders;
};

// Функция для очистки тестовых данных
export const clearTestData = () => {
  localStorage.removeItem('clientOrders');
  localStorage.removeItem('cart');
  localStorage.removeItem('favorites');
};

// Функция для добавления тестовых заказов к существующим
export const addTestOrders = () => {
  const existingOrders = JSON.parse(localStorage.getItem('clientOrders') || '[]');
  const testOrders = createTestOrders();
  const allOrders = [...existingOrders, ...testOrders];
  safeSetClientOrders(allOrders);
  return allOrders;
};
