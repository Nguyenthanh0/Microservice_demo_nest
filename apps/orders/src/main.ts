import { NestFactory } from '@nestjs/core';
import { OrdersModule } from './orders.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(OrdersModule);
  const configService = app.get(ConfigService);
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: [
  //         configService.get<string>('KAFKA_BROKER') ?? 'localhost:9092',
  //       ],
  //       connectionTimeout: 10000,
  //       retry: { retries: 5 },
  //     },
  //     consumer: {
  //       groupId: 'orders-consumer',
  //     },
  //   },
  // });
  // await app.startAllMicroservices();
  app.setGlobalPrefix('api', { exclude: [''] });
  const port = configService.get<string>('ORDERS_SERVICE_PORT') ?? 3001;
  await app.listen(port);
  console.log('app is running on port: ', port);
}
void bootstrap();
