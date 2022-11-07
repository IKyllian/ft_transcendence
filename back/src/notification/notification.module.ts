import { ClassSerializerInterceptor, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Notification } from 'src/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UserModule } from 'src/user/user.module';
import { ChannelModule } from 'src/chat/channel/channel.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TaskScheduler } from 'src/task-scheduling/task.module';

@Module({
  imports: [
    UserModule,
    // forwardRef(() =>TaskScheduler),
    forwardRef(() => ChannelModule),
    TypeOrmModule.forFeature([ Notification, Channel ]),
  ],

  providers: [NotificationService, 
  {
		provide: APP_INTERCEPTOR,
		useClass: ClassSerializerInterceptor,
	}],

  exports: [NotificationService],

  controllers: [NotificationController],
})
export class NotificationModule {}
