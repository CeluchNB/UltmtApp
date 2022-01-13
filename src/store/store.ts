import accountReducer from './reducers/features/account/accountReducer'
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({
    reducer: {
        account: accountReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export default store
