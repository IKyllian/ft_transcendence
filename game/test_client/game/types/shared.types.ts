export enum PlayerType {
	Player_A,
	Player_B,
	Spectator
}

export type Player = {
	name: string,
	win: number,
	loss: number,
	avatar: string
}

export type PlayersGameData = {
	player_A: Player,
	player_B: Player,
	playertype: PlayerType,
	player_secret: string,
	game_id: string
}

export type PlayersLobbyData = 
{
	player_secret: string,
	game_id: string
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

export type ScoreBoard = 
{
	player_A: number,
	player_B: number
}

export type Coordinates = 
{
	x: number,
	y: number
}

export type BallData =
{
	position: Coordinates,
	velocity: number,
	direction: number
}

export type LobbyStatus =
{
	player_A: PlayerStatus,
	player_B: PlayerStatus
}