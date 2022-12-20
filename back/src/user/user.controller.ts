import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';
import { UserService } from "./user.service";
import { GetUser } from "src/utils/decorators";
import { SearchDto } from "./dto/search.dto";
import { Request, Response } from "express";
import { EditUsernameDto } from "./dto/edit-username.dto";
import { EditPasswordDto } from "./dto/edit-password.dto";

export const avatarStorage = {
	limits: {
		files: 1,
		fileSize: 10485760, // 10 mo
	},
	storage: diskStorage({
		destination: './uploads/',
		filename: (_req, file, cb) => {
			const name: string = uuidv4();
			const extension: string = path.extname(file.originalname);

			cb(null, `${name}${extension}`)
		},
	}),
	fileFilter: (_req, file, cb) => {
		if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
			cb(null, true);
		} else {
			cb(null, false)
		}
	},
}

@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@UseGuards(JwtGuard)
	@Get('me')
	async getMe(@GetUser() user: User) {
		console.log('me')
		const match_history = await this.userService.getMatchHistory(user.id);
		return {
			user: user,
			match_history,
		}
	}

	@UseGuards(JwtGuard)
	@Post('avatar/upload')
	@UseInterceptors(FileInterceptor('image', avatarStorage))
	async uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: User, @Res() res: Response, @Req() req: Request) {
		if (!file) {
			throw new BadRequestException("file does not match valid extention");
		}
		
		if (!await this.userService.resizeImage(file)) {
			throw new BadRequestException("Error occured in file upload");
		}
		await this.userService.updateAvatar(user, file.filename);
		res.sendFile(file.filename, { root: 'uploads', headers: {"Content-Disposition": file.filename}});
	}

	@UseGuards(JwtGuard)
	@Get(':id/avatar')
	async getAvatar(
		@Res() res: Response,
		@Param('id', ParseIntPipe) id: number,
		) {
			const user = await this.userService.findOneBy({ id });
			if (!user) {
				throw new NotFoundException('User not found');
			}
			if (!user.avatar) { return undefined; }
			res.sendFile(user.avatar, { root: 'uploads', headers: {"Content-Disposition": user.avatar}});
	}

	@UseGuards(JwtGuard)
	@Patch('edit-username')
	async editUser(@GetUser() user: User, @Body() data: EditUsernameDto) {
		return await this.userService.editUsername(user, data.username);
	}

	@UseGuards(JwtGuard)
	@Patch('edit-password')
	async editPassword(@GetUser() user: User, @Body() data: EditPasswordDto) {
		return await this.userService.editPassword(user, data);
	}

	@UseGuards(JwtGuard)
	@Get()
	getUsers() {
		return this.userService.getUsers();
	}

	// test TODO del?
 	// @UseGuards(JwtGuard)
	@Get(':id')
	async getUserById(@Param('id', ParseIntPipe) id: number) {
		console.log('get user by id route')
		return await this.userService.findOne({
			relations: {
				statistic: true,
			},
			where: { id },
		});
	}

	@UseGuards(JwtGuard)
	@Get('name/:username')
	async getUserbyName(
		@Param('username') username: string,
		@GetUser() user: User,
	) {
		const user2 = await this.userService.findOne({
			relations: {
				statistic: true,
			},
			where: { username },
		});
		if (!user2) {
			throw new BadRequestException('User not found');
		}
		return await this.userService.getUserInfo(user, user2);
	}

	@Post(':id/block')
	@UseGuards(JwtGuard)
	async blockUser(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: User,
	) {
		return await this.userService.blockUser(user, id);
	}

	@Post(':id/deblock')
	@UseGuards(JwtGuard)
	async deblockUser(
		@Param('id', ParseIntPipe) id: number,
		@GetUser() user: User,
	) {
		return await this.userService.deblockUser(user, id);
	}

	@Post('search')
	@UseGuards(JwtGuard)
	async searchUser(
		@GetUser() user: User,
		@Body() searchDto: SearchDto,
	) {
		return await this.userService.search(user, searchDto);
	}
}