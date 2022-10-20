import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { LobbyFactory } from './lobby/lobby.factory';


@Module({
	providers: [GameGateway, LobbyFactory],
})
export class GameModule {}
