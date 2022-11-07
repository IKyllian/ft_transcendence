import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PartyInterface } from '../Types/Lobby-Types';

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
    }
});

export const { addParty, leaveParty, changeModalStatus, changeQueueStatus } = partySlice.actions;