import * as UserServices from './../../../services/user'
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
                state.token = action.payload.data.token
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
                const { firstName, lastName, email, username, playerTeams } =
                    action.payload.data

                state.firstName = firstName
                state.lastName = lastName
                state.email = email
                state.username = username
                state.playerTeams = playerTeams as DisplayTeam[]

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
                } = action.payload.data.user
                const { token } = action.payload.data

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
    },
})

export const login = createAsyncThunk(
    'account/login',
    async (data: LoginData, _thunkAPI) => {
        const { username, password } = data
        return await UserServices.login(username, password)
    },
)

export const fetchProfile = createAsyncThunk(
    'account/fetchProfile',
    async (data: string, _thunkAPI) => {
        return await UserServices.fetchProfile(data)
    },
)

export const createAccount = createAsyncThunk(
    'account/createAccount',
    async (data: CreateUserData, _thunkAPI) => {
        return await UserServices.createAccount(data)
    },
)

export const logout = createAsyncThunk(
    'account/logout',
    async (data: string, _thunkAPI) => {
        return await UserServices.logout(data)
    },
)

export const selectAccount = (state: RootState) => state.account
export const selectLoading = (state: RootState) => state.account.loading
export const selectPlayerTeams = (state: RootState) => state.account.playerTeams
export default accountSlice.reducer
