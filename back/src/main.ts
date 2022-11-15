import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from './app.module';
import { ChannelService } from './chat/channel/channel.service';
import { ChannelUser, Channel, User, Statistic } from './typeorm';
import { UserService } from './user/user.service';
import { channelOption } from './utils/types/types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(5000);

  // const userService = await app.resolve(UserService);
  // const channelService = await app.resolve(ChannelService);

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

  // const channelUserRepo= await app.get<any, Repository<ChannelUser>>(getRepositoryToken(ChannelUser));
  // const channelRepo = await app.get<any, Repository<Channel>>(getRepositoryToken(Channel));
  // const user = { id: 18 }

  // const blueEloWon: number = Math.round(50 / (1 + Math.pow(10, 110 / 400)));
	// const blueEloLost: number = blueEloWon - 50;
  // const redEloWon: number = Math.abs(blueEloLost)
	// const redEloLost: number = redEloWon - 50;


  // console.log("blue won: " + blueEloWon + " lost: " + blueEloLost);
  // console.log("red won: " + redEloWon + " lost: " + redEloLost);
  // let playersId: number[] = [];
  // playersId.push(8);
  // // playersId.push(24)
  // // playersId.push(66656)
  // console.log(playersId)
  // const statRepo = app.get<any, Repository<Statistic>>(getRepositoryToken(Statistic));
  // statRepo.createQueryBuilder("stat")
	// 	.update()
	// 	.where("userId IN (:...ids)", { ids: playersId})
  //   // .where("userId = :ids", { ids: 8 })
	// 	.set({ match_lost: () => "match_lost + 1" })
	// 	.execute();
    // console.log(new Date().toLocaleString())

}
bootstrap();
