export enum PlayerType {
	Player_A,
	Player_B,
	Spectator
}

//version avec playtype pour test
// export type Player = {
// 	name: string,
// 	win: number,
// 	loss: number,
// 	avatar: string,
// 	playertype: PlayerType
// }


export type Player = {
	name: string,
	win: number,
	loss: number,
	avatar: string
}

export type Game = {
	player_A: Player,
	player_B: Player,
	playertype: PlayerType,
	player_secret: string,
	game_id: string
  }
