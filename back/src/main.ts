import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ChannelService } from './chat/channel/channel.service';
import { UserService } from './user/user.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(5000);

  const userService = await app.resolve(UserService);
  const channelService = await app.resolve(ChannelService);

  // let user = await userService.create({ username: 'chak12313' });
  // let channel = await channelService.create(user, {
  //   name: 'testou',
  //   option: channelOption.PUBLIC
  //   // option: 'private'
  // })
  // let user2 = await userService.create({ username: 'kiki' });
  // let channel = await channelService.joinChannel({
  //   name: 'general',
  //   option: 'public',
  // },
  // user
  // );
  // await channelService.addUser(user, channel)
  // await channelService.addUser(user, channel)
  // const channel = await channelService.findbyName('general');
  // console.log(channel);
  // let userchan = await channelService.addUser(user2, channel);
  // console.log(channel);
  // channel = await channelService.addUser(user, channel);
  // let user2 = await userService.create({ username: 'chaki' });
  // channel = await channelService.addUser(channel, user)
  // const channels = await channelService.getChannels(user2.id);
  // console.log(channels);
}
bootstrap();
