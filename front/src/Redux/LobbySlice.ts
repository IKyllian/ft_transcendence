import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GameMode, GameModeState } from '../Types/Lobby-Types';

const defaultState: GameModeState = {
    gameModes: [
        {
            gameMode: GameMode.RANKED,
            isLock: false,   
        },  {
            gameMode: GameMode.PRIVATE_MATCH,
            isLock: false,   
        }, {
            gameMode: GameMode.RANKED_2v2,
            isLock: false,   
        }
    ],
    indexSelected: 0,
}

export const lobbySlice = createSlice({
    name: 'lobby',
    initialState: defaultState,
    reducers: {
        changeMode: (state, { payload }: PayloadAction<number>) => {
            state.indexSelected = payload;
        },
        lockModeDuo: (state,  { payload }: PayloadAction<number>) => {
            state.indexSelected = payload;
            state.gameModes = [... state.gameModes.map(elem => {
                if (elem.gameMode === GameMode.RANKED)
                    return  {...elem, isLock: true };
                else if (elem.gameMode === GameMode.RANKED_2v2)
                    return  {...elem, isLock: false };
                return elem;
            })]
        },
        lockModeQuatuor: (state) => {
            if (state.indexSelected !== 1)
                state.indexSelected = 1;
            state.gameModes = [... state.gameModes.map(elem => {
                if (elem.gameMode === GameMode.RANKED)
                    return  {...elem, isLock: true };
                else if (elem.gameMode === GameMode.RANKED_2v2)
                    return {...elem, isLock: true };
                return elem;
            })];
        },
        unlockAll: (state) => {
            if (state.gameModes.find(elem => elem.isLock === true)) {
                state.gameModes = [...state.gameModes.map(elem => {
                    if (elem.isLock)
                        return  {...elem, isLock: false };
                    return elem;
                })]
            }
        },
        resetParty: () => defaultState,
    }
});

export const {
    changeMode,
    lockModeDuo,
    lockModeQuatuor,
    unlockAll,
    resetParty
} = lobbySlice.actions;