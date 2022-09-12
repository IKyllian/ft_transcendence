import { Controller, Get, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Observable, of } from "rxjs";
import { GetUser } from "src/auth/decorator/get-user.decorator";
import { JwtGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/entities/user.entity";
import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import * as path from 'path';

export const avatarStorage = {
	storage: diskStorage({
		destination: process.cwd() + '/uploads/avatars',
		filename: (_req, file, cb) => {
			const name: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
			const extension: string = path.parse(file.originalname).ext;

			cb(null, `${name}${extension}`)
		}
	})
}

@Controller('users')
export class UserController {

	@UseGuards(JwtGuard)
	@Get('me')
	getMe(@GetUser() user: User) {
		return user;
	}

	@UseGuards(JwtGuard)
	@Post('upload')
	@UseInterceptors(FileInterceptor('file', avatarStorage))
	uploadFile(@UploadedFile() file, @Request() req) : Observable<Object> {
		console.log(req);
		console.log(file);
		return of({imagePath: file.path})
	}
}