import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { JwtUser, OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/createOrder.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Req() req: { user: JwtUser }, @Body() content: CreateOrderDto) {
    const userId = req.user._id;
    return this.ordersService.create(userId, content);
  }
}
