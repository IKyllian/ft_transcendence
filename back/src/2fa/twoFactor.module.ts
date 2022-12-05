import { Module } from "@nestjs/common";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { TwoFactorController } from "./twoFactor.controller";
import { TwoFactorService } from "./twoFactor.service";

@Module({
	imports: [UserModule, AuthModule],
	controllers: [TwoFactorController],
	providers: [TwoFactorService]
})
export class TwoFactorModule {}