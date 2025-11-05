import { NestFactory } from '@nestjs/core';
import { PaymentModule } from './payment.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule);
  const configService = app.get(ConfigService);
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport: Transport.KAFKA,
  //   options: {
  //     client: {
  //       brokers: ['localhost:9092'],
  //       clientId: 'payment-service',
  //       logLevel: 1,
  //     },
  //     consumer: {
  //       groupId: 'payments-consumer-v4',
  //     },
  //     subscribe: {
  //       fromBeginning: true, // <-- ✨ THÊM DÒNG NÀY
  //     },
  //   },
  // });
  // await app.startAllMicroservices();
  // console.log('🚀 Kafka microservice started!');
  app.setGlobalPrefix('api', { exclude: [''] });
  const port = configService.get<string>('PAYMENT_SERVICE_PORT') ?? 3002;
  await app.listen(port);
  console.log('app is running on port: ', port);
}
void bootstrap();
