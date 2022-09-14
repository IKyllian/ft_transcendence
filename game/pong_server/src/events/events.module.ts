import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { LobbyFactory } from '../lobby/lobby.factory';


@Module({
	providers: [EventsGateway, LobbyFactory],
})
export class EventsModule {}
