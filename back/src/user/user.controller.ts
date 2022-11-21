import { Body, ClassSerializerInterceptor, Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Observable, of } from "rxjs";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';
import { UserService } from "./user.service";
import { GetUser } from "src/utils/decorators";
import { SearchDto } from "./dto/search.dto";

export const avatarStorage = {
	storage: diskStorage({
		destination: './uploads/',
		filename: (_req, file, cb) => {
			const name: string = uuidv4();
			const extension: string = path.parse(file.originalname).ext;

			cb(null, `${name}${extension}`)
		}
	})
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
			user,
			match_history,
		}
	}

	@UseGuards(JwtGuard)
	@Post('avatar/upload')
	@UseInterceptors(FileInterceptor('image', avatarStorage))
	uploadFile(@UploadedFile() file, @GetUser() user: User) : Observable<Object> {
		console.log(file);
		if (!file)
			throw new ForbiddenException('Image is missing')
		if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg' && file.mimetype != 'image/jpg')
			throw new ForbiddenException('Invalid file extension ' + file.mimetype)
		this.userService.updateAvatar(user, file.path);
		return of({imagePath: file.path})
	}

	@UseGuards(JwtGuard)
	@Patch('edit-username')
	//TODO validation body
	async editUser(@GetUser() user: User, @Body() body) {
		return await this.userService.editUsername(user, body.username);
	}

	@UseGuards(JwtGuard)
	@Get()
	getUsers() {
		return this.userService.getUsers();
	}

	// test
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
		return await this.userService.getUserInfo(user, user2);
	}

	//probably going to be socked sided
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

	//test
	// @UseGuards(JwtGuard)
	@Delete(':id')
	deleteUser(@Param('id', ParseIntPipe) id: number) {
		this.userService.deleteUser(id);
		console.log('deleting user')
	}
}