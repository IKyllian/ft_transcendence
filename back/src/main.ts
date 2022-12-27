import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { join } from 'path';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { ChannelService } from './chat/channel/channel.service';
import { ChannelUser, Channel, User, Statistic } from './typeorm';
import { UserService } from './user/user.service';
import { channelOption } from './utils/types/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    exposedHeaders: 'Content-Disposition'
  });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);
}
bootstrap();
