import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PartyInterface, TeamSide, Player } from '../Types/Lobby-Types';

interface PartyState {
    party?: PartyInterface,
    modalIsOpen: boolean,
    isInQueue: boolean,
}

const defaultState: PartyState = {
    party: undefined,
    modalIsOpen: false,
    isInQueue: false,
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
        },
        changeModalStatus: (state, { payload }: PayloadAction<boolean>) => {
            state.modalIsOpen = payload;
        },
        changeQueueStatus: (state, { payload }: PayloadAction<boolean>) => {
            if (payload !== state.isInQueue)
                state.isInQueue = payload;
        },
        cancelQueue: (state, { payload }: PayloadAction<boolean>) => {
            if (payload === true && state.isInQueue)
                state.isInQueue = false;
        },
    }
});

export const { addParty, leaveParty, changeModalStatus, changeQueueStatus, cancelQueue} = partySlice.actions;