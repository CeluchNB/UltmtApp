import * as UserData from '../../../../services/data/user'
import { CreateUserData } from '../../../../types/user'
import { DisplayTeam } from '../../../../types/team'
import { LoginData } from '../../../../types/reducers'
import { RootState } from '../../../store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface AccountSlice {
    firstName: string
    lastName: string
    email: string
    username: string
    token: string
    error?: string
    loading: boolean
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
    loading: false,
    privateProfile: false,
    openToRequests: true,
    playerTeams: [],
    managerTeams: [],
    requests: [],
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(login.pending, state => {
                state.loading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.error = undefined
                state.token = action.payload
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })

        builder
            .addCase(fetchProfile.pending, state => {
                state.loading = true
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false
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
                state.loading = false
                state.error = action.error.message
                state.token = ''
            })

        builder
            .addCase(createAccount.pending, state => {
                state.loading = true
            })
            .addCase(createAccount.fulfilled, (state, action) => {
                state.loading = false
                const {
                    firstName,
                    lastName,
                    email,
                    username,
                    private: privateProfile,
                    openToRequests,
                } = action.payload.user
                const { token } = action.payload

                state.firstName = firstName
                state.lastName = lastName
                state.email = email
                state.username = username
                state.privateProfile = privateProfile
                state.openToRequests = openToRequests
                state.token = token
            })
            .addCase(createAccount.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })

        builder
            .addCase(logout.pending, state => {
                state.loading = true
            })
            .addCase(logout.fulfilled, state => {
                state.loading = false

                state.firstName = ''
                state.lastName = ''
                state.email = ''
                state.username = ''
                state.privateProfile = false
                state.openToRequests = false
                state.token = ''
            })
            .addCase(logout.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })

        builder
            .addCase(getLocalToken.pending, state => {
                state.loading = true
            })
            .addCase(getLocalToken.fulfilled, (state, action) => {
                state.loading = false
                state.token = action.payload
            })
            .addCase(getLocalToken.rejected, state => {
                state.loading = false
                state.token = ''
            })
    },
})

export const login = createAsyncThunk(
    'account/login',
    async (data: LoginData, _thunkAPI) => {
        const { username, password } = data
        return await UserData.login(username, password)
    },
)

export const fetchProfile = createAsyncThunk(
    'account/fetchProfile',
    async (data: string, _thunkAPI) => {
        return await UserData.fetchProfile(data)
    },
)

export const createAccount = createAsyncThunk(
    'account/createAccount',
    async (data: CreateUserData, _thunkAPI) => {
        return await UserData.createAccount(data)
    },
)

export const logout = createAsyncThunk(
    'account/logout',
    async (data: string, _thunkAPI) => {
        return await UserData.logout(data)
    },
)

export const getLocalToken = createAsyncThunk(
    'account/getLocalToken',
    async () => {
        return await UserData.getLocalToken()
    },
)

export const selectAccount = (state: RootState) => state.account
export const selectLoading = (state: RootState) => state.account.loading
export const selectToken = (state: RootState) => state.account.token
export const selectPlayerTeams = (state: RootState) => state.account.playerTeams
export const selectManagerTeams = (state: RootState) =>
    state.account.managerTeams
export const selectRequests = (state: RootState) => state.account.requests
export default accountSlice.reducer
