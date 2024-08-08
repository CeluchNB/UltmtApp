import accountReducer from './reducers/features/account/accountReducer'
import { configureStore } from '@reduxjs/toolkit'
import managedTeamReducer from './reducers/features/team/managedTeamReducer'
import viewActionReducer from './reducers/features/action/viewAction'

const store = configureStore({
    reducer: {
        account: accountReducer,
        managedTeam: managedTeamReducer,
        viewAction: viewActionReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
