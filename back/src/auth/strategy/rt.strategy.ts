import { BadRequestException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserAccount } from "src/typeorm";
import { Repository } from "typeorm";

export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        @InjectRepository(UserAccount)
		private accountRepo: Repository<UserAccount>,
        ) {
		super({
			secretOrKey: process.env.REFRESH_SECRET, /* config.get('REFRESH_SECRET') */
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            passReqToCallback: true
		});
    }

    async validate(req: Request, payload: any) {
        const refresh_token = req.get('authorization').replace('Bearer', '').trim();
        const account = await this.accountRepo.findOne({
            relations: { user: true },
            where: { 
                user: { id: payload.sub }
            }
        })
        if (!account) {
            throw new BadRequestException('Invalid credential');
        }
        req.body = { account, refresh_token };
        return req.body;
    }
} 