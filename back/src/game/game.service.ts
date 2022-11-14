import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MatchResult, Statistic, User } from "src/typeorm";
import { EndResult, GameType, ScoreBoard, TeamSide } from "src/utils/types/game.types";
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

	addWin(playersId: number[]) {
		this.statRepo.createQueryBuilder("stat")
		.update()
		.where("userId IN (:...ids)", { ids: playersId })
		.set({ match_won: () => "match_won + 1" })
		.execute();
	}

	addLose(playersId: number[]) {
		this.statRepo.createQueryBuilder("stat")
		.update()
		.where("userId IN (:...ids)", { ids: playersId })
		.set({ match_lost: () => "match_lost + 1" })
		.execute();
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

		if (result === EndResult.Team_A_Win) {
			console.log("elo result blue: " + blueEloWon);
			console.log("elo result red: " + redEloLost);
			this.saveNewElo(blueTeamIds, blueEloWon, game_type);
			this.addWin(blueTeamIds);
			this.saveNewElo(redTeamIds, redEloLost, game_type);
			this.addLose(redTeamIds);
		} else {
			this.saveNewElo(redTeamIds, redEloWon, game_type);
			this.addWin(redTeamIds);
			this.saveNewElo(blueTeamIds, blueEloLost, game_type);
			this.addLose(blueTeamIds);
			console.log("elo result red: " + redEloWon);
			console.log("elo result blue: " + blueEloLost);
		}
	}

	saveMatch(blueTeam: User[], redTeam: User[], game_type: GameType, score: ScoreBoard) {
		let match: MatchResult = this.matchRepo.create({
			game_type,
			blue_team_goals: score.Team_A,
			blue_team_player1: blueTeam[0],
			red_team_goals: score.Team_B,
			red_team_player1: redTeam[0],
		});
		if (game_type === GameType.Doubles) {
			match.blue_team_player2 = blueTeam[1],
			match.red_team_player2 = redTeam[1];
		}
		console.log("matchResult", match);
		return this.matchRepo.save(match);
	}

	getMatchHistory(userId: number) {
		return this.matchRepo.createQueryBuilder("match")
		.leftJoinAndSelect("match.blue_team_player1", "bp1")
		.leftJoinAndSelect("match.blue_team_player2", "bp2")
		.leftJoinAndSelect("match.red_team_player1", "rp1")
		.leftJoinAndSelect("match.red_team_player2", "rp2")
		.where("match.blue_team_player1.id = :id")
		.orWhere("match.blue_team_player2.id = :id")
		.orWhere("match.red_team_player1.id = :id")
		.orWhere("match.red_team_player2.id = :id")
		.setParameter("id", userId)
		.orderBy("match.created_at", 'DESC')
		.getMany();
	}
}