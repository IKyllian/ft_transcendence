import { Player } from "src/game/player"
import { User } from "src/typeorm"

export enum PlayerType {
	TeamBlue_Back,
	TeamBlue_Front,
	TeamRed_Front,
	TeamRed_Back,
	Spectator
}

export enum GameType {
	Singles,
	Doubles
}

//data sent to each player before the game
export type PlayersGameData = {
	TeamBlue_Back?: Player,
	TeamBlue_Front?: Player,
	TeamRed_Front?: Player,
	TeamRed_Back?: Player,
	player_type: PlayerType,
	game_id: string,
	game_settings: GameSettings,
}

// data sent from back to front with data for the players
export type NewGameData =
{
	TeamBlue_Back: Player,
	TeamBlue_Front?: Player,
	TeamRed_Back: Player,
	TeamRed_Front?: Player,
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
	TeamBlue_Back: PlayerStatus,
	TeamBlue_Front: PlayerStatus,
	TeamRed_Front: PlayerStatus,
	TeamRed_Back: PlayerStatus,
}

export type ScoreBoard = 
{
	TeamBlue: number,
	TeamRed: number
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
	TeamBlue,
	TeamRed
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
	TeamBlue_Back: Coordinates,
	TeamBlue_Front: Coordinates,
	TeamRed_Front: Coordinates,
	TeamRed_Back: Coordinates,
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
	TeamBlue_Win,
	TeamRed_Win
}

//game settings for the core
export type GameSettings =
{
	is_ranked?: boolean,
	game_type?: GameType,
	up_down_border: number,
	player_back_advance: number,
	player_front_advance: number,
	paddle_size_h: number,
	paddle_speed: number,
	ball_start_speed: number,
	ball_acceleration: number,
	point_for_victory: number
}

export enum TeamSide {
	BLUE,
	RED,
}

export enum PlayerPosition {
	BACK,
	FRONT,
}

export enum GameMode {
    RANKED = 'Ranked',
    RANKED_2v2 = '2v2',
    PRIVATE_MATCH = 'Private Match',
};

export interface Leaderboard {
	nb_of_users: number,
	users: User[],
}