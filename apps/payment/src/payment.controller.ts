import { Controller, Inject } from '@nestjs/common';
import * as paymentService_1 from './payment.service';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: paymentService_1.PaymentService,
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

  @EventPattern('order-created')
  handleOrderCreated(@Payload() order: paymentService_1.OrderValue) {
    return this.paymentService.handleOrderCreated(order);
  }
}
