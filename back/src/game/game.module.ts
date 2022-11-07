import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UserSessionManager } from './user.session';
import { GameGateway } from './game.gateway';
import { LobbyFactory } from './lobby/lobby.factory';
import { GlobalModule } from 'src/utils/global/global.module';

@Module({
	imports: [
		forwardRef(() => AuthModule),
		UserModule,
		GlobalModule,
	],
	providers: [GameGateway, LobbyFactory, UserSessionManager],
	exports: [ UserSessionManager, LobbyFactory ]
})
export class GameModule {}
