import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, ORDERSTATUS } from './entities/order.schema';
import { Model } from 'mongoose';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Kafka } from 'kafkajs';
import { OrderGateway } from './order.gateway';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
}
export interface JwtUser {
  _id: string;
  identifier: string;
  email: string;
  name: string;
  role: UserRole;
  sub: string;
}
interface PaymentValue {
  orderId: string;
  userId: string;
  paymentStatus: string;
}

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);
  private readonly kafka = new Kafka({
    clientId: 'orders-consumer-raw',
    brokers: ['localhost:9092'], // 💡 Dùng địa chỉ đã hoạt động
  });
  // tạo consumer thủ công
  private readonly consumer = this.kafka.consumer({
    groupId: 'orders-consumer-final',
  });
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @Inject('KAFKA_SERVICE') private readonly KafkaClient: ClientKafka,
    private readonly orderGateway: OrderGateway,
  ) {}
  async onModuleInit() {
    await this.KafkaClient.connect();
    this.logger.debug('Kafka Client (Producer) connected in OrdersService');

    // connect consumer
    await this.consumer.connect();
    // sub topic/event
    await this.consumer.subscribe({
      topic: 'payment-processed',
      fromBeginning: true,
    });

    // nhận data từ kafka
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) {
          this.logger.warn('Received empty Kafka message value', {
            topic,
            partition,
          });
          return;
        }
        const paymentValue = JSON.parse(
          message.value.toString(),
        ) as PaymentValue;
        await this.handlePaymentProcessed(paymentValue);
      },
    });
    this.logger.debug(
      'Raw Kafka Consumer is running and subscribed to payment-processed',
    );
  }

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const orderId = uuidv4().slice(0, 5);
    const order = await this.orderModel.create({
      orderId: orderId,
      userId: userId,
      price: createOrderDto.price,
      content: createOrderDto.content,
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
    return order;
  }

  async handlePaymentProcessed(@Payload() data: PaymentValue) {
    console.log('nhận message thành công :', data);

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
