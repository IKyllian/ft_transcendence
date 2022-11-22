import { Body, ClassSerializerInterceptor, Controller, Delete, FileTypeValidator, ForbiddenException, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Observable, of } from "rxjs";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { Statistic, User } from "src/typeorm";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';
import { UserService } from "./user.service";
import { GetUser } from "src/utils/decorators";
import { SearchDto } from "./dto/search.dto";
import { Response } from "express";
import { join } from "path";

export const avatarStorage = {
	storage: diskStorage({
		destination: './uploads/',
		filename: (_req, file, cb) => {
			const name: string = uuidv4();
			const extension: string = path.extname(file.originalname);

			cb(null, `${name}${extension}`)
		},
	}),
	fileFilter: (_req, file, cb) => {
		if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
			cb(null, true);
		} else {
			cb(null, false)
		}
	}
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
	uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: User, @Req() req: any) : Observable<Object> {
		// TODO use file-type to check magic number?
		console.log(req.file);

		if (!file) return of ({error: 'file does not match valid extention'})
		this.userService.updateAvatar(user, file.filename);
		return of({imagePath: file.path})
	}

	@UseGuards(JwtGuard)
	@Get('avatar')
	serveAvatar(@GetUser() user: User, @Res() res: Response) {
		console.log("avatar path ", user.avatar)
		if (!user.avatar) { return; }
		// res.sendFile(user.avatar, { root: 'uploads' });
		return of(res.sendFile(join(process.cwd(), 'uploads/' + user.avatar)));
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