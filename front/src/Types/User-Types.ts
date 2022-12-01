import { Channel } from "./Chat-Types";
import { GameType } from "./Lobby-Types";

export enum UserStatus {
    ONLINE,
    OFFLINE,
    IN_GAME
}

export interface ExampleUser {
    id: number,
    username: string,
    profilPic: string,
    gamesPlayed: number,
    winRate: number,
    points: number,
    isOnline: boolean,
    isInGame: boolean,
}

export interface AuthState {
    currentUser: UserInterface | undefined,
    isAuthenticated: boolean,
    isSign: boolean,
    error?: string,
    loading: boolean,
    loadingIsConnected: boolean,
    token: string,
    setUsersame: boolean,
    friendList: UserInterface[],
    loggedUserAvatar: string | undefined,
    displayQRCode: boolean,
    verification2FA: boolean,
}

export interface LoginPayload {
    user: UserInterface,
    token: string,
}

export interface UserInterface {
    id: number,
    username: string,
    email: string,
    avatar: string | null,
    status: UserStatus,
    statistic: Statistic,
    channelUser: Channel[],
    blocked: UserInterface[],
    singles_elo: number,
	doubles_elo: number,
    two_factor_enabled: boolean,
}

interface Statistic {
    singles_match_won: number,
    singles_match_lost: number,
    doubles_match_won: number,
    doubles_match_lost: number,
}

export interface MatchResult {
    id: number,
	game_type: GameType,
	blue_team_goals: number,
	blue_team_player1: UserInterface,
	blue_team_player2?: UserInterface,
	red_team_goals: number,
	red_team_player1: UserInterface,
	red_team_player2?: UserInterface,
	created_at: Date,
}

export interface ProfileState {
    isLoggedUser: boolean,
    user: UserInterface,
    friendList: UserInterface[],
    match_history: MatchResult[],
    relationStatus?: string,
}

export interface UsersListInterface {
    user: UserInterface,
    relationStatus?: string,
}