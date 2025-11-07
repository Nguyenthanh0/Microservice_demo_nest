import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientKafka, Payload } from '@nestjs/microservices';

export interface OrderValue {
  orderId: string;
  userId: string;
  price: number;
  content: any[];
  orderStatus: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject('KAFKA_SERVICE') private readonly KafkaClient: ClientKafka,
  ) {}
  async onModuleInit() {
    await this.KafkaClient.connect();
    this.logger.debug('Kafka Client (Producer) connected in OrdersService');
  }

  async handleOrderCreated(order: OrderValue) {
    console.log('Nhận order:', order);

    const isSuccess = Math.random() > 0.5;
    const paymentStatus = isSuccess ? 'SUCCESS' : 'FAILED';
    console.log(paymentStatus);

    this.KafkaClient.emit('payment-processed', {
      orderId: order.orderId,
      userId: order.userId,
      paymentStatus,
    });
    this.logger.debug(`payment result sent, result: ${paymentStatus}`);
  }

  handleTest(@Payload() data: any) {
    this.logger.debug(
      `Test event received in PaymentService: ${JSON.stringify(data)}`,
    );
    console.log('consumer đã hoạt động');
  }
}
