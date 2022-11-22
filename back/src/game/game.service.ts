import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchResult, Statistic, User } from "src/typeorm";
import { EndResult, GameType, Leaderboard, ScoreBoard, TeamSide } from "src/utils/types/game.types";
import { Repository } from "typeorm";
import { Player } from "./player";
import { UserSessionManager } from "./user.session";

@Injectable()
export class GameService {
	constructor(
		private userSession: UserSessionManager,

		@InjectRepository(User)
		private userRepo: Repository<User>,
		@InjectRepository(Statistic)
		private statRepo: Repository<Statistic>,
		@InjectRepository(MatchResult)
		private matchRepo: Repository<MatchResult>,
	) {}

	isPlaying(userId: number) : boolean {
		return this.userSession.getUser(userId) ? true : false;
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

		console.log("blue average: " + blueTeamAverage);
		console.log("red average: " + redTeamAverage);

		const blueEloWon: number = Math.round(50 / (1 + Math.pow(10, (blueTeamAverage - redTeamAverage) / 400)));
		const blueEloLost: number = blueEloWon - 50;
		const redEloWon: number = Math.abs(blueEloLost);
		const redEloLost: number = redEloWon - 50;

		// console.log("blue elo if win: " + blueEloWon);
		// console.log("blue elo if lose: " + blueEloLost);
		// console.log("red elo if win: " + redEloWon);
		// console.log("red elo if lose: " + redEloLost);

		if (result === EndResult.TeamBlue_Win) {
			console.log("elo result blue: " + blueEloWon);
			console.log("elo result red: " + redEloLost);
			this.saveNewElo(blueTeamIds, blueEloWon, game_type);
			this.addWin(blueTeamIds, game_type);
			this.saveNewElo(redTeamIds, redEloLost, game_type);
			this.addLose(redTeamIds, game_type);
		} else {
			this.saveNewElo(redTeamIds, redEloWon, game_type);
			this.addWin(redTeamIds, game_type);
			this.saveNewElo(blueTeamIds, blueEloLost, game_type);
			this.addLose(blueTeamIds, game_type);
			console.log("elo result red: " + redEloWon);
			console.log("elo result blue: " + blueEloLost);
		}
	}

	saveMatch(blueTeam: User[], redTeam: User[], game_type: GameType, score: ScoreBoard) {
		let match: MatchResult = this.matchRepo.create({
			game_type,
			blue_team_goals: score.TeamBlue,
			blue_team_player1: blueTeam[0],
			red_team_goals: score.TeamRed,
			red_team_player1: redTeam[0],
		});
		if (game_type === GameType.Doubles) {
			match.blue_team_player2 = blueTeam[1],
			match.red_team_player2 = redTeam[1];
		}
		console.log("matchResult", match);
		return this.matchRepo.save(match);
	}

	async getSinglesLeaderboard(user: User, page: number): Promise<Leaderboard> {
		const nb_of_users: number = await this.userRepo.createQueryBuilder('user').getCount()
		// TODO user placement
		// const user1 = await this.userRepo.createQueryBuilder('user')
		// 	.orderBy("user.singles_elo", "DESC")
		// 	.where("user.singles_elo >= :elo", {elo: user.singles_elo})
		// 	.getCount()

		// console.log(user1)
		
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