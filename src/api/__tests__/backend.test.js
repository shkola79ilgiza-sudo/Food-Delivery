/**
 * Unit тесты для API клиента
 * Проверяют корректность работы с backend
 */

import { authAPI, dishesAPI, ordersAPI } from '../backend';

// Мокируем fetch
global.fetch = jest.fn();

describe('Backend API Client', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  describe('Auth API', () => {
    test('should register user successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@test.com',
          firstName: 'Test',
          lastName: 'User'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authAPI.register({
        email: 'test@test.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/register',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.any(String)
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should login user successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        user: {
          id: '1',
          email: 'test@test.com'
        }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await authAPI.login('test@test.com', 'password123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/login',
        expect.objectContaining({
          method: 'POST'
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('should handle login error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' })
      });

      await expect(
        authAPI.login('test@test.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('Dishes API', () => {
    test('should fetch all dishes', async () => {
      const mockDishes = [
        { id: '1', name: 'Dish 1', price: 500 },
        { id: '2', name: 'Dish 2', price: 600 }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDishes
      });

      const result = await dishesAPI.getAll();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/dishes',
        expect.any(Object)
      );

      expect(result).toEqual(mockDishes);
    });

    test('should fetch dish by id', async () => {
      const mockDish = { id: '1', name: 'Dish 1', price: 500 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDish
      });

      const result = await dishesAPI.getById('1');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/dishes/1',
        expect.any(Object)
      );

      expect(result).toEqual(mockDish);
    });

    test('should create dish with auth token', async () => {
      localStorage.setItem('auth_token', 'test-token');

      const mockDish = { id: '1', name: 'New Dish', price: 500 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDish
      });

      const dishData = {
        name: 'New Dish',
        price: 500,
        category: 'MAIN_COURSE'
      };

      const result = await dishesAPI.create(dishData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/dishes',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );

      expect(result).toEqual(mockDish);
    });
  });

  describe('Orders API', () => {
    beforeEach(() => {
      localStorage.setItem('auth_token', 'test-token');
    });

    test('should create order', async () => {
      const mockOrder = {
        id: 'order-123',
        status: 'PENDING',
        totalPrice: 1000
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder
      });

      const orderData = {
        items: [
          { dishId: '1', quantity: 2, price: 500 }
        ],
        deliveryAddress: 'Test Address',
        contactPhone: '+79001234567'
      };

      const result = await ordersAPI.create(orderData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );

      expect(result).toEqual(mockOrder);
    });

    test('should fetch my orders', async () => {
      const mockOrders = [
        { id: 'order-1', status: 'PENDING' },
        { id: 'order-2', status: 'COMPLETED' }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrders
      });

      const result = await ordersAPI.getMyOrders();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders/my/orders',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );

      expect(result).toEqual(mockOrders);
    });

    test('should update order status', async () => {
      const mockOrder = {
        id: 'order-123',
        status: 'IN_PROGRESS'
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder
      });

      const result = await ordersAPI.updateStatus('order-123', 'IN_PROGRESS');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/orders/order-123/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'IN_PROGRESS' })
        })
      );

      expect(result).toEqual(mockOrder);
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        dishesAPI.getAll()
      ).rejects.toThrow('Network error');
    });

    test('should handle 401 unauthorized', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' })
      });

      await expect(
        ordersAPI.getMyOrders()
      ).rejects.toThrow('Unauthorized');
    });

    test('should handle 500 server error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' })
      });

      await expect(
        dishesAPI.getAll()
      ).rejects.toThrow('Internal server error');
    });
  });
});

