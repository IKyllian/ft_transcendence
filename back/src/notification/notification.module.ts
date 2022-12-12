import { ClassSerializerInterceptor, forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Notification } from 'src/typeorm';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { UserModule } from 'src/user/user.module';
import { ChannelModule } from 'src/chat/channel/channel.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalModule } from 'src/utils/global/global.module';

@Module({
  imports: [
    UserModule,
    forwardRef(() => ChannelModule),
    GlobalModule,
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
