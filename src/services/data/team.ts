import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import { throwApiError } from '../../utils/service-utils'
import { CreateTeam, Team } from '../../types/team'
import {
    createTeam as networkCreateTeam,
    getManagedTeam as networkGetManagedTeam,
    getTeam as networkGetTeam,
    removePlayer as networkRemovePlayer,
    rollover as networkRollover,
    searchTeam as networkSearchTeam,
    toggleRosterStatus as networkToggleRosterStatus,
} from '../network/team'

/**
 * Method to create team
 * @param token token of user creating team
 * @param data create team data
 * @returns created team
 * @throws error if team is not created successfully
 */
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

/**
 * Method to search for teams by place, name, or username
 * @param term search term
 * @returns list of teams matching term
 * @throws error if backend returns an error
 */
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

/**
 * Method to get team that the current user manages
 * @param token jwt of current user
 * @param id team id
 * @returns team object
 * @throws error if backend returns error
 */
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

/**
 * Method to get a public team
 * @param id id of team to get
 * @returns team object
 * @throws error if backend returns an error
 */
export const getTeam = async (id: string): Promise<Team> => {
    try {
        const response = await networkGetTeam(id)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.GET_TEAM_ERROR)
    }
}

/**
 * Method to change a team's roster status
 * @param token jwt of user changing team
 * @param id id of team to update
 * @param open boolean for team's roster status
 * @returns updated team object
 * @throws error if backend returns error
 */
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

/**
 * Method to remove a player from a team
 * @param token token of current user
 * @param teamId team player is on
 * @param userId id of player to remove
 * @returns updated team object
 * @throws error if backend returns an error
 */
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

/**
 * Method to start a new season for a team. After this method is called,
 * the old team is no longer editable.
 * @param token jwt of manager of team
 * @param teamId id of team to move over
 * @param copyPlayers boolean for deciding if current roster should be kept
 * @param seasonStart start year for season
 * @param seasonEnd start end for season
 * @returns newly created team object
 * @throws error if backend returns an error
 */
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
