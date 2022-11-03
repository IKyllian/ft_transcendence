import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PartyInterface } from '../Types/Lobby-Types';

interface PartyState {
    party?: PartyInterface,
    modalIsOpen: boolean,
}

const defaultState: PartyState = {
    party: undefined,
    modalIsOpen: false,
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
    }
});

export const { addParty, leaveParty, changeModalStatus } = partySlice.actions;