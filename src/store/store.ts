import accountReducer from './reducers/features/account/accountReducer'
import { configureStore } from '@reduxjs/toolkit'
import liveGameReducer from './reducers/features/game/liveGameReducer'
import livePointReducer from './reducers/features/point/livePointReducer'
import managedTeamReducer from './reducers/features/team/managedTeamReducer'

const store = configureStore({
    reducer: {
        account: accountReducer,
        managedTeam: managedTeamReducer,
        liveGame: liveGameReducer,
        livePoint: livePointReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export default store
