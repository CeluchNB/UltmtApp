import * as Constants from '../../../src/utils/constants'
import * as GameServices from '../../../src/services/network/game'
import * as LocalGameServices from '../../../src/services/local/game'
import AsyncStorage from '../../../__mocks__/@react-native-async-storage/async-storage'
import { AxiosResponse } from 'axios'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import dayjs from 'dayjs'
import { game } from '../../../fixtures/data'
import jwt from 'jsonwebtoken'
import Point, { PointStatus } from '../../../src/types/point'
import {
    deleteExpiredGameViews,
    getActiveGames,
    getGameById,
    getGamesByTeam,
    getOfflineGameById,
    getPointsByGame,
    logGameOpen,
    searchGames,
    withGameToken,
} from '../../../src/services/data/game'

const validToken = jwt.sign({}, 'secret', { expiresIn: '3 hours' })
const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOneActions: [],
    teamTwoActions: [],
    teamOneActivePlayers: [],
    teamTwoActivePlayers: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    pullingTeam: { name: 'Team 1' },
    receivingTeam: { name: 'Team 2' },
    gameId: 'game1',
    teamOneStatus: PointStatus.ACTIVE,
    teamTwoStatus: PointStatus.ACTIVE,
}

beforeEach(() => {
    jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(Promise.resolve())
})

afterEach(() => {
    jest.resetAllMocks()
})

describe('test search games', () => {
    it('should handle success', async () => {
        jest.spyOn(GameServices, 'searchGames').mockReturnValue(
            Promise.resolve({
                data: { games: [game] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )

        const result = await searchGames()
        expect(result.length).toBe(1)
        expect(result[0]).toMatchObject(game)
    })

    it('should handle failure', async () => {
        jest.spyOn(GameServices, 'searchGames').mockReturnValue(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(searchGames()).rejects.toMatchObject({
            message: Constants.SEARCH_ERROR,
        })
    })
})

describe('test get points by game', () => {
    it('should handle network success', async () => {
        jest.spyOn(GameServices, 'getPointsByGame').mockReturnValueOnce(
            Promise.resolve({
                data: { points: [point] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )

        const result = await getPointsByGame('game1')
        expect(result).toEqual([point])
    })

    it('should handle network failure', async () => {
        jest.spyOn(GameServices, 'getPointsByGame').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(getPointsByGame('game1')).rejects.toMatchObject({
            message: Constants.GET_GAME_ERROR,
        })
    })
})

describe('test get game by id', () => {
    it('should handle network success', async () => {
        jest.spyOn(GameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({
                data: { game },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )

        const result = await getGameById('gameid')
        expect(result).toMatchObject(game)
    })

    it('should handle network failure', async () => {
        jest.spyOn(GameServices, 'getGameById').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(getGameById('gameid')).rejects.toMatchObject({
            message: Constants.GET_GAME_ERROR,
        })
    })
})

describe('get game by team', () => {
    it('with network success', async () => {
        jest.spyOn(GameServices, 'getGamesByTeam').mockReturnValueOnce(
            Promise.resolve({
                data: { games: [game] },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )
        const result = await getGamesByTeam('team')
        expect(result.length).toBe(1)
        expect(result[0]).toMatchObject(game)
    })

    it('with network failure', async () => {
        jest.spyOn(GameServices, 'getGamesByTeam').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 500,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(getGamesByTeam('team')).rejects.toMatchObject({
            message: Constants.GET_GAME_ERROR,
        })
    })
})

describe('get active games', () => {
    it('with local success', async () => {
        jest.spyOn(LocalGameServices, 'getActiveGames').mockReturnValue(
            Promise.resolve([{ ...game, offline: false }]),
        )
        const result = await getActiveGames()
        expect(result.length).toBe(1)
        expect(result[0]).toMatchObject(game)
    })
    it('with local failure', async () => {
        jest.spyOn(LocalGameServices, 'getActiveGames').mockReturnValue(
            Promise.reject({ message: 'test error' }),
        )
        await expect(getActiveGames()).rejects.toMatchObject({
            message: 'test error',
        })
    })
})

describe('test get offline game by id', () => {
    it('with local success', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: true, statsPoints: [] }),
        )
        const result = await getOfflineGameById('game1')
        expect(result).toMatchObject({ ...game, offline: true })
    })

    it('with local failure', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockRejectedValueOnce(
            Promise.resolve({ message: 'test error' }),
        )
        await expect(getOfflineGameById('game1')).rejects.toMatchObject({
            message: Constants.GET_GAME_ERROR,
        })
    })
})

describe('test with token', () => {
    it('should make call with token', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(validToken),
        )

        const networkCall = jest.fn().mockReturnValueOnce(
            Promise.resolve({
                data: {
                    point: 'point1',
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await withGameToken(networkCall, 'test')
        expect(networkCall).toBeCalledWith(validToken, 'test')
        expect(result.status).toBe(200)
        expect(result.data.point).toBe('point1')
    })
})

describe('test log game open', () => {
    it('handles expired case', async () => {
        const gameId = 'gameId'
        AsyncStorage.getItem = jest
            .fn()
            .mockResolvedValueOnce(dayjs().subtract(2, 'days').toString())

        const spy = jest.spyOn(GameServices, 'logGameOpen').mockReturnValue(
            Promise.resolve({
                data: { game: { ...game, totalViews: 5 } },
                config: { headers: {} },
                headers: {},
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        const result = await logGameOpen(gameId)

        expect(result?.totalViews).toBe(5)
        expect(spy).toHaveBeenCalled()
    })

    it('handles non-expired case', async () => {
        const gameId = 'gameId'
        AsyncStorage.getItem = jest
            .fn()
            .mockResolvedValueOnce(dayjs().toString())

        const spy = jest.spyOn(GameServices, 'logGameOpen').mockReturnValue(
            Promise.resolve({
                data: { game: { ...game, totalViews: 5 } },
                config: { headers: {} },
                headers: {},
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        const result = await logGameOpen(gameId)

        expect(result).toBeUndefined()
        expect(spy).not.toHaveBeenCalled()
    })

    it('handles undefined case', async () => {
        const gameId = 'gameId'
        AsyncStorage.getItem = jest.fn().mockResolvedValueOnce(undefined)

        const spy = jest.spyOn(GameServices, 'logGameOpen').mockReturnValue(
            Promise.resolve({
                data: { game: { ...game, totalViews: 5 } },
                config: { headers: {} },
                headers: {},
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )

        const result = await logGameOpen(gameId)

        expect(result?.totalViews).toBe(5)
        expect(spy).toHaveBeenCalled()
    })
})

describe('test delete expired game views', () => {
    it('deletes items appropriately', async () => {
        const gameIds = ['game1', 'game2', 'game3', 'game4']
        const keys = gameIds.map(id => `game:view:${id}`)
        AsyncStorage.getAllKeys = jest
            .fn()
            .mockResolvedValueOnce([...keys, 'other key'])
        AsyncStorage.getItem = jest.fn().mockImplementation(key => {
            if (key.includes('game1') || key.includes('game3')) {
                return dayjs().subtract(2, 'days')
            } else if (key.includes('game2')) {
                return dayjs().toString()
            } else {
                return 'baddate'
            }
        })
        AsyncStorage.removeItem = jest.fn()

        await deleteExpiredGameViews()

        expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(2)
    })
})
