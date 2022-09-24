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
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

	constructor(private userService: UserService) {}

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

	@UseGuards(JwtGuard)
	@Post('avatar/upload')
	@UseInterceptors(FileInterceptor('image', avatarStorage))
	uploadFile(@UploadedFile() file, @GetUser() user: User) : Observable<Object> {
		console.log(file);
		if (!file)
			throw new ForbiddenException('Image is missing')
		this.userService.updateAvatar(user, file.path);
		return of({imagePath: file.path})
	}

	@UseGuards(JwtGuard)
	@Patch('edit-username')
	editUser(@GetUser() user: User, @Body() body) {
		console.log('user to edit', user);
		return this.userService.editUsername(user, body.username);
	}

	@UseGuards(JwtGuard)
	@Get()
	getUsers() {
		return this.userService.getUsers();
	}

 	@UseGuards(JwtGuard)
	@Get(':id')
	getUserById(@Param('id') id: number) {
		return this.userService.findById(id);
	}

	@UseGuards(JwtGuard)
	@Get(':username')
	getUserbyName(@Param('username') username: string) {
		return this.userService.findByName(username);
	}

	//test
	@Delete(':id')
	async deleteUser(@Param('id', ParseIntPipe) id: number) {
		console.log('deleting user')
		return await User.delete(id);
	}
}