export enum PlayerType {
	Player_A_Back,
	Player_A_Front,
	Player_B_Front,
	Player_B_Back,
	Spectator
}

export enum GameType {
	Singles,
	Doubles
}

export type Player = {
	name: string,
	win: number,
	loss: number,
	avatar: string
}

//data sent to each player before the game
export type PlayersGameData = {
	Player_A_Back: Player,
	Player_A_Front: Player,
	Player_B_Front: Player,
	Player_B_Back: Player,
	player_type: PlayerType,
	player_secret: string,
	game_id: string,
	game_settings: GameSettings
}

//data sent from player to join lobby
export type PlayersLobbyData = 
{
	player_secret: string,
	game_id: string
}

//data sent to lobby factory to request a new lobby
export type LobbyRequest =
{
	Player_A_Back: string,
	Player_A_Front: string,
	Player_B_Front: string,
	Player_B_Back: string,
	game_settings: GameSettings
}


//data sent from back to front with data for the players
export type NewGameData =
{
	Player_A_Back: string,
	Player_A_Back_secret: string,
	Player_A_Front: string,
	Player_A_Front_secret: string,
	Player_B_Front: string,
	Player_B_Front_secret: string,
	Player_B_Back: string,
	Player_B_Back_secret: string,
	game_id: string,
	game_settings: GameSettings
}

export enum PlayerStatus
{
	Absent,
	Present,
	Ready
}

export type LobbyStatus =
{
	Player_A_Back: PlayerStatus,
	Player_A_Front: PlayerStatus,
	Player_B_Front: PlayerStatus,
	Player_B_Back: PlayerStatus,
}

export type ScoreBoard = 
{
	Team_A: number,
	Team_B: number
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
	Team_A,
	Team_B
}

export type PlayerInput =
{
	player_type: PlayerType,
	number: number,
	time: Date,
	movement: Movement
}

//detailed data about the gamestate
//produced by server core
//applied by client core
export type GameState =
{
	game_type: GameType,	
	result: EndResult,
	goal: Goal,
	score: ScoreBoard,
	balldata: BallData,
	Player_A_Back: Coordinates,
	Player_A_Front: Coordinates,
	Player_B_Front: Coordinates,
	Player_B_Back: Coordinates,
	last_processed_id_A_Back: number,
	last_processed_id_A_Front: number,
	last_processed_id_B_Front: number,
	last_processed_id_B_Back: number,
	send_date: Date
}


//data for next round to ensure sync
export type RoundSetup =
{
	start_time: Date,
	vector: Coordinates
}

export enum EndResult
{
	Undecided,
	Team_A_Win,
	Team_B_Win
}

//game settings for the core
export type GameSettings =
{
	game_type: GameType,
	up_down_border: number,
	player_back_advance: number,
	player_front_advance: number,
	paddle_size_h: number,
	paddle_speed: number,
	ball_start_speed: number,
	ball_acceleration: number,
	point_for_victory: number
}