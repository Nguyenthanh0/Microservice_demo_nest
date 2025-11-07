import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  //
  const app = await NestFactory.create(OrdersModule);
  app.setGlobalPrefix('api');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'orders-consumer-group',
      },
    },
  });

  await app.startAllMicroservices();
  console.log(`Orders Consumer is listening...`);
  await app.listen(3001);
  console.log(`Orders Service (HTTP) running on: ${await app.getUrl()}`);
}
void bootstrap();
