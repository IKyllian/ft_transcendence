import { createSlice } from '@reduxjs/toolkit'
import { ExampleUser } from '../Interfaces/Interface-User';
import { usersArray } from '../Interfaces/Datas-Examples';

interface UserState {
    userInfo: ExampleUser,
}

const initialState: UserState = {
    userInfo: usersArray[0],
}

export const authSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {

    }
});
