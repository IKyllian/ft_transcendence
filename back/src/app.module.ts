import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';
import { GameModule } from './game/game.module';
import { MatchmakingModule } from './game/matchmaking/matchmaking.module';
import entities from './typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskScheduler } from './task-scheduling/task.module';
import { GlobalModule } from './utils/global/global.module';
import { TwoFactorModule } from './2fa/twoFactor.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    ChatModule,
	GameModule,
	GlobalModule,
    MatchmakingModule,
	TwoFactorModule,
    ConfigModule.forRoot({ isGlobal: true }),
    NotificationModule,
    TaskScheduler,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number.parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_NAME,
      entities,
      synchronize: true,
    //   dropSchema: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
