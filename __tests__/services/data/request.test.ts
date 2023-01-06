import * as RequestServices from '../../../src/services/network/request'
import { DetailedRequest } from '../../../src/types/request'
import {
    deleteTeamRequest,
    deleteUserRequest,
    getRequest,
    getRequestsByTeam,
    getRequestsByUser,
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

        const result = await deleteTeamRequest('')
        expect(result).toEqual(request)
    })

    it('should handle network delete team request failure', async () => {
        jest.spyOn(RequestServices, 'deleteTeamRequest').mockReturnValueOnce(
            requestError,
        )

        await expect(deleteTeamRequest('')).rejects.toBeDefined()
    })

    it('should handle network delete user request success', async () => {
        jest.spyOn(RequestServices, 'deleteUserRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await deleteUserRequest('')
        expect(result).toEqual(request)
    })

    it('should handle network delete user request failure', async () => {
        jest.spyOn(RequestServices, 'deleteUserRequest').mockReturnValueOnce(
            requestError,
        )

        await expect(deleteUserRequest('')).rejects.toBeDefined()
    })

    it('should handle network get request success', async () => {
        jest.spyOn(RequestServices, 'getRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await getRequest('')
        expect(result).toEqual(request)
    })

    it('should handle network get request failure', async () => {
        jest.spyOn(RequestServices, 'getRequest').mockReturnValueOnce(
            requestError,
        )

        await expect(getRequest('')).rejects.toBeDefined()
    })

    it('should handle network request team success', async () => {
        jest.spyOn(RequestServices, 'requestTeam').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await requestTeam('')
        expect(result).toEqual(request)
    })

    it('should handle network request team failure', async () => {
        jest.spyOn(RequestServices, 'requestTeam').mockReturnValueOnce(
            requestError,
        )

        await expect(requestTeam('')).rejects.toBeDefined()
    })

    it('should handle network request user success', async () => {
        jest.spyOn(RequestServices, 'requestUser').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await requestUser('', '')
        expect(result).toEqual(request)
    })

    it('should handle network request user failure', async () => {
        jest.spyOn(RequestServices, 'requestUser').mockReturnValueOnce(
            requestError,
        )
        await expect(requestUser('', '')).rejects.toBeDefined()
    })

    it('should handle network respond to player success', async () => {
        jest.spyOn(
            RequestServices,
            'respondToPlayerRequest',
        ).mockReturnValueOnce(requestSuccess)

        const result = await respondToPlayerRequest('', true)
        expect(result).toEqual(request)
    })

    it('should handle network respond to player failure', async () => {
        jest.spyOn(
            RequestServices,
            'respondToPlayerRequest',
        ).mockReturnValueOnce(requestError)

        await expect(respondToPlayerRequest('', true)).rejects.toBeDefined()
    })

    it('should handle network respond to team success', async () => {
        jest.spyOn(RequestServices, 'respondToTeamRequest').mockReturnValueOnce(
            requestSuccess,
        )

        const result = await respondToTeamRequest('', true)
        expect(result).toEqual(request)
    })

    it('should handle network respond to team failure', async () => {
        jest.spyOn(RequestServices, 'respondToTeamRequest').mockReturnValueOnce(
            requestError,
        )

        await expect(respondToTeamRequest('', true)).rejects.toBeDefined()
    })

    it('should handle network get requests by team success', async () => {
        jest.spyOn(RequestServices, 'getRequestsByTeam').mockReturnValueOnce(
            Promise.resolve({
                data: { requests: [request] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await getRequestsByTeam('')
        expect(result).toEqual([request])
    })

    it('should handle network get requests by team failure', async () => {
        jest.spyOn(RequestServices, 'getRequestsByTeam').mockReturnValueOnce(
            requestError,
        )

        await expect(getRequestsByTeam('')).rejects.toBeDefined()
    })

    it('should handle network get requests by user success', async () => {
        jest.spyOn(RequestServices, 'getRequestsByUser').mockReturnValueOnce(
            Promise.resolve({
                data: { requests: [request] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await getRequestsByUser()
        expect(result).toEqual([request])
    })

    it('should handle network get requests by user failure', async () => {
        jest.spyOn(RequestServices, 'getRequestsByUser').mockReturnValueOnce(
            requestError,
        )

        await expect(getRequestsByUser()).rejects.toBeDefined()
    })
})
