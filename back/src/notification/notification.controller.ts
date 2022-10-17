import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/typeorm';
import { GetUser } from 'src/utils/decorators';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
	constructor(private notifService: NotificationService) {}

	@UseGuards(JwtGuard)
	@Get()
	async getNotification(
		@GetUser() user: User,
	) {
		return await this.notifService.getNotification(user);
	}

	@UseGuards(JwtGuard)
	@Post()
	async create(
		@GetUser() user: User,
		@Body() dto: any,
	) {
		return await this.notifService.createChanInviteNotif(user, dto)
	}
}
