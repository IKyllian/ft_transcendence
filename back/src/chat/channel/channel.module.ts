import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Channel, ChannelUser } from "src/typeorm";
import { ChannelController } from "./channel.controller";
import { ChannelService } from "./channel.service";

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Channel,
			ChannelUser,
		])
	],
	providers: [ChannelService],
	controllers: [ChannelController],
	exports: [ChannelService],

})
export class ChannelModule {}