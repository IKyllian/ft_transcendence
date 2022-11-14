import { Socket } from "socket.io-client";
import { Channel } from "./Chat-Types";

export interface ExampleUser {
    id: number,
    username: string;
    profilPic: string;
    gamesPlayed: number;
    winRate: number;
    points: number;
    isOnline: boolean;
    isInGame: boolean;
}

export interface AuthState {
    currentUser: UserInterface | undefined,
    isAuthenticated: boolean,
    error?: string,
    loading: boolean,
    token: string,
    setUsersame: boolean,
    friendList: UserInterface[];
}

export interface LoginPayload {
    user: UserInterface,
    token: string
}

export interface UserInterface {
    id: number,
    username: string,
    avatar: string,
    statistic: Statistic,
    channelUser: Channel[],
    blocked: UserInterface[];
}

interface Statistic {
    match_won: number,
    match_lost: number,
}

export interface ProfileState {
    isLoggedUser: boolean,
    user: UserInterface,
    friendList: UserInterface[],
    relationStatus?: string,
}

export interface UsersListInterface {
    user: UserInterface,
    relationStatus?: string,
}