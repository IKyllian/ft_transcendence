import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Delete, FileTypeValidator, ForbiddenException, Get, HttpStatus, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Req, Request, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { NotFoundError, Observable, of } from "rxjs";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/typeorm";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';
import { UserService } from "./user.service";
import { GetUser } from "src/utils/decorators";
import { SearchDto } from "./dto/search.dto";
import { Response } from "express";
import { join } from "path";
import { UserIdDto } from "src/chat/gateway/dto/user-id.dto";
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
	async getMe(@GetUser() user: User, @Req() req) {
		console.log('me')
		const match_history = await this.userService.getMatchHistory(user.id);
		return {
			user: user,
			match_history,
		}
	}

	// async resizeImage(file: Express.Multer.File) {
	// 	let buffer = await readFileAsyc(file.path);
	// 	await sharp(buffer)
	// 	.resize(300, 300)
	// 	.webp()
	// 	// .toFile(file.path)
	// 	console.log("buffer", buffer);
	// 	// readFileAsyc(file.path)
	// 	//   .then((b: Buffer) => {
	// 	// 	return sharp(b, { animated: true })
	// 	// 	  .resize(300, 300)
	// 	// 	  .webp()
	// 	// 	  .toFile(file.path);
	// 	//   })
	// 	//   .then(console.log)
	// 	//   .catch(() => {
	// 	// 	try {
	// 	// 		fs.unlinkSync(file.path);
	// 	// 		throw new BadRequestException("file type is not supported");
	// 	// 	} catch(err) {
	// 	// 		console.log(err);
	// 	// 	}
	// 	// 	return false;
	// 	//   });
	// 	  return true;
	// }

	@UseGuards(JwtGuard)
	@Post('avatar/upload')
	@UseInterceptors(FileInterceptor('image', avatarStorage))
	async uploadFile(@UploadedFile() file: Express.Multer.File, @GetUser() user: User, @Req() req: any) : Promise<Observable<Object>> {
		console.log(req.file);
		if (!file) {
			throw new BadRequestException("file does not match valid extention");
		}
		if (!await this.userService.resizeImage(file)) {
			throw new BadRequestException("Error occured in file upload");
		}

		// if (!file) return of ({error: 'file does not match valid extention'})
		this.userService.updateAvatar(user, file.filename);
		return of({imagePath: file.path})
	}

	@UseGuards(JwtGuard)
	@Get(':id/avatar')
	async serveAvatar(
		@Res() res: Response,
		@Param('id', ParseIntPipe) id: number,
		) {
			const user = await this.userService.findOneBy({ id });
			if (!user) {
				throw new NotFoundException('User not found');
			}
			console.log("avatar path ", user.avatar)
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