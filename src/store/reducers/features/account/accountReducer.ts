import * as AuthData from '../../../../services/data/auth'
import * as UserData from '../../../../services/data/user'
import { DisplayTeam } from '../../../../types/team'
import { RootState } from '../../../store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export interface AccountSlice {
    _id: string
    firstName: string
    lastName: string
    email: string
    username: string
    error?: string
    leaveManagerError?: string
    privateProfile: boolean
    openToRequests: boolean
    playerTeams: DisplayTeam[]
    managerTeams: DisplayTeam[]
    archiveTeams: DisplayTeam[]
    requests: string[]
    toggleRosterStatusLoading: boolean
    editLoading: boolean
    fetchProfileLoading: boolean
}

const initialState: AccountSlice = {
    _id: '',
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    error: undefined,
    leaveManagerError: undefined,
    privateProfile: false,
    openToRequests: true,
    playerTeams: [],
    managerTeams: [],
    archiveTeams: [],
    requests: [],
    toggleRosterStatusLoading: false,
    editLoading: false,
    fetchProfileLoading: false,
}

const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        setError(state, action) {
            state.error = action.payload
        },
        setProfile(state, action) {
            const {
                _id,
                firstName,
                lastName,
                email,
                username,
                playerTeams,
                managerTeams,
                archiveTeams,
                requests,
                openToRequests,
                privateProfile,
            } = action.payload

            state._id = _id
            state.firstName = firstName
            state.lastName = lastName
            state.email = email
            state.username = username
            state.playerTeams = playerTeams
            state.managerTeams = managerTeams
            state.archiveTeams = archiveTeams
            state.requests = requests
            state.openToRequests = openToRequests
            state.privateProfile = privateProfile
        },
        removeRequest(state, action) {
            state.requests = state.requests.filter(
                req => req !== action.payload,
            )
        },
        addRequest(state, action) {
            state.requests.push(action.payload)
        },
        resetState() {
            return initialState
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchProfile.pending, state => {
                state.fetchProfileLoading = true
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.fetchProfileLoading = false
                const {
                    _id,
                    firstName,
                    lastName,
                    email,
                    username,
                    playerTeams,
                    managerTeams,
                    archiveTeams,
                    requests,
                } = action.payload

                state._id = _id
                state.firstName = firstName
                state.lastName = lastName
                state.email = email
                state.username = username
                state.playerTeams = playerTeams as DisplayTeam[]
                state.managerTeams = managerTeams as DisplayTeam[]
                state.archiveTeams = archiveTeams as DisplayTeam[]
                state.requests = requests

                state.playerTeams.sort(
                    (a, b) =>
                        new Date(b.seasonStart).getUTCFullYear() -
                        new Date(a.seasonStart).getUTCFullYear(),
                )
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.fetchProfileLoading = false
                state.error = action.error.message
            })

        builder
            .addCase(logout.fulfilled, state => {
                state.firstName = ''
                state.lastName = ''
                state.email = ''
                state.username = ''
                state.privateProfile = false
                state.openToRequests = false
            })
            .addCase(logout.rejected, (state, action) => {
                state.error = action.error.message
            })

        builder
            .addCase(leaveTeam.fulfilled, (state, action) => {
                const { playerTeams } = action.payload
                state.playerTeams = playerTeams
            })
            .addCase(leaveTeam.rejected, (state, action) => {
                state.error = action.error.message
            })

        builder
            .addCase(leaveManagerRole.pending, state => {
                state.leaveManagerError = undefined
            })
            .addCase(leaveManagerRole.fulfilled, (state, action) => {
                const { managerTeams } = action.payload
                state.managerTeams = managerTeams
            })
            .addCase(leaveManagerRole.rejected, (state, action) => {
                state.leaveManagerError = action.error.message
            })

        builder
            .addCase(setOpenToRequests.pending, state => {
                state.toggleRosterStatusLoading = true
            })
            .addCase(setOpenToRequests.fulfilled, (state, action) => {
                const user = action.payload
                state.openToRequests = user.openToRequests
                state.toggleRosterStatusLoading = false
            })
            .addCase(setOpenToRequests.rejected, (state, action) => {
                state.error = action.error.message
                state.toggleRosterStatusLoading = false
            })

        builder
            .addCase(setPrivate.fulfilled, (state, action) => {
                const user = action.payload
                state.privateProfile = user.private
            })
            .addCase(setPrivate.rejected, (state, action) => {
                state.error = action.error.message
            })
    },
})

export const fetchProfile = createAsyncThunk(
    'account/fetchProfile',
    async () => {
        return await UserData.fetchProfile()
    },
)

export const logout = createAsyncThunk('account/logout', async () => {
    return await AuthData.logout()
})

export const leaveTeam = createAsyncThunk(
    'account/leaveTeam',
    async (data: { teamId: string }, _thunkAPI) => {
        const { teamId } = data
        return await UserData.leaveTeam(teamId)
    },
)

export const leaveManagerRole = createAsyncThunk(
    'account/leaveManagerRole',
    async (data: { teamId: string }, _thunkAPI) => {
        const { teamId } = data
        return await UserData.leaveManagerRole(teamId)
    },
)

export const setOpenToRequests = createAsyncThunk(
    'account/setOpenToRequests',
    async (data: { open: boolean }, _thunkAPI) => {
        const { open } = data
        return await UserData.setOpenToRequests(open)
    },
)

export const setPrivate = createAsyncThunk(
    'account/setPrivate',
    async (data: { privateAccount: boolean }, _thunkAPI) => {
        const { privateAccount } = data
        return await UserData.setPrivate(privateAccount)
    },
)

export const selectAccount = (state: RootState) => state.account
export const selectPlayerTeams = (state: RootState) => state.account.playerTeams
export const selectManagerTeams = (state: RootState) =>
    state.account.managerTeams
export const selectArchiveTeams = (state: RootState) =>
    state.account.archiveTeams
export const selectRequests = (state: RootState) => state.account.requests
export const selectLeaveManagerError = (state: RootState) =>
    state.account.leaveManagerError
export const selectError = (state: RootState) => state.account.error
export const selectToggleLoading = (state: RootState) =>
    state.account.toggleRosterStatusLoading
export const selectOpenToRequests = (state: RootState) =>
    state.account.openToRequests
export const selectFetchProfileLoading = (state: RootState) =>
    state.account.fetchProfileLoading
export const { addRequest, removeRequest, resetState, setError, setProfile } =
    accountSlice.actions
export default accountSlice.reducer
