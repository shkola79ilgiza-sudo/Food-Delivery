import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { OrderStatus, UserRole } from '@prisma/client';
import { DishesService } from '../dishes/dishes.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private dishesService: DishesService,
  ) {}

  /**
   * Создать новый заказ
   * Только для клиентов
   */
  async createOrder(clientId: string, createOrderDto: CreateOrderDto) {
    try {
      console.log('🔍 Создание заказа для клиента:', clientId);
      console.log('📝 Данные заказа:', JSON.stringify(createOrderDto, null, 2));
      
      // Проверяем, существует ли клиент
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
      });

      if (!client) {
        throw new NotFoundException('Клиент не найден');
      }

      // Проверяем, что все блюда существуют и доступны
      const dishIds = createOrderDto.items.map((item) => item.dishId);
      console.log('🍽️ Ищем блюда с ID:', dishIds);
      
      const dishes = await this.prisma.dish.findMany({
        where: {
          id: { in: dishIds },
          isAvailable: true,
          isArchived: false,
        },
      });
      
      console.log('✅ Найдено блюд:', dishes.length);

      if (dishes.length !== dishIds.length) {
        throw new BadRequestException('Одно или несколько блюд недоступны');
      }

      // Создаем карту блюд для быстрого доступа
      const dishMap = new Map(dishes.map((dish) => [dish.id, dish]));

      // Рассчитываем общую стоимость
      let subtotal = 0;
      const orderItems = createOrderDto.items.map((item) => {
        const dish = dishMap.get(item.dishId);
        if (!dish) {
          throw new BadRequestException(`Блюдо с ID ${item.dishId} не найдено`);
        }
        const itemPrice = dish.price * item.quantity;
        subtotal += itemPrice;

        return {
          dishId: item.dishId,
          quantity: item.quantity,
          price: dish.price,
          subtotal: itemPrice,
          notes: item.notes,
        };
      });

      // Генерируем номер заказа
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Определяем chefId из первого блюда
      const firstDish = dishMap.get(createOrderDto.items[0].dishId);
      if (!firstDish) {
        throw new BadRequestException(`Первое блюдо с ID ${createOrderDto.items[0].dishId} не найдено`);
      }
      const chefId = firstDish.chefId;

      // Рассчитываем комиссию платформы и общую сумму
      const platformFee = subtotal * 0.1; // 10% комиссия
      const totalAmount = subtotal + platformFee;

      // Создаем заказ с элементами
      console.log('💾 Создаем заказ с данными:', {
        clientId,
        chefId,
        orderNumber,
        subtotal,
        platformFee,
        totalAmount,
        orderItems
      });
      
      const order = await this.prisma.order.create({
        data: {
          clientId,
          chefId,
          orderNumber,
          status: OrderStatus.PENDING,
          deliveryMethod: 'DELIVERY', // По умолчанию доставка
          deliveryAddress: createOrderDto.deliveryAddress,
          paymentMethod: 'CASH', // По умолчанию наличные
          subtotal,
          platformFee,
          totalAmount,
          comment: createOrderDto.notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          client: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          chef: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                  email: true,
                },
              },
            },
          },
          items: {
            include: {
              dish: true,
            },
          },
        },
      });

      // Обновляем счетчики у блюд и повара
      console.log('📊 Обновляем счетчики...');
      
      await this.prisma.dish.updateMany({
        where: { id: { in: dishIds } },
        data: { ordersCount: { increment: 1 } },
      });

      await this.prisma.chef.update({
        where: { id: chefId },
        data: { totalOrders: { increment: 1 } },
      });

      console.log('✅ Заказ успешно создан:', order.id);
      return order;
    } catch (error) {
      console.error('❌ Ошибка при создании заказа:', error);
      throw error;
    }
  }

  /**
   * Получить все заказы (с фильтрацией)
   * Доступно всем
   */
  async findAllOrders(
    page = 1,
    limit = 10,
    status?: OrderStatus,
    clientId?: string,
    chefId?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) {
      where.status = status;
    }
    if (clientId) {
      where.clientId = clientId;
    }
    if (chefId) {
      // Находим заказы, где есть блюда от конкретного повара
      where.items = {
        some: {
          dish: {
            chefId: chefId,
          },
        },
      };
    }

    const orders = await this.prisma.order.findMany({
      where,
      skip,
      take: limit,
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: {
                chef: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = await this.prisma.order.count({ where });

    return {
      data: orders,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  /**
   * Получить заказ по ID
   * Доступно всем
   */
  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: {
                chef: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    return order;
  }

  /**
   * Получить заказы клиента (мои заказы)
   * Только для клиентов
   */
  async findMyOrders(clientId: string) {
    const orders = await this.prisma.order.findMany({
      where: { clientId },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: {
                chef: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  /**
   * Получить заказы для повара
   * Только для поваров
   */
  async findChefOrders(chefId: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        items: {
          some: {
            dish: {
              chefId: chefId,
            },
          },
        },
      },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: {
                chef: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  /**
   * Обновить статус заказа
   * Только для поваров и админов
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    userId: string,
    userRole: UserRole,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            dish: {
              select: {
                chefId: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${orderId} не найден`);
    }

    // Проверяем права доступа
    if (userRole === UserRole.CHEF) {
      // Повар может обновлять только заказы со своими блюдами
      const chefDishes = order.items.some(
        (item) => item.dish.chefId === userId,
      );
      if (!chefDishes) {
        throw new ForbiddenException(
          'Вы можете обновлять только заказы со своими блюдами',
        );
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: {
                chef: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return updatedOrder;
  }

  /**
   * Отменить заказ
   * Только для клиентов (владельцев заказа)
   */
  async cancelOrder(orderId: string, clientId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${orderId} не найден`);
    }

    if (order.clientId !== clientId) {
      throw new ForbiddenException('У вас нет прав для отмены этого заказа');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Заказ уже отменен');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Нельзя отменить доставленный заказ');
    }

    const cancelledOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
      include: {
        client: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        items: {
          include: {
            dish: {
              include: {
                chef: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return cancelledOrder;
  }

  /**
   * Получить статистику заказов
   * Доступно всем
   */
  async getOrderStats() {
    const totalOrders = await this.prisma.order.count();
    const pendingOrders = await this.prisma.order.count({
      where: { status: OrderStatus.PENDING },
    });
    const confirmedOrders = await this.prisma.order.count({
      where: { status: OrderStatus.CONFIRMED },
    });
    const preparingOrders = await this.prisma.order.count({
      where: { status: OrderStatus.PREPARING },
    });
    const readyOrders = await this.prisma.order.count({
      where: { status: OrderStatus.READY },
    });
    const deliveredOrders = await this.prisma.order.count({
      where: { status: OrderStatus.DELIVERED },
    });
    const cancelledOrders = await this.prisma.order.count({
      where: { status: OrderStatus.CANCELLED },
    });

    return {
      total: totalOrders,
      pending: pendingOrders,
      confirmed: confirmedOrders,
      preparing: preparingOrders,
      ready: readyOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    };
  }
}