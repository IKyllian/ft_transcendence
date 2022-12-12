import { Max, Min } from "class-validator";

export class SettingDto {
	@Min(10)
	@Max(200)
	up_down_border: number;

	@Min(10)
	@Max(180)
	player_back_advance: number;

	@Min(60)
	@Max(350)
	player_front_advance: number;

	@Min(10)
	@Max(200)
	paddle_size_h: number;

	@Min(5)
	@Max(25)
	paddle_speed: number;

	@Min(1)
	@Max(10)
	ball_start_speed: number;

	@Min(0.5)
	@Max(3)
	ball_acceleration: number;

	@Min(1)
	@Max(10)
	point_for_victory: number
}