import { Column, Entity, PrimaryColumn } from "typeorm";

enum AchievementId {
	FIRST_WIN,
}

@Entity()
export class Achievement {
	@PrimaryColumn({ type: 'enum', enum: AchievementId })
	id: AchievementId;

	@Column()
	title: string;

	@Column()
	description: string;
}