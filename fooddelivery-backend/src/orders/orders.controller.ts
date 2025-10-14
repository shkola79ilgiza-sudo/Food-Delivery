import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /**
   * Создать новый заказ
   * Только для клиентов
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    console.log('🎯 Контроллер: Получен пользователь:', JSON.stringify(user, null, 2));
    
    // Получаем clientId из объекта пользователя
    const clientId = user.client?.id;
    console.log('🎯 Контроллер: Извлечен clientId:', clientId);
    
    if (!clientId) {
      throw new Error('Клиент не найден в токене');
    }
    return this.ordersService.createOrder(clientId, createOrderDto);
  }

  /**
   * Получить все заказы (с фильтрацией)
   * Доступно всем
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
    @Query('chefId') chefId?: string,
  ) {
    return this.ordersService.findAllOrders(
      parseInt(page, 10),
      parseInt(limit, 10),
      status as OrderStatus,
      clientId,
      chefId,
    );
  }

  /**
   * Получить заказ по ID
   * Доступно всем
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  /**
   * Получить мои заказы
   * Только для клиентов
   */
  @Get('my/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async findMyOrders(@CurrentUser() user: any) {
    const clientId = user.client?.id;
    if (!clientId) {
      throw new Error('Клиент не найден в токене');
    }
    return this.ordersService.findMyOrders(clientId);
  }

  /**
   * Получить заказы для повара
   * Только для поваров
   */
  @Get('chef/orders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF)
  @HttpCode(HttpStatus.OK)
  async findChefOrders(@CurrentUser() user: any) {
    const chefId = user.chef?.id;
    if (!chefId) {
      throw new Error('Повар не найден в токене');
    }
    return this.ordersService.findChefOrders(chefId);
  }

  /**
   * Обновить статус заказа
   * Только для поваров и админов
   */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CHEF, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
    @CurrentUser() user: any,
  ) {
    const userId = user.id;
    const userRole = user.role;
    return this.ordersService.updateOrderStatus(id, status, userId, userRole);
  }

  /**
   * Отменить заказ
   * Только для клиентов
   */
  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CLIENT)
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const clientId = user.client?.id;
    if (!clientId) {
      throw new Error('Клиент не найден в токене');
    }
    return this.ordersService.cancelOrder(id, clientId);
  }

  /**
   * Получить статистику заказов
   * Доступно всем
   */
  @Get('stats/overview')
  @HttpCode(HttpStatus.OK)
  async getStats() {
    return this.ordersService.getOrderStats();
  }
}
