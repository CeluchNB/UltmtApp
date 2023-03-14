import * as GameData from '../../../../services/data/game'
import { CreateGame } from '../../../../types/game'
import { DisplayUser } from '../../../../types/user'
import { RootState } from '../../../store'
import { Status } from '../../../../types/reducers'
import { Tournament } from '../../../../types/tournament'
import {
    DisplayTeam,
    GuestTeam,
    Team,
    TeamNumber,
} from '../../../../types/team'
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
        teamOnePlayers: DisplayUser[]
        teamTwoPlayers: DisplayUser[]
        tournament?: Tournament
        offline?: boolean
    }
    teamOne: Team
    activeTags: string[]
    team: TeamNumber
    createStatus: Status
    createError: string | undefined
    guestPlayerStatus: Status
    guestPlayerError: string | undefined
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
        tournament: undefined,
        offline: false,
    },
    teamOne: {} as Team,
    activeTags: ['huck', 'break', 'layout'],
    team: 'one',
    createStatus: 'idle',
    createError: undefined,
    guestPlayerStatus: 'idle',
    guestPlayerError: undefined,
}

const liveGameSlice = createSlice({
    name: 'liveGame',
    initialState,
    reducers: {
        resetCreateStatus(state) {
            state.createStatus = 'idle'
            state.createError = undefined
        },
        setGame(state, action) {
            state.game = action.payload
        },
        setTeamOne(state, action) {
            state.teamOne = action.payload
        },
        setTeam(state, action) {
            state.team = action.payload
        },
        setTournament(state, action) {
            state.game.tournament = action.payload
        },
        resetGuestPlayerStatus(state) {
            state.guestPlayerStatus = 'idle'
            state.guestPlayerError = undefined
        },
        addTag(state, action) {
            state.activeTags.push(action.payload)
        },
        updateScore(state, action) {
            const { teamOneScore, teamTwoScore } = action.payload
            state.game.teamOneScore = teamOneScore
            state.game.teamTwoScore = teamTwoScore
        },
        resetGame(state) {
            state.game = initialState.game
            state.activeTags = initialState.activeTags
            state.team = initialState.team
            state.createStatus = initialState.createStatus
            state.createError = initialState.createError
            state.guestPlayerStatus = initialState.guestPlayerStatus
            state.guestPlayerError = initialState.guestPlayerError
            state.teamOne = initialState.teamOne
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
        builder.addCase(createGame.rejected, (state, action) => {
            state.createStatus = 'failed'
            state.createError = action.error.message
        })

        builder.addCase(addGuestPlayer.pending, state => {
            state.guestPlayerStatus = 'loading'
        })
        builder.addCase(addGuestPlayer.fulfilled, (state, action) => {
            state.game = {
                ...action.payload,
                startTime: action.payload.startTime.toString(),
                tournament: undefined,
            }
            state.guestPlayerStatus = 'success'
        })
        builder.addCase(addGuestPlayer.rejected, (state, action) => {
            state.guestPlayerStatus = 'failed'
            state.guestPlayerError = action.error.message
        })
    },
})

export const createGame = createAsyncThunk(
    'liveGame/create',
    async (
        data: CreateGame & { offline: boolean; teamOnePlayers: DisplayUser[] },
    ) => {
        const { offline, teamOnePlayers, ...gameData } = data
        return await GameData.createGame(gameData, offline, teamOnePlayers)
    },
)

export const addGuestPlayer = createAsyncThunk(
    'liveGame/addGuest',
    async (data: { firstName: string; lastName: string }) => {
        return await GameData.addGuestPlayer(data)
    },
)

export const selectCreateStatus = (state: RootState) =>
    state.liveGame.createStatus
export const selectGame = (state: RootState) => state.liveGame.game
export const selectTeam = (state: RootState) => state.liveGame.team
export const selectGuestPlayerStatus = (state: RootState) =>
    state.liveGame.guestPlayerStatus
export const selectGuestPlayerError = (state: RootState) =>
    state.liveGame.guestPlayerError
export const selectTags = (state: RootState) => state.liveGame.activeTags
export const selectTeamOne = (state: RootState) => state.liveGame.teamOne
export const selectTournament = (state: RootState) =>
    state.liveGame.game.tournament
export const {
    resetCreateStatus,
    setGame,
    setTeam,
    setTeamOne,
    setTournament,
    resetGuestPlayerStatus,
    addTag,
    updateScore,
    resetGame,
} = liveGameSlice.actions
export default liveGameSlice.reducer
