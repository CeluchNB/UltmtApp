import * as Constants from '../../utils/constants'
import { ApiError } from '../../types/services'
import EncryptedStorage from 'react-native-encrypted-storage'
import { generateGuestData } from '../../utils/player'
import { isActiveGameOffline } from '../local/game'
import jwt_decode from 'jwt-decode'
import { updateGamePlayers as networkUpdateGamePlayers } from '../network/game'
import { withGameToken } from './game'
import { withToken } from './auth'
import { CreateTeam, Team } from '../../types/team'
import { isTokenExpired, throwApiError } from '../../utils/service-utils'
import {
    deleteTeamById as localDeleteTeamById,
    getTeamById as localGetTeamById,
    getTeamsByManager as localGetTeamsByManager,
    saveTeams as localSaveTeams,
} from '../local/team'
import {
    addManager as networkAddManager,
    archiveTeam as networkArchiveTeam,
    createBulkJoinCode as networkCreateBulkJoinCode,
    createGuest as networkCreateGuest,
    createTeam as networkCreateTeam,
    deleteTeam as networkDeleteTeam,
    getArchivedTeam as networkGetArchivedTeam,
    getManagedTeam as networkGetManagedTeam,
    getTeam as networkGetTeam,
    removePlayer as networkRemovePlayer,
    rollover as networkRollover,
    searchTeam as networkSearchTeam,
    teamnameIsTaken as networkTeamnameIsTaken,
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
        await localSaveTeams([team], true)
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
        await localSaveTeams([team])
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
        await localSaveTeams([team], true)
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
        await localSaveTeams([team], true)
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
export const getManagingTeams = async (): Promise<Team[]> => {
    try {
        const refreshToken = await EncryptedStorage.getItem('refresh_token')
        if (!refreshToken) return []

        // refresh token is most persistent method of determining the current user's ID
        // teams are not available if token is not valid
        const { exp: rExp, sub: managerId } = jwt_decode(refreshToken) as any
        if (isTokenExpired(rExp)) return []

        return await localGetTeamsByManager(managerId)
    } catch (error) {
        return throwApiError(error, Constants.GET_TEAM_ERROR)
    }
}

/**
 * Get single local team by id
 * @param id team id
 * @returns team
 */
export const getTeamById = async (id: string): Promise<Team> => {
    try {
        const team = await localGetTeamById(id)
        return team
    } catch (error) {
        return throwApiError(error, Constants.GET_TEAM_ERROR)
    }
}

/**
 * Delete a team. Must be done by a manager when it they are the last manager on the team.
 * @param teamId
 */
export const deleteTeam = async (teamId: string): Promise<void> => {
    try {
        await withToken(networkDeleteTeam, teamId)
        await localDeleteTeamById(teamId)
    } catch (error) {
        return throwApiError(error, Constants.UNABLE_TO_DELETE_TEAM)
    }
}

/**
 * Archive a team. Must be done by a manager. Managers and players will
 * have this team moved to their archive team's list.
 * @param teamId id of team
 * @returns
 */
export const archiveTeam = async (teamId: string): Promise<void> => {
    try {
        await withToken(networkArchiveTeam, teamId)
    } catch (error) {
        return throwApiError(error, Constants.EDIT_TEAM_ERROR)
    }
}

/**
 * Determine if a teamname can be used.
 * @param teamname handle of new team
 * @returns boolean
 */
export const teamnameIsTaken = async (teamname: string): Promise<boolean> => {
    try {
        const response = await networkTeamnameIsTaken(teamname)
        const { taken } = response.data
        return taken
    } catch (error) {
        return throwApiError(error, Constants.TEAMNAME_IS_INVALID)
    }
}

export const createGuest = async (
    teamId: string,
    firstName: string,
    lastName: string,
    inGame = false,
): Promise<Team> => {
    try {
        const offline = await isActiveGameOffline()
        if (inGame && offline) {
            const team = await localGetTeamById(teamId)
            const guest = generateGuestData(firstName, lastName)
            team.players.push(guest)
            await localSaveTeams([team])
        } else {
            const response = await withToken(networkCreateGuest, teamId, {
                firstName,
                lastName,
            })
            const { team } = response.data
            await localSaveTeams([team])
            await withGameToken(networkUpdateGamePlayers)
        }
        const team = await localGetTeamById(teamId)
        return team
    } catch (error) {
        console.log('error', error)
        return throwApiError(error, Constants.ADD_GUEST_ERROR)
    }
}
