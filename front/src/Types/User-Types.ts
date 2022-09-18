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
}

interface Statistic {
    matchWon: number,
    matchLost: number,
}