import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './entities/order.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@libs/common/passport/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { Partitioners } from 'kafkajs';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '@libs/common/passport/jwt.strategy';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_DOCKER_LINK'),
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [
                configService.get<string>('KAFKA_BROKER') ?? 'localhost:9092',
              ],
              connectionTimeout: 10000,
              retry: { retries: 5 },
            },
            producer: {
              createPartitioner: Partitioners.LegacyPartitioner,
            },
          },
        }),
      },
    ]),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: Number(configService.get<string>('ACCESS_TOKEN_EXPIRED')),
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    JwtStrategy,
    OrderGateway,
  ],
})
export class OrdersModule {}
//
