import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { TwoFactorController } from "./twoFactor.controller";
import { TwoFactorService } from "./TwoFactor.service";

@Module({
	imports: [UserModule],
	controllers: [TwoFactorController],
	providers: [TwoFactorService]
})
export class TwoFactorModule {}