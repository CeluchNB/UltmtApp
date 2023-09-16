import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import { throwApiError } from '../../utils/service-utils'
import { withToken } from './auth'
import { CreateTeam, Team } from '../../types/team'
import {
    getTeamsById as localGetTeamsById,
    saveTeams as localSaveTeams,
} from '../local/team'
import {
    addManager as networkAddManager,
    createBulkJoinCode as networkCreateBulkJoinCode,
    createTeam as networkCreateTeam,
    getArchivedTeam as networkGetArchivedTeam,
    getManagedTeam as networkGetManagedTeam,
    getTeam as networkGetTeam,
    removePlayer as networkRemovePlayer,
    rollover as networkRollover,
    searchTeam as networkSearchTeam,
    toggleRosterStatus as networkToggleRosterStatus,
} from '../network/team'

/**
 * Method to create a managed team by a user
 * @param data create team data
 * @returns created team
 * @throws error if team is not created successfully
 */
export const createTeam = async (data: CreateTeam): Promise<Team> => {
    try {
        const response = await withToken(networkCreateTeam, data)
        const { team } = response.data
        await localSaveTeams([team])
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
export const searchTeam = async (
    term: string,
    rosterOpen?: boolean,
): Promise<Team[]> => {
    try {
        if (term.length < 3) {
            throw new ApiError('Not enough characters to search.')
        }
        const response = await networkSearchTeam(term, rosterOpen)
        const { teams } = response.data
        return teams
    } catch (error) {
        return throwApiError(error, Constants.SEARCH_ERROR)
    }
}

/**
 * Method to get team that the current user manages
 * @param id team id
 * @returns team object
 * @throws error if backend returns error
 */
export const getManagedTeam = async (id: string): Promise<Team> => {
    try {
        const response = await withToken(networkGetManagedTeam, id)
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
 * @param id id of team to update
 * @param open boolean for team's roster status
 * @returns updated team object
 * @throws error if backend returns error
 */
export const toggleRosterStatus = async (
    id: string,
    open: boolean,
): Promise<Team> => {
    try {
        const response = await withToken(networkToggleRosterStatus, id, open)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

/**
 * Method to remove a player from a team
 * @param teamId team player is on
 * @param userId id of player to remove
 * @returns updated team object
 * @throws error if backend returns an error
 */
export const removePlayer = async (
    teamId: string,
    userId: string,
): Promise<Team> => {
    try {
        const response = await withToken(networkRemovePlayer, teamId, userId)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

/**
 * Method to start a new season for a team. After this method is called,
 * the old team is no longer editable.
 * @param teamId id of team to move over
 * @param copyPlayers boolean for deciding if current roster should be kept
 * @param seasonStart start year for season
 * @param seasonEnd start end for season
 * @returns newly created team object
 * @throws error if backend returns an error
 */
export const rollover = async (
    teamId: string,
    copyPlayers: boolean,
    seasonStart: string,
    seasonEnd: string,
): Promise<Team> => {
    try {
        const response = await withToken(
            networkRollover,
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

/**
 * Method to add manager to a team
 * @param teamId team to add manager to
 * @param managerId manager to add to team
 * @returns team with updated manager
 */
export const addManager = async (
    teamId: string,
    managerId: string,
): Promise<Team> => {
    try {
        const response = await withToken(networkAddManager, teamId, managerId)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

/**
 * Method to get archived team
 * @param teamId id of team
 * @returns archived team object
 */
export const getArchivedTeam = async (teamId: string): Promise<Team> => {
    try {
        const response = await networkGetArchivedTeam(teamId)
        const { team } = response.data
        return team
    } catch (error) {
        return throwApiError(error, Constants.GET_TEAM_ERROR)
    }
}

/**
 * Method to create a code users' can join the team with
 * @param teamId id of team to create code for
 * @param token auth token of manager
 * @returns 6 digit code to be shared with team
 */
export const createBulkJoinCode = async (teamId: string): Promise<string> => {
    try {
        const response = await withToken(networkCreateBulkJoinCode, teamId)
        const { code } = response.data
        return code
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

/**
 * Get the locally saved teams that the user is a manager of.
 * @param userId
 * @returns list of teams
 */
export const getTeamsById = async (ids: string[]): Promise<Team[]> => {
    try {
        return await localGetTeamsById(ids)
    } catch (error) {
        return throwApiError(error, Constants.GET_TEAM_ERROR)
    }
}
