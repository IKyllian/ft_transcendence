import { forwardRef, Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { PartyJoinedSessionManager } from "./party/party.session";
import { PartyService } from "./party/party.service";
import { QueueService } from "./queue/queue.service";
import { MatchmakingGateway } from "./matchmaking.gateway";
import { GameModule } from "../game.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
	imports: [
		forwardRef(() => AuthModule),
		UserModule,
		GameModule,
	],
	providers: [
		PartyService,
		PartyJoinedSessionManager,
		QueueService,
		MatchmakingGateway 
	],
	exports: [ PartyService, QueueService ]
})
export class MatchmakingModule {}