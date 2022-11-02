import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PartyInterface } from '../Types/Lobby-Types';

interface PartyState {
    party?: PartyInterface,
}

const defaultState: PartyState = {
    party: undefined,
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
        }
    }
});

export const { addParty, leaveParty } = partySlice.actions;