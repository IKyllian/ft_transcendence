import { Body, Controller, ForbiddenException, Get, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Observable, of } from "rxjs";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/entities/user.entity";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';
import { UserService } from "./user.service";

export const avatarStorage = {
	storage: diskStorage({
		destination: './uploads/avatars',
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
	getMe(@GetUser() user: User) {
		return user;
	}

	@UseGuards(JwtGuard)
	@Post('upload')
	@UseInterceptors(FileInterceptor('image', avatarStorage))
	uploadFile(@UploadedFile() file, @Request() req) : Observable<Object> {
		console.log(req.user);
		console.log(file);
		if (!file)
			throw new ForbiddenException('Image is missing')
		if (file.mimetype != 'image/png' && file.mimetype != 'image/jpeg' && file.mimetype != 'image/jpg')
			throw new ForbiddenException('Invalid file extension ' + file.mimetype)
		this.userService.updateAvatar(req.user, file.path);
		return of({imagePath: file.path})
	}

	@UseGuards(JwtGuard)
	@Patch('edit-username')
	editUser(@GetUser() user: User, @Body() body) {
		console.log(body);
		return this.userService.editUsername(user, body.username);
	}
}