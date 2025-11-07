import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, ORDERSTATUS } from './entities/order.schema';
import { Model } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { OrderGateway } from './order.gateway';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/createOrder.dto';

export interface OrderValue {
  orderId: string;
  userId: string;
  price: number;
  content: any[];
  paymentStatus: string;
}

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @Inject('KAFKA_SERVICE') private readonly KafkaClient: ClientKafka,
    private readonly orderGateway: OrderGateway,
  ) {}
  async onModuleInit() {
    await this.KafkaClient.connect();
    this.logger.debug('Kafka Client (Producer) connected in OrdersService');
  }

  async create(userId: string, data: CreateOrderDto) {
    const orderId = uuidv4().slice(0, 5);
    const order = await this.orderModel.create({
      orderId: orderId,
      userId: userId,
      price: data.price,
      content: data.content,
      orderStatus: ORDERSTATUS.CREATED,
    });

    this.KafkaClient.emit('order-created', {
      orderId: order.orderId,
      userId: order.userId,
      price: order.price,
      content: order.content,
      orderStatus: order.orderStatus,
    });

    this.logger.debug('order-created-event sent');
    return { message: 'Order created', order };
  }

  async handlePaymentProcessed(data: OrderValue) {
    console.log('nhận payment result :', data);

    const { orderId, paymentStatus } = data;
    const order = await this.orderModel.findOne({ orderId: orderId });
    if (!order) throw new Error('Order not found');
    if (paymentStatus === 'SUCCESS') {
      order.orderStatus = ORDERSTATUS.CONFIRMED;
      this.orderGateway.sendOrderStatus(
        order.orderId,
        order.orderStatus,
        order.userId,
      );
      this.logger.debug('order confirmed');
      await order.save();
      setTimeout(() => {
        order.orderStatus = ORDERSTATUS.DELIVERED;
        order.save().catch(() => {});
        this.orderGateway.sendOrderStatus(
          order.orderId,
          order.orderStatus,
          order.userId,
        );
        this.logger.debug('order delivered');
      }, 5000);
    } else {
      order.orderStatus = ORDERSTATUS.CANCELLED;
      await order.save();
      this.orderGateway.sendOrderStatus(
        order.orderId,
        order.orderStatus,
        order.userId,
      );
      this.logger.debug('order cancelled');
    }
  }
}
