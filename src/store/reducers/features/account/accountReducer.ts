import * as UserServices from './../../../services/user'
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
            console.log('in fulfilled', action.payload.data.token)
            state.error = undefined
            state.token = action.payload.data.token
        })
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false
            console.log('in rejected', action.error.message)
            state.error = action.error.message
        })

        builder.addCase(fetchProfile.pending, state => {
            state.loading = true
        })
        builder.addCase(fetchProfile.fulfilled, (state, action) => {
            state.loading = false
            const { firstName, lastName, email, username } = action.payload.data
            state = { ...state, firstName, lastName, email, username }
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
    async (data: any, _thunkAPI) => {
        const { username, password } = data.data
        return await UserServices.login(username, password)
    },
)

export const fetchProfile = createAsyncThunk(
    'account/fetchProfile',
    async (data: any, _thunkAPI) => {
        const { token } = data.data
        return await UserServices.fetchProfile(token)
    },
)

export const { fetchToken, fetchDetails } = accountSlice.actions
export default accountSlice.reducer
