import * as GameData from '../../../../services/data/game'
import { RootState } from '../../../store'
import { Status } from '../../../../types/reducers'
import { DisplayTeam, GuestTeam } from '../../../../types/team'
import { DisplayUser, GuestUser } from '../../../../types/user'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface LiveGameSlice {
    game: {
        _id: string
        resolveCode: string
        creator: DisplayUser
        teamOne: DisplayTeam
        teamTwo: GuestTeam
        teamTwoDefined: boolean
        scoreLimit: number
        halfScore: number
        startTime: string
        softcapMins: number
        hardcapMins: number
        playersPerPoint: number
        timeoutPerHalf: number
        floaterTimeout: boolean
        teamOneScore: number
        teamTwoScore: number
        teamOneActive: boolean
        teamTwoActive: boolean
        teamOnePlayers: GuestUser[]
        teamTwoPlayers: GuestUser[]
    }
    team: 'one' | 'two' | undefined
    createStatus: Status
}

const initialState: LiveGameSlice = {
    game: {
        _id: '',
        resolveCode: '',
        creator: {} as DisplayUser,
        teamOne: {} as DisplayTeam,
        teamTwo: {} as DisplayTeam,
        teamTwoDefined: false,
        scoreLimit: 0,
        halfScore: 0,
        startTime: '',
        softcapMins: 0,
        hardcapMins: 0,
        playersPerPoint: 0,
        timeoutPerHalf: 0,
        floaterTimeout: true,
        teamOneScore: 0,
        teamTwoScore: 0,
        teamOneActive: false,
        teamTwoActive: false,
        teamOnePlayers: [],
        teamTwoPlayers: [],
    },
    team: 'one',
    createStatus: 'idle',
}

const liveGameSlice = createSlice({
    name: 'liveGame',
    initialState,
    reducers: {
        resetCreateStatus(state) {
            state.createStatus = 'idle'
        },
        setGame(state, action) {
            state.game = action.payload
        },
        setTeam(state, action) {
            state.team = action.payload
        },
    },
    extraReducers: builder => {
        builder.addCase(createGame.pending, state => {
            state.createStatus = 'loading'
        })
        builder.addCase(createGame.fulfilled, (state, action) => {
            state.game = {
                ...action.payload,
                startTime: action.payload.startTime.toString(),
            }
            // creator of game is always team one
            state.team = 'one'
            state.createStatus = 'success'
        })
        builder.addCase(createGame.rejected, state => {
            state.createStatus = 'failed'
        })
    },
})

export const createGame = createAsyncThunk(
    'liveGame/create',
    async (data: any) => {
        return await GameData.createGame(data)
    },
)

export const selectCreateStatus = (state: RootState) =>
    state.liveGame.createStatus
export const selectGame = (state: RootState) => state.liveGame.game
export const selectTeam = (state: RootState) => state.liveGame.team
export const { resetCreateStatus, setGame, setTeam } = liveGameSlice.actions
export default liveGameSlice.reducer
