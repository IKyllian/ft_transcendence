export enum PlayerType {
	Player_A,
	Player_B,
	Spectator
}

export type NewGameData =
{
	player_A: string,
	player_A_secret: string,
	player_B: string,
	player_B_secret: string,
	game_id: string
}

export enum PlayerStatus
{
	Absent,
	Present,
	Ready
}