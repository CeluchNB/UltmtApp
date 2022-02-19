import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import { throwApiError } from '../../utils/service-utils'
import { CreateTeam, Team } from '../../types/team'
import {
    createTeam as networkCreateTeam,
    getManagedTeam as networkGetManagedTeam,
    removePlayer as networkRemovePlayer,
    rollover as networkRollover,
    searchTeam as networkSearchTeam,
    toggleRosterStatus as networkToggleRosterStatus,
} from '../network/team'

export const createTeam = async (
    token: string,
    data: CreateTeam,
): Promise<Team> => {
    try {
        const response = await networkCreateTeam(token, data)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.CREATE_TEAM_ERROR)
    }
}

export const searchTeam = async (term: string): Promise<Team[]> => {
    try {
        if (term.length < 3) {
            throw new ApiError('Not enough characters to search.')
        }
        const response = await networkSearchTeam(term)
        return response.data
    } catch (error) {
        return throwApiError(error, Constants.SEARCH_ERROR)
    }
}

export const getManagedTeam = async (
    token: string,
    id: string,
): Promise<Team> => {
    try {
        const response = await networkGetManagedTeam(token, id)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.GET_TEAM_ERROR)
    }
}

export const toggleRosterStatus = async (
    token: string,
    id: string,
    open: boolean,
): Promise<Team> => {
    try {
        const response = await networkToggleRosterStatus(token, id, open)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

export const removePlayer = async (
    token: string,
    teamId: string,
    userId: string,
): Promise<Team> => {
    try {
        const response = await networkRemovePlayer(token, teamId, userId)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

export const rollover = async (
    token: string,
    teamId: string,
    copyPlayers: boolean,
    seasonStart: string,
    seasonEnd: string,
): Promise<Team> => {
    try {
        const response = await networkRollover(
            token,
            teamId,
            copyPlayers,
            seasonStart,
            seasonEnd,
        )
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}
