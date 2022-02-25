import * as UserData from '../../../../services/data/user'
import { DisplayTeam } from '../../../../types/team'
import { RootState } from '../../../store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface AccountSlice {
    firstName: string
    lastName: string
    email: string
    username: string
    token: string
    error?: string
    privateProfile: boolean
    openToRequests: boolean
    playerTeams: DisplayTeam[]
    managerTeams: DisplayTeam[]
    requests: string[]
}

const initialState: AccountSlice = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    token: '',
    error: undefined,
    privateProfile: false,
    openToRequests: true,
    playerTeams: [],
    managerTeams: [],
    requests: [],
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setToken(state, action) {
            state.token = action.payload
        },
        setError(state, action) {
            state.error = action.payload
        },
        resetState(state) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            state = initialState
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchProfile.fulfilled, (state, action) => {
                const {
                    firstName,
                    lastName,
                    email,
                    username,
                    playerTeams,
                    managerTeams,
                    requests,
                } = action.payload

                state.firstName = firstName
                state.lastName = lastName
                state.email = email
                state.username = username
                state.playerTeams = playerTeams as DisplayTeam[]
                state.managerTeams = managerTeams as DisplayTeam[]
                state.requests = requests

                state.playerTeams.sort(
                    (a, b) =>
                        new Date(b.seasonStart).getUTCFullYear() -
                        new Date(a.seasonStart).getUTCFullYear(),
                )
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.error = action.error.message
                state.token = ''
            })

        builder
            .addCase(logout.fulfilled, state => {
                state.firstName = ''
                state.lastName = ''
                state.email = ''
                state.username = ''
                state.privateProfile = false
                state.openToRequests = false
                state.token = ''
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.error.message
            })
    },
})

export const fetchProfile = createAsyncThunk(
    'account/fetchProfile',
    async (data: string, _thunkAPI) => {
        return await UserData.fetchProfile(data)
    },
)

export const logout = createAsyncThunk(
    'account/logout',
    async (data: string, _thunkAPI) => {
        return await UserData.logout(data)
    },
)

export const selectAccount = (state: RootState) => state.account
export const selectToken = (state: RootState) => state.account.token
export const selectPlayerTeams = (state: RootState) => state.account.playerTeams
export const selectManagerTeams = (state: RootState) =>
    state.account.managerTeams
export const selectRequests = (state: RootState) => state.account.requests
export const { setToken, setError, resetState } = accountSlice.actions
export default accountSlice.reducer
