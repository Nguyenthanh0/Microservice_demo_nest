import { Body, Controller, Post, Req } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import * as ordersService from './orders.service';
import { CreateOrderDto } from './dto/createOrder.dto';

export interface JwtUser {
  _id: string;
  identifier: string;
  email: string;
  name: string;
  role: UserRole;
  sub: string;
}
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: ordersService.OrdersService) {}

  @Post('')
  handleOrderCreated(
    @Req() req: { user: JwtUser },
    @Body() content: CreateOrderDto,
  ) {
    const userId = req.user._id;
    return this.ordersService.create(userId, content);
  }

  @EventPattern('payment-processed')
  handlePaymentProcessed(@Payload() data: ordersService.OrderValue) {
    return this.ordersService.handlePaymentProcessed(data);
  }
}
//
