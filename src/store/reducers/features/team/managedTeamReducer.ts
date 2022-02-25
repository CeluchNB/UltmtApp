import * as TeamData from '../../../../services/data/team'
import { RootState } from '../../../store'
import { Team } from '../../../../types/team'
import {
    RemovePlayerData,
    TeamRequestData,
    ToggleRosterStatusData,
} from '../../../../types/team'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface ManagedTeamSlice {
    team?: Team
    openLoading: boolean
    teamLoading: boolean
    error?: string
}

const initialState: ManagedTeamSlice = {
    team: undefined,
    openLoading: false,
    teamLoading: false,
    error: undefined,
}

const managedTeamSlice = createSlice({
    name: 'managedTeam',
    initialState,
    reducers: {
        setTeam(state, action) {
            state.team = action.payload
        },
        setTeamLoading(state, action) {
            state.teamLoading = action.payload
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getManagedTeam.pending, state => {
                state.teamLoading = true
                state.error = undefined
            })
            .addCase(getManagedTeam.fulfilled, (state, action) => {
                state.teamLoading = false
                state.error = undefined
                state.team = action.payload
            })
            .addCase(getManagedTeam.rejected, (state, action) => {
                state.teamLoading = false
                state.error = action.error.message
            })
        builder
            .addCase(toggleRosterStatus.pending, state => {
                state.openLoading = true
                state.error = undefined
            })
            .addCase(toggleRosterStatus.fulfilled, (state, action) => {
                state.openLoading = false
                state.error = undefined
                state.team = action.payload
            })
            .addCase(toggleRosterStatus.rejected, (state, action) => {
                state.openLoading = false
                state.error = action.error.message
            })
        builder
            .addCase(removePlayer.pending, state => {
                state.teamLoading = true
                state.error = undefined
            })
            .addCase(removePlayer.fulfilled, (state, action) => {
                state.teamLoading = false
                state.error = undefined
                state.team = action.payload
            })
            .addCase(removePlayer.rejected, (state, action) => {
                state.teamLoading = false
                state.error = action.error.message
            })
    },
})

export const getManagedTeam = createAsyncThunk(
    'managedTeam/getTeam',
    async (data: TeamRequestData, _thunkAPI) => {
        const { token, id } = data
        return await TeamData.getManagedTeam(token, id)
    },
)

export const toggleRosterStatus = createAsyncThunk(
    'managedTeam/toggleRosterStatus',
    async (data: ToggleRosterStatusData, _thunkAPI) => {
        const { token, id, open } = data
        return await TeamData.toggleRosterStatus(token, id, open)
    },
)

export const removePlayer = createAsyncThunk(
    'managedTeam/removePlayer',
    async (data: RemovePlayerData, _thunkAPI) => {
        const { token, id, userId } = data
        return await TeamData.removePlayer(token, id, userId)
    },
)

export const selectTeam = (state: RootState) => state.managedTeam.team
export const selectTeamLoading = (state: RootState) =>
    state.managedTeam.teamLoading
export const selectOpenLoading = (state: RootState) =>
    state.managedTeam.openLoading
export const selectTeamError = (state: RootState) => state.managedTeam.error
export const { setTeam, setTeamLoading } = managedTeamSlice.actions
export default managedTeamSlice.reducer
