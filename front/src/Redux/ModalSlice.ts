import { createSlice } from '@reduxjs/toolkit'
import { ModalState } from '../Interfaces/Interface-Modal';

const initialState: ModalState = {
    isOpen: false,
    blurClass: "blur-background",
}

export const modalSlice = createSlice({
    name: 'modal',
    initialState: initialState,
    reducers: {
        changeStatus: (state) => {
           if (state.isOpen)
                state.isOpen = false;
            else
                state.isOpen = true;
        },
    }
});
