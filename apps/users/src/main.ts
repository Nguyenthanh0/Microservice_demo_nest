import { NestFactory } from '@nestjs/core';
import { UsersModule } from './users.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(UsersModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // exceptionFactory: (validationErrors: ValidationError[] = []) => {
      //   return new BadRequestException(
      //     validationErrors.map((error) => ({
      //       [error.property]: error.constraints
      //         ? Object.values(error.constraints)[0]
      //         : '',
      //     })),
      //   );
      // },
    }),
  );
  app.setGlobalPrefix('api', { exclude: [''] });
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT'));
  console.log('app is running on port: ', port);

  await app.listen(port);
}
void bootstrap();
