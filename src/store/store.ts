import accountReducer from './reducers/features/account/accountReducer'
import { configureStore } from '@reduxjs/toolkit'
import liveGameReducer from './reducers/features/game/liveGameReducer'
import managedTeamReducer from './reducers/features/team/managedTeamReducer'

const store = configureStore({
    reducer: {
        account: accountReducer,
        managedTeam: managedTeamReducer,
        liveGame: liveGameReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export default store
