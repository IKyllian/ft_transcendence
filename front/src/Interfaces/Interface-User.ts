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
    currentUser: ExampleUser | undefined,
    isAuthenticated: boolean,
    error?: string,
    loading: boolean,
    token: string,
}

export interface LoginPayload {
    user: ExampleUser,
    token: string
}