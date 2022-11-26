import * as PointData from '../../../../services/data/point'
import { GuestTeam } from '../../../../types/team'
import { GuestUser } from '../../../../types/user'
import Point from '../../../../types/point'
import { RootState } from '../../../store'
import { Status } from '../../../../types/reducers'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface LivePointSlice {
    point: Point
    createStatus: Status
    createError: string | undefined
    setPlayersStatus: Status
    setPlayersError: string | undefined
}

const initialState: LivePointSlice = {
    point: {
        _id: '',
        pointNumber: 0,
        teamOneActive: false,
        teamTwoActive: false,
        teamOneActions: [],
        teamTwoActions: [],
        teamOneScore: 0,
        teamTwoScore: 0,
        teamOnePlayers: [],
        teamTwoPlayers: [],
        pullingTeam: {} as GuestTeam,
        receivingTeam: {} as GuestTeam,
    },
    createStatus: 'idle',
    createError: undefined,
    setPlayersStatus: 'idle',
    setPlayersError: undefined,
}

const livePointSlice = createSlice({
    name: 'livePoint',
    initialState,
    reducers: {
        resetSetPlayersStatus(state) {
            state.setPlayersStatus = 'idle'
            state.setPlayersError = undefined
        },
        substitute(state, action) {
            if (action.payload.team === 'one') {
                state.point.teamOnePlayers = [...action.payload.players]
            } else {
                state.point.teamTwoPlayers = [...action.payload.players]
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(createPoint.pending, state => {
            state.createStatus = 'loading'
            state.createError = undefined
        })
        builder.addCase(createPoint.fulfilled, (state, action) => {
            state.point = action.payload
            state.createStatus = 'success'
        })
        builder.addCase(createPoint.rejected, (state, action) => {
            state.createStatus = 'failed'
            state.createError = action.error.message || ''
        })

        builder.addCase(setPlayers.pending, state => {
            state.setPlayersStatus = 'loading'
            state.setPlayersError = undefined
        })
        builder.addCase(setPlayers.fulfilled, (state, action) => {
            state.point = action.payload
            state.setPlayersStatus = 'success'
        })
        builder.addCase(setPlayers.rejected, (state, action) => {
            state.setPlayersStatus = 'failed'
            state.setPlayersError = action.error.message
        })
    },
})

export const createPoint = createAsyncThunk(
    'livePoint/create',
    async (data: { pulling: boolean; pointNumber: number }) => {
        const { pulling, pointNumber } = data
        return await PointData.createPoint(pulling, pointNumber)
    },
)

export const setPlayers = createAsyncThunk(
    'livePoint/players',
    async (data: { players: GuestUser[] }, thunkAPI) => {
        const { players } = data
        const {
            livePoint: {
                point: { _id },
            },
        } = thunkAPI.getState() as RootState

        return await PointData.setPlayers(_id, players)
    },
)

export const selectCreateStatus = (state: RootState) =>
    state.livePoint.createStatus
export const selectCreateError = (state: RootState) =>
    state.livePoint.createError
export const selectSetPlayersStatus = (state: RootState) =>
    state.livePoint.setPlayersStatus
export const selectSetPlayersError = (state: RootState) =>
    state.livePoint.setPlayersError
export const selectPoint = (state: RootState) => state.livePoint.point
export const { resetSetPlayersStatus, substitute } = livePointSlice.actions
export default livePointSlice.reducer
