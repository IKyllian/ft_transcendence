import { GameType } from "src/utils/types/game.types";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class MatchResult {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	game_type: GameType;

	@Column()
	blue_team_goals: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	blue_team_player1: User;

	@ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
	blue_team_player2?: User;

	@Column()
	red_team_goals: number;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	red_team_player1: User;

	@ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
	red_team_player2?: User;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at: Date;
}