import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Statistic, User } from "src/typeorm";
import { EndResult, GameType, TeamSide } from "src/utils/types/game.types";
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
		// .where("stat.user.id IN :ids", { ids: playersId })
		.where("userId IN (:...ids)", { ids: playersId })
		.set({ match_won: () => "match_won + 1" })
		.execute();
	}

	addLose(playersId: number[]) {
		this.statRepo.createQueryBuilder("stat")
		.update()
		// .where("stat.user.id IN :ids", { ids: playersId })
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

		const blueEloWon: number = Math.round(50 / (1 + Math.pow(10, (blueTeamAverage - redTeamAverage) / 400)));
		const blueEloLost: number = blueEloWon - 50;
		const redEloWon: number = Math.abs(blueEloLost);
		const redEloLost: number = redEloWon - 50;

		if (result === EndResult.Team_A_Win) {
			console.log("blueEloWon: " + blueEloWon);
			console.log("redEloLost: " + redEloLost);
			this.saveNewElo(blueTeamIds, blueEloWon, game_type);
			this.addWin(blueTeamIds);
			this.saveNewElo(redTeamIds, redEloLost, game_type);
			this.addLose(redTeamIds);
		} else {
			this.saveNewElo(blueTeamIds, blueEloLost, game_type);
			this.addLose(blueTeamIds);
			this.saveNewElo(redTeamIds, redEloWon, game_type);
			this.addWin(redTeamIds);
			console.log("RedEloWon: " + redEloWon);
			console.log("blueEloLost: " + blueEloLost);
		}
	}
}