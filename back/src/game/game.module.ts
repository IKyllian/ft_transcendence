import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { GameGateway } from './game.gateway';
import { LobbyFactory } from './lobby/lobby.factory';
import { GlobalModule } from 'src/utils/global/global.module';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchResult, Statistic, User } from 'src/typeorm';

@Module({
	imports: [
		forwardRef(() => AuthModule),
		UserModule,
		GlobalModule,
		TypeOrmModule.forFeature([
			User,
			Statistic,
			MatchResult,
		])
	],
	providers: [
		GameGateway,
		LobbyFactory,
		GameService,
	],
	controllers: [GameController],
	exports: [ LobbyFactory ]
})
export class GameModule {}
