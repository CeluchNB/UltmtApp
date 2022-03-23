import * as RequestServices from '../../../src/services/network/request'
import { DetailedRequest } from '../../../src/types/request'
import {
    deleteTeamRequest,
    deleteUserRequest,
    getRequest,
    requestTeam,
    requestUser,
    respondToPlayerRequest,
    respondToTeamRequest,
} from '../../../src/services/data/request'

const request: DetailedRequest = {
    _id: 'id1',
    user: 'user1',
    team: 'team1',
    status: 'approved',
    requestSource: 'player',
    teamDetails: {
        _id: 'team1',
        place: 'pgh',
        name: 'temper',
        teamname: 'pghtemper',
        seasonStart: '2022',
        seasonEnd: '2023',
    },
    userDetails: {
        _id: 'user1',
        firstName: 'noah',
        lastName: 'celuch',
        username: 'noahceluch',
    },
}

const requestSuccess = Promise.resolve({
    data: { request },
    status: 200,
    statusText: 'Good',
    headers: {},
    config: {},
})

const requestError = Promise.reject({
    data: { message: 'error from test' },
    status: 400,
    statusText: 'Bad',
    headers: {},
    config: {},
})

describe('test request data calls', () => {
    it('should handle network delete team request success', async () => {
        jest.spyOn(RequestServices, 'deleteTeamRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await deleteTeamRequest('', '')
        expect(result).toEqual(request)
    })

    it('should handle network delete team request failure', async () => {
        jest.spyOn(RequestServices, 'deleteTeamRequest').mockReturnValueOnce(
            requestError,
        )

        expect(deleteTeamRequest('', '')).rejects.toThrow()
    })

    it('should handle network delete user request success', async () => {
        jest.spyOn(RequestServices, 'deleteUserRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await deleteUserRequest('', '')
        expect(result).toEqual(request)
    })

    it('should handle network delete user request failure', async () => {
        jest.spyOn(RequestServices, 'deleteUserRequest').mockReturnValueOnce(
            requestError,
        )

        expect(deleteUserRequest('', '')).rejects.toThrow()
    })

    it('should handle network get request success', async () => {
        jest.spyOn(RequestServices, 'getRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await getRequest('', '')
        expect(result).toEqual(request)
    })

    it('should handle network get request failure', async () => {
        jest.spyOn(RequestServices, 'getRequest').mockReturnValueOnce(
            requestError,
        )

        expect(getRequest('', '')).rejects.toThrow()
    })

    it('should handle network request team success', async () => {
        jest.spyOn(RequestServices, 'requestTeam').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await requestTeam('', '')
        expect(result).toEqual(request)
    })

    it('should handle network request team failure', async () => {
        jest.spyOn(RequestServices, 'requestTeam').mockReturnValueOnce(
            requestError,
        )

        expect(requestTeam('', '')).rejects.toThrow()
    })

    it('should handle network request user success', async () => {
        jest.spyOn(RequestServices, 'requestUser').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await requestUser('', '', '')
        expect(result).toEqual(request)
    })

    it('should handle network request user failure', async () => {
        jest.spyOn(RequestServices, 'requestUser').mockReturnValueOnce(
            requestError,
        )
        expect(requestUser('', '', '')).rejects.toThrow()
    })

    it('should handle network respond to player success', async () => {
        jest.spyOn(
            RequestServices,
            'respondToPlayerRequest',
        ).mockReturnValueOnce(requestSuccess)

        const result = await respondToPlayerRequest('', '', true)
        expect(result).toEqual(request)
    })

    it('should handle network respond to player failure', async () => {
        jest.spyOn(
            RequestServices,
            'respondToPlayerRequest',
        ).mockReturnValueOnce(requestError)

        expect(respondToPlayerRequest('', '', true)).rejects.toThrow()
    })

    it('should handle network respond to team success', async () => {
        jest.spyOn(RequestServices, 'respondToTeamRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await respondToTeamRequest('', '', true)
        expect(result).toEqual(request)
    })

    it('should handle network respond to team failure', async () => {
        jest.spyOn(RequestServices, 'respondToTeamRequest').mockReturnValueOnce(
            requestError,
        )

        expect(respondToTeamRequest('', '', true)).rejects.toThrow()
    })
})
