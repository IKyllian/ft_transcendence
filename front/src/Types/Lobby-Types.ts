import { BlockLike } from "typescript";
import { UserInterface } from "./User-Types";

export enum GameMode {
	RANKED = 'Ranked',
	PRIVATE_MATCH = 'Private Match',
	BONUS_2v2 = '2v2',
};

export enum PlayerType {
    Player_A_Back,
    Player_A_Front,
    Player_B_Front,
    Player_B_Back,
    Spectator
}

export enum GameType {
	Singles,
	Doubles,
}

export enum TeamSide {
	BLUE,
	RED,
}

export enum PlayerPosition {
	BACK,
    FRONT,
}

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
    point_for_victory: number,
}

export interface ModeState {
    gameMode: GameMode,
    isLock: boolean,
}

export interface GameModeState {
    gameModes: ModeState[],
    indexSelected: number,
}

export interface Player {
	user: UserInterface,
	isReady: boolean,
	pos?: PlayerPosition,
    isLeader: boolean,
    team: TeamSide,
}

export interface PartyInterface {
	id: string,
	players: Player[],
	game_settings: GameSettings,
}