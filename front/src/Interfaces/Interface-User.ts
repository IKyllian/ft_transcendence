export interface ExampleUser {
    id: number,
    name: string;
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
}