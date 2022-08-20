import { ExampleUser } from "./Interface-User"
import ProfilPic from "../Images-Icons/pp.jpg"

interface matchInterface {
    player: string,
    enemyPlayer: string,
    playerScore: number,
    enemyScore: number,
}

interface friendInterface {
    name: string;
    profilPic: string;
}

export const leaderboardDatas: ExampleUser[] = [
    {
        name: "Johan",
        gamesPlayed: 100,
        winRate: 50,
        points: 4320,
        isOnline: true,
        isInGame: true,
    }, {
        name: "Kyllian",
        gamesPlayed: 89,
        winRate: 54,
        points: 4120,
        isOnline: false,
        isInGame: false,
    }, {
        name: "Loic",
        gamesPlayed: 95,
        winRate: 49,
        points: 3980,
        isOnline: true,
        isInGame: false,
    }, {
        name: "Arsene",
        gamesPlayed: 65,
        winRate: 60,
        points: 3640,
        isOnline: true,
        isInGame: true,
    }, {
        name: "Chafik",
        gamesPlayed: 40,
        winRate: 46,
        points: 3100,
        isOnline: true,
        isInGame: false,
    }, {
        name: "Karim",
        gamesPlayed: 20,
        winRate: 65,
        points: 2000,
        isOnline: false,
        isInGame: false,
    },
]

export const matchHistory: matchInterface[] = [
    {
        player: "Kyllian",
        enemyPlayer: "Johan",
        playerScore: 10,
        enemyScore: 5,
    }, {
        player: "Kyllian",
        enemyPlayer: "Zippy",
        playerScore: 10,
        enemyScore: 9,
    }, {
        player: "Kyllian",
        enemyPlayer: "Drow3yyy",
        playerScore: 7,
        enemyScore: 10,
    }, {
        player: "Kyllian",
        enemyPlayer: "Karim",
        playerScore: 10,
        enemyScore: 8,
    },
]

export const friendsDatas: friendInterface[] = [
    {
        name: "Johan",
        profilPic: ProfilPic,
    }, {
        name: "Karim",
        profilPic: ProfilPic,
    }, {
        name: "Loic",
        profilPic: ProfilPic,
    }, {
        name: "Gersho",
        profilPic: ProfilPic,
    }, {
        name: "Zippy",
        profilPic: ProfilPic,
    }, {
        name: "Owlly",
        profilPic: ProfilPic,
    }, {
        name: "Drow3yyy",
        profilPic: ProfilPic,
    }, {
        name: "Zeeqjr",
        profilPic: ProfilPic,
    },
]

export const playerDatas: string[] = [
    "Johan",
    "Karim",
    "Jojo",
    "Loic",
    "Chafik",
    "Arsene",
    "Lucas",
]