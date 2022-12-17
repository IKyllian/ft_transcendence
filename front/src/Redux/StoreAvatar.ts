import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StoreAvatarInterface {
    id: number,
    url: string,
}

interface State {
    avatarsStored: StoreAvatarInterface[],
}

const defaultState: State = {
    avatarsStored: [],
}

export const storeAvatarSlice = createSlice({
    name: 'storeAvatar',
    initialState: defaultState,
    reducers: {
        addStoreAvatar: (state, {payload}: PayloadAction<StoreAvatarInterface>) => {
            state.avatarsStored = [...state.avatarsStored, payload];
        },
        resetAvatars: () => defaultState,
    }
});

export const { addStoreAvatar, resetAvatars } = storeAvatarSlice.actions;