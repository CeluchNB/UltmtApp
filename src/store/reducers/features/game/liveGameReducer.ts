import * as GameData from '../../../../services/data/game'
import { CreateGame } from '../../../../types/game'
import { RootState } from '../../../store'
import { Status } from '../../../../types/reducers'
import { Tournament } from '../../../../types/tournament'
import {
    DisplayTeam,
    GuestTeam,
    Team,
    TeamNumber,
} from '../../../../types/team'
import { DisplayUser, InGameStatsUser } from '../../../../types/user'
import {
    addInGameStatsPlayers,
    initializeInGameStatsPlayers,
    subtractInGameStatsPlayers,
    updateInGameStatsPlayers,
} from '../../../../utils/in-game-stats'
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
    activeTeam: Team
    activeTags: string[]
    team: TeamNumber
    createStatus: Status
    createError: string | undefined
    activeTeamStats: {
        _id: string
        players: InGameStatsUser[]
        points: { [_id: string]: InGameStatsUser[] }
    }
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
    activeTeam: {} as Team,
    activeTags: ['huck', 'break', 'layout'],
    team: 'one',
    createStatus: 'idle',
    createError: undefined,
    activeTeamStats: {
        _id: '',
        players: [],
        points: {},
    },
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
        setActiveTeam(state, action) {
            state.activeTeam = action.payload
        },
        setTeam(state, action) {
            state.team = action.payload
        },
        setTournament(state, action) {
            state.game.tournament = action.payload
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
            state.activeTeam = initialState.activeTeam
            state.activeTeamStats = initialState.activeTeamStats
        },
        setActiveTeamId(state, action) {
            state.activeTeamStats._id = action.payload
        },
        addPlayers(state, action) {
            state.activeTeamStats.players = updateInGameStatsPlayers(
                state.activeTeamStats.players,
                action.payload,
            )
        },
        addPlayerStats(state, action) {
            const { pointId, players } = action.payload
            state.activeTeamStats.players = addInGameStatsPlayers(
                state.activeTeamStats.players,
                players,
            )
            state.activeTeamStats.points[pointId] = players
        },
        subtractPlayerStats(state, action) {
            const { pointId } = action.payload
            const point = state.activeTeamStats.points[pointId]
            if (point) {
                state.activeTeamStats.players = subtractInGameStatsPlayers(
                    state.activeTeamStats.players,
                    point,
                )
                delete state.activeTeamStats.points[pointId]
            }
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
            state.activeTeamStats._id = action.payload.teamOne._id
            state.activeTeamStats.players = initializeInGameStatsPlayers(
                action.payload.teamOnePlayers,
            )
        })
        builder.addCase(createGame.rejected, (state, action) => {
            state.createStatus = 'failed'
            state.createError = action.error.message
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

export const selectCreateStatus = (state: RootState) =>
    state.liveGame.createStatus
export const selectGame = (state: RootState) => state.liveGame.game
export const selectTeam = (state: RootState) => state.liveGame.team
export const selectTags = (state: RootState) => state.liveGame.activeTags
export const selectActiveTeam = (state: RootState) => state.liveGame.activeTeam
export const selectTournament = (state: RootState) =>
    state.liveGame.game.tournament
export const selectActiveTeamStats = (state: RootState) =>
    state.liveGame.activeTeamStats
export const {
    resetCreateStatus,
    setGame,
    setTeam,
    setActiveTeam,
    setTournament,
    addTag,
    updateScore,
    resetGame,
    addPlayers,
    addPlayerStats,
    subtractPlayerStats,
    setActiveTeamId,
} = liveGameSlice.actions
export default liveGameSlice.reducer
