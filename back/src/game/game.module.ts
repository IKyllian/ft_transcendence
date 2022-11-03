import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UserSessionManager } from './user.session';
import { GameGateway } from './game.gateway';
import { LobbyFactory } from './lobby/lobby.factory';

@Module({
	imports: [
		forwardRef(() => AuthModule),
		UserModule,
	],
	providers: [GameGateway, LobbyFactory, UserSessionManager],
	exports: [ UserSessionManager ]
})
export class GameModule {}
