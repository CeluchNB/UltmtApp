import { RootState } from '../../../store'
import { createSlice } from '@reduxjs/toolkit'
import { LiveServerAction, SavedServerAction } from '../../../../types/action'

export interface ViewActionSlice {
    liveAction: LiveServerAction | undefined
    savedAction: SavedServerAction | undefined
}

const initialState: ViewActionSlice = {
    liveAction: undefined,
    savedAction: undefined,
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
    },
})

export const selectLiveAction = (state: RootState) =>
    state.viewAction.liveAction
export const selectSavedAction = (state: RootState) =>
    state.viewAction.savedAction
export const { setLiveAction, setSavedAction } = viewActionSlice.actions
export default viewActionSlice.reducer
