import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { Kafka } from 'kafkajs';

interface OrderValue {
  orderId: string;
  userId: string;
  price: number;
  content: any[];
  orderStatus: string;
}

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @Inject('KAFKA_SERVICE') private readonly KafkaClient: ClientKafka,
  ) {}
  // Khởi tạo Consumer trực tiếp
  private readonly kafka = new Kafka({
    clientId: 'payment-consumer-raw',
    brokers: ['localhost:9092'], // 💡 Dùng địa chỉ đã hoạt động
  });
  private readonly consumer = this.kafka.consumer({
    groupId: 'payments-consumer-raw',
  });

  // ... constructor ...

  async onModuleInit() {
    // 1. Kết nối Producer Client Kafka (để emit payment-processed)
    await this.KafkaClient.connect();
    this.logger.debug('Kafka Client (Producer) connected in PaymentService');

    // 2. Kết nối và Chạy Consumer KafkaJS
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'order-created',
      fromBeginning: true,
    });

    // 3. Xử lý message nhận được
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) {
          this.logger.warn(
            'Received message with null or empty value, skipping',
          );
          return;
        }
        const order = JSON.parse(message.value.toString()) as OrderValue;

        await this.handleOrderCreated(order);
      },
    });
    this.logger.log(
      'Raw Kafka Consumer is running and subscribed to test-created',
    );
  }

  async handleOrderCreated(@Payload() order: OrderValue) {
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
//
