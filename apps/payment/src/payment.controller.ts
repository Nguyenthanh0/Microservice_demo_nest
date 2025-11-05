import { Controller, Get, Inject } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ClientKafka } from '@nestjs/microservices';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('KAFKA_SERVICE') private readonly KafkaClient: ClientKafka,
  ) {}
  // @Get('test-event')
  // TestEvent() {
  //   const testOrder = {
  //     orderId: 'Test-001',
  //     userId: 'user-test',
  //     price: 100,
  //     content: [{ item: 'A' }],
  //     orderStatus: 'TEST_CREATED',
  //   };

  //   this.KafkaClient.emit('test-created', testOrder);
  //   console.log('Test event "test-created", emitted to PaymentService.');

  //   return { status: 'Test event sent to Kafka. Check logs for consumption.' };
  // }
}
