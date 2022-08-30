import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   await app.listen(4141);
// }

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(__dirname, '..', 'static'));
  await app.listen(4141);
}

bootstrap();
