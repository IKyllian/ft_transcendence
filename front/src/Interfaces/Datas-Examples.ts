import { ExampleUser } from "./Interface-User"
import ProfilPic from "../Images-Icons/pp.jpg"

export const playerDatas: string[] = [
    "Kyllian",
    "Johan",
    "Karim",
    "Jojo",
    "Loic",
    "Chafik",
    "Arsene",
    "Jerem",
    "Lucas",
    "Nico",
    "Drow3yyy",
    "Zippy",
    "Zeeqjr",
]

function getRandomInt(min: number, max: number) {
    return  Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillArray() {
    let newArray: ExampleUser[] = [];

    for (let i: number = 0; i < playerDatas.length; i++) {
        newArray.push({
            id: i + 1,
            name: playerDatas[i],
            profilPic: ProfilPic,
            gamesPlayed: getRandomInt(5, 150),
            winRate: getRandomInt(5, 100),
            points: getRandomInt(400, 4000),
            isOnline: (getRandomInt(0, 1) === 0 ? true : false),
            isInGame: (getRandomInt(0, 1) === 0 ? true : false),
        });
    }
    return (newArray);
}

export let usersArray: ExampleUser[] = fillArray();

interface MatchInterface {
    player: ExampleUser,
    enemyPlayer: ExampleUser,
    playerScore: number,
    enemyScore: number,
}

interface MessageInterface {
    message: string,
    sender: ExampleUser,
}

export interface ChatInterface {
    id: number,
    isChannel: boolean,
    channelName?: string,
    messages: MessageInterface[],
    users: ExampleUser[],
    admin?: ExampleUser,
    password?: string,
}

const messageExample1: MessageInterface = {
    message: "Ceci est un message",
    sender: usersArray[0],
}

const messageExample2: MessageInterface = {
    message: "Hello World",
    sender: usersArray[1],
}

const messageExample3: MessageInterface = {
    message: "Bonjour !",
    sender: usersArray[2],
}

const messageExample4: MessageInterface = {
    message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    sender: usersArray[3],
}

export const leaderboardDatas: ExampleUser[] = usersArray;

export const matchHistory: MatchInterface[] = [
    {
        player: usersArray[0],
        enemyPlayer: usersArray[2],
        playerScore: 10,
        enemyScore: 5,
    }, {
        player: usersArray[0],
        enemyPlayer: usersArray[6],
        playerScore: 10,
        enemyScore: 9,
    }, {
        player: usersArray[0],
        enemyPlayer: usersArray[4],
        playerScore: 7,
        enemyScore: 10,
    }, {
        player: usersArray[0],
        enemyPlayer: usersArray[7],
        playerScore: 10,
        enemyScore: 8,
    },
]

export const friendsDatas: ExampleUser[] = [
    usersArray[3],
    usersArray[4],
    usersArray[5],
    usersArray[6],
    usersArray[11],
    usersArray[2],
    usersArray[9],
    usersArray[10],
];

export const ChannelsDatas: ChatInterface[] = [
    {
        id: 1,
        isChannel: true,
        channelName: "Géneral",
        messages: [
            messageExample1, messageExample2, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3
        ],
        users: [
            usersArray[0], usersArray[1], usersArray[2]
        ],
        admin: usersArray[0],
    }, {
        id: 2,
        isChannel: true,
        channelName: "Random",
        messages: [
            messageExample1, messageExample2
        ],
        users: [
            usersArray[0], usersArray[1]
        ],
        admin: usersArray[0],
    }, {
        id: 3,
        isChannel: true,
        channelName: "ChanTest",
        messages: [
            messageExample1, messageExample2, messageExample3, messageExample4
        ],
        users: [
            usersArray[0], usersArray[1], usersArray[2], usersArray[3]
        ],
        admin: usersArray[0],
    }, {
        id: 4,
        isChannel: false,
        users: [usersArray[1]],
        messages: [
            messageExample1, messageExample2
        ]
    }, {
        id: 5,
        isChannel: false,
        users: [usersArray[3]],
        messages: [
            messageExample1, messageExample4
        ]
    }, {
        id: 6,
        isChannel: false,
        users: [usersArray[2]],
        messages: [
            messageExample1, messageExample3
        ]
    }
];


export const ChannelsPublicDatas: ChatInterface[] = [
    {
        id: 1,
        isChannel: true,
        channelName: "Public 1",
        messages: [
            messageExample1, messageExample2, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3
        ],
        users: [
            usersArray[0], usersArray[1], usersArray[2]
        ],
        admin: usersArray[0],
    }, {
        id: 2,
        isChannel: true,
        channelName: "Public 2",
        messages: [
            messageExample1, messageExample2, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3
        ],
        users: [
            usersArray[0], usersArray[1], usersArray[2]
        ],
        admin: usersArray[0],
    }, {
        id: 3,
        isChannel: true,
        channelName: "Public 3",
        messages: [
            messageExample1, messageExample2, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3, messageExample3
        ],
        users: [
            usersArray[0], usersArray[1], usersArray[2]
        ],
        admin: usersArray[0],
        password: "password",
    }, 
]
