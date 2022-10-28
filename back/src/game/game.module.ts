import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GameUserSessionManager } from './game-user.session';
import { GameGateway } from './game.gateway';
import { LobbyFactory } from './lobby/lobby.factory';


@Module({
	imports: [
		forwardRef(() => AuthModule),
	],
	providers: [GameGateway, LobbyFactory, GameUserSessionManager],
})
export class GameModule {}
