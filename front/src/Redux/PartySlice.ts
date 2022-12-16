import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PlayersGameData } from '../Components/Game/game/types/shared.types';
import { PartyInterface, GameMode, PartyMessage, QueueTimerInterface } from '../Types/Lobby-Types';
import { NotificationInterface } from '../Types/Notification-Types';

interface PartyState {
    party?: PartyInterface,
    modalIsOpen: boolean,
    chatIsOpen: boolean,
    isInQueue: boolean,
    queueTimer: QueueTimerInterface,
    partyInvite: NotificationInterface[],
    gameFound: {showGameFound: boolean, gameDatas: PlayersGameData} | undefined,
}

const defaultQueueTimer: QueueTimerInterface = {
    seconds: 0,
    minutes: 0
}

const defaultState: PartyState = {
    party: undefined,
    modalIsOpen: false,
    queueTimer: defaultQueueTimer,
    isInQueue: false,
    chatIsOpen: false,
    partyInvite: [],
    gameFound: undefined,
}

export const partySlice = createSlice({
    name: 'party',
    initialState: defaultState,
    reducers: {
        addParty: (state, { payload }: PayloadAction<PartyInterface>) => {
            state.party = payload;
        },
        leaveParty: (state) => {
            state.party = undefined;
            state.chatIsOpen =  false;
            state.modalIsOpen = false;
            state.isInQueue = false;
        },
        addPartyMessage: (state, { payload }: PayloadAction<PartyMessage>) => {
            if (state.party) {
                state.party.messages = [...state.party.messages, payload]
            }
        },
        changeModalStatus: (state, { payload }: PayloadAction<boolean>) => {
            state.modalIsOpen = payload;
        },
        changeSidebarChatStatus: (state) => {
            if (state.party)
                state.chatIsOpen = !state.chatIsOpen;
        },
        closeSidebarChatStatus: (state) => {
            if (state.party && state.chatIsOpen)
                state.chatIsOpen = false;
        },
        changeQueueStatus: (state, { payload }: PayloadAction<boolean>) => {
            if (payload !== state.isInQueue)
                state.isInQueue = payload;
        },
        cancelQueue: (state, { payload }: PayloadAction<boolean>) => {
            if (payload === true && state.isInQueue)
                state.isInQueue = false;
        },
        changePartyGameMode: (state, { payload }: PayloadAction<GameMode>) => {
            if (state.party) {
                state.party.game_mode = payload;
            }
        },
        addPartyInvite: (state, { payload }: PayloadAction<NotificationInterface>) => {
            state.partyInvite = [...state.partyInvite, payload]
        },
        removePartyInvite: (state, { payload }: PayloadAction<number>) => {
            state.partyInvite = [...state.partyInvite.filter(elem => elem.id !== payload)];
        },
        incrementQueueTimer: (state) => {
            if (state.isInQueue) {
                if (state.queueTimer.seconds === 59)
                    state.queueTimer = {seconds: 0, minutes: state.queueTimer.minutes + 1};
                else
                    state.queueTimer = {...state.queueTimer, seconds: state.queueTimer.seconds + 1};
            } else
                state.queueTimer = defaultQueueTimer;
        },
        resetQueueTimer: (state) => {
            state.queueTimer = defaultQueueTimer;
        },
        newGameFound: (state, { payload }: PayloadAction<{gameDatas: PlayersGameData, showGameFound: boolean}>) => {
            state.gameFound = {showGameFound: payload.showGameFound, gameDatas: payload.gameDatas};
        },
        stopShowGameFound: (state) => {
            if (state.gameFound)
                state.gameFound = {...state.gameFound, showGameFound: false};
        },
        unsetGameFound: (state) => {
            state.gameFound = undefined;
        },
        resetParty: () => defaultState,
    }
});

export const {
    addParty,
    leaveParty,
    addPartyMessage,
    changeModalStatus,
    changeSidebarChatStatus,
    closeSidebarChatStatus,
    changeQueueStatus,
    cancelQueue,
    changePartyGameMode,
    addPartyInvite,
    removePartyInvite,
    incrementQueueTimer,
    resetQueueTimer,
    newGameFound,
    stopShowGameFound,
    unsetGameFound,
    resetParty,
} = partySlice.actions;