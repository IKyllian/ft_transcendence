export enum PlayerType {
	Player_A,
	Player_B,
	Spectator
  }

export type Player = {
	name: string,
	playertype: PlayerType,
	// avatar: string,
	win: number,
	loss: number
  }
