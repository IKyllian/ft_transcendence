export enum PlayerType {
	Player_A,
	Player_B,
	Spectator
}

export enum GameType {
	Classic,
	Special_A
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

export type LobbyStatus =
{
	player_A: PlayerStatus,
	player_B: PlayerStatus
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
	vector: Coordinates
}

export enum Movement
{
	Up,
	Down,
	Neutral
}

export enum Goal
{
	None,
	Player_A,
	Player_B
}

export type PlayerInput =
{
	playertype: PlayerType,
	number: number,
	time: Date,
	movement: Movement
}

export type GameState =
{
	result: EndResult,
	goal: Goal,
	score: ScoreBoard,
	balldata: BallData,
	player_A: Coordinates,
	last_processed_id_A: number,
	last_processed_time_A: Date,
	player_B: Coordinates,
	last_processed_id_B: number,
	last_processed_time_B: Date
}

export type RoundSetup =
{
	start_time: Date,
	vector: Coordinates
}

export enum EndResult
{
	Undecided,
	Player_A_Win,
	Player_B_Win
}

// export type InterpolationData =
// {
// 	pos: Coordinates,
// 	time: Date
// }