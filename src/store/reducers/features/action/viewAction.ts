import { GuestTeam } from '../../../../types/team'
import { RootState } from '../../../store'
import { createSlice } from '@reduxjs/toolkit'
import { LiveServerAction, SavedServerAction } from '../../../../types/action'

export interface ViewActionSlice {
    liveAction?: LiveServerAction
    savedAction?: SavedServerAction
    teamOne?: GuestTeam
    teamTwo?: GuestTeam
}

const initialState: ViewActionSlice = {
    liveAction: undefined,
    savedAction: undefined,
    teamOne: undefined,
    teamTwo: undefined,
}

const viewActionSlice = createSlice({
    name: 'viewAction',
    initialState,
    reducers: {
        setLiveAction(state, action) {
            state.liveAction = action.payload
        },
        setSavedAction(state, action) {
            state.savedAction = action.payload
        },
        setTeams(state, action) {
            const { teamOne, teamTwo } = action.payload
            state.teamOne = teamOne
            state.teamTwo = teamTwo
        },
    },
})

export const selectLiveAction = (state: RootState) =>
    state.viewAction.liveAction
export const selectSavedAction = (state: RootState) =>
    state.viewAction.savedAction
export const selectTeams = (state: RootState) => {
    return {
        teamOne: state.viewAction.teamOne,
        teamTwo: state.viewAction.teamTwo,
    }
}
export const { setLiveAction, setSavedAction, setTeams } =
    viewActionSlice.actions
export default viewActionSlice.reducer
