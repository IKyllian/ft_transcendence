import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchResult, Statistic, User } from "src/typeorm";
import { GlobalService } from "src/utils/global/global.service";
import { EndResult, GameType, Leaderboard, ScoreBoard, TeamSide } from "src/utils/types/game.types";
import { Repository } from "typeorm";
import { Player } from "./player";

@Injectable()
export class GameService {
	constructor(
		private globalService: GlobalService,

		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statRepo: Repository<Statistic>,
		@InjectRepository(MatchResult)
		private matchRepo: Repository<MatchResult>,
	) {}

	async isPlaying(userId: number): Promise<boolean> {
		return (await this.globalService.game_server.in(`user-in-game-${userId}`).fetchSockets()).length > 0 ? true : false;
	}

	saveNewElo(playersId: number[], eloToAdd: number, game_type: GameType) {
		if (game_type === GameType.Singles) {
			this.userRepo.createQueryBuilder("user")
			.update()
			.whereInIds(playersId)
			.set({ singles_elo: () => "singles_elo + :elo" })
			.setParameter("elo", eloToAdd)
			.execute();
		} else {
			this.userRepo.createQueryBuilder("user")
			.update()
			.whereInIds(playersId)
			.set({ doubles_elo: () => "doubles_elo + :elo" })
			.setParameter("elo", eloToAdd)
			.execute();
		}
	}

	addWin(playersId: number[], game_type: GameType) {
		if (game_type === GameType.Singles) {
			this.statRepo.createQueryBuilder("stat")
			.update()
			.where("userId IN (:...ids)", { ids: playersId })
			.set({ singles_match_won: () => "singles_match_won + 1" })
			.execute();
		} else {
			this.statRepo.createQueryBuilder("stat")
			.update()
			.where("userId IN (:...ids)", { ids: playersId })
			.set({ doubles_match_won: () => "doubles_match_won + 1" })
			.execute();
		}
	}

	addLose(playersId: number[], game_type: GameType) {
		if (game_type === GameType.Singles) {
			this.statRepo.createQueryBuilder("stat")
			.update()
			.where("userId IN (:...ids)", { ids: playersId })
			.set({ singles_match_lost: () => "singles_match_lost + 1" })
			.execute();
		} else {
			this.statRepo.createQueryBuilder("stat")
			.update()
			.where("userId IN (:...ids)", { ids: playersId })
			.set({ doubles_match_lost: () => "doubles_match_lost + 1" })
		}
	}

	eloAttribution(players: Player[], result: EndResult, game_type: GameType) {
		// BLUE = A / RED = B
		let blueTeamAverage: number = 0;
		let blueTeamIds: number[] = [];
		let redTeamAverage: number = 0;
		let redTeamIds: number[] = [];
		
		players.forEach((player) => {
			if (player.team === TeamSide.BLUE) {
				blueTeamAverage += game_type === GameType.Singles ? player.user.singles_elo : player.user.doubles_elo;
				blueTeamIds.push(player.user.id);
			} else {
				redTeamAverage += game_type === GameType.Singles ? player.user.singles_elo : player.user.doubles_elo;
				redTeamIds.push(player.user.id);
			}
		});
		blueTeamAverage /= blueTeamIds.length;
		redTeamAverage /= redTeamIds.length;

		const blueEloWon: number = Math.round(50 / (1 + Math.pow(10, (blueTeamAverage - redTeamAverage) / 400)));
		const blueEloLost: number = blueEloWon - 50;
		const redEloWon: number = Math.abs(blueEloLost);
		const redEloLost: number = redEloWon - 50;

		if (result === EndResult.TeamBlue_Win) {
			this.saveNewElo(blueTeamIds, blueEloWon, game_type);
			this.addWin(blueTeamIds, game_type);
			this.saveNewElo(redTeamIds, redEloLost, game_type);
			this.addLose(redTeamIds, game_type);
		} else {
			this.saveNewElo(redTeamIds, redEloWon, game_type);
			this.addWin(redTeamIds, game_type);
			this.saveNewElo(blueTeamIds, blueEloLost, game_type);
			this.addLose(blueTeamIds, game_type);
		}
	}

	saveMatch(blueTeam: User[], redTeam: User[], game_type: GameType, score: ScoreBoard, game_id: string) {
		let match: MatchResult = this.matchRepo.create({
			game_type,
			blue_team_goals: score.TeamBlue,
			blue_team_player1: blueTeam[0],
			red_team_goals: score.TeamRed,
			red_team_player1: redTeam[0],
			game_id: game_id
		});
		if (game_type === GameType.Doubles) {
			match.blue_team_player2 = blueTeam[1],
			match.red_team_player2 = redTeam[1];
		}
		return this.matchRepo.save(match);
	}

	async getSinglesLeaderboard(user: User, page: number): Promise<Leaderboard> {
		const nb_of_users: number = await this.userRepo.createQueryBuilder('user').getCount();
		const users: User[] = await this.userRepo.createQueryBuilder('user')
		.leftJoinAndSelect('user.statistic', 'stats')
		.orderBy("user.singles_elo", "DESC")
		.skip(page * 10)
		.take(10)
		.getMany();

		return {
			nb_of_users,
			users,
		}
	}

	async getDoublesLeaderboard(page: number): Promise<Leaderboard> {
		const nb_of_users: number = await this.userRepo.createQueryBuilder('user').getCount()
		
		const users: User[] = await this.userRepo.createQueryBuilder('user')
		.leftJoinAndSelect('user.statistic', 'stats')
		.orderBy("user.doubles_elo", "DESC")
		.skip(page * 10)
		.take(10)
		.getMany();

		return {
			nb_of_users,
			users,
		}
	}
}