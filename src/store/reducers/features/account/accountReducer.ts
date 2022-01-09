import * as UserServices from './../../../services/user'
import { LoginData } from '../../../../types/reducers'
import { RootState } from '../../../store'
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface AccountSlice {
    firstName: string
    lastName: string
    email: string
    username: string
    token: string
    error?: string
    loading: boolean
}

const initialState: AccountSlice = {
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    token: '',
    error: undefined,
    loading: false,
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        fetchToken: (state, action: PayloadAction<string>) => {
            state.token = action.payload
        },
        fetchDetails: (state, action: PayloadAction<AccountSlice>) => {
            state = action.payload
        },
    },
    extraReducers: builder => {
        builder.addCase(login.pending, state => {
            state.loading = true
        })
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false
            state.error = undefined
            state.token = action.payload.data.token
        })
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
        })

        builder.addCase(fetchProfile.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            state.loading = false
            const { firstName, lastName, email, username } = action.payload.data
            state.firstName = firstName
            state.lastName = lastName
            state.email = email
            state.username = username
        })
        builder.addCase(fetchProfile.rejected, (state, action) => {
            state.loading = false
            state.error = action.error.message
            state.token = ''
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

export const selectAccount = (state: RootState) => state.account
export const selectLoading = (state: RootState) => state.account.loading
export const { fetchToken, fetchDetails } = accountSlice.actions
export default accountSlice.reducer
