import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './AuthSlice'
import { channelSlice } from './ChannelSlice'
import { chatSlice } from './ChatSlice'
import { notificationSlice } from './NotificationSlice'
import { partySlice } from './PartySlice'

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        chat: chatSlice.reducer,
        channel: channelSlice.reducer,
        notification: notificationSlice.reducer,
        party: partySlice.reducer,
    }
})


// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch