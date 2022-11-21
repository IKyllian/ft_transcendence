import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PartyInterface, TeamSide, Player, GameMode, PartyMessage } from '../Types/Lobby-Types';
import { NotificationInterface } from '../Types/Notification-Types';

interface PartyState {
    party?: PartyInterface,
    modalIsOpen: boolean,
    chatIsOpen: boolean,
    isInQueue: boolean,
    partyInvite: NotificationInterface[];
}

const defaultState: PartyState = {
    party: undefined,
    modalIsOpen: false,
    isInQueue: false,
    chatIsOpen: false,
    partyInvite: [],
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
    }
});

export const { addParty, leaveParty, addPartyMessage, changeModalStatus, changeSidebarChatStatus, closeSidebarChatStatus, changeQueueStatus, cancelQueue, changePartyGameMode, addPartyInvite, removePartyInvite } = partySlice.actions;