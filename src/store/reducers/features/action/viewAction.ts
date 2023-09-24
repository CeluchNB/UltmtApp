import { GuestTeam } from '../../../../types/team'
import { RootState } from '../../../store'
import {
    LiveServerActionData,
    SavedServerActionData,
} from '../../../../types/action'
import { createSelector, createSlice } from '@reduxjs/toolkit'

export interface ViewActionSlice {
    liveAction?: LiveServerActionData
    savedAction?: SavedServerActionData
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
const selectTeamData = (state: RootState) => ({
    teamOne: state.viewAction.teamOne,
    teamTwo: state.viewAction.teamTwo,
})
export const selectTeams = createSelector([selectTeamData], teams => {
    return teams
})
export const { setLiveAction, setSavedAction, setTeams } =
    viewActionSlice.actions
export default viewActionSlice.reducer
