import * as Constants from '../../../src/utils/constants'
import * as GameServices from '../../../src/services/network/game'
import * as LocalGameServices from '../../../src/services/local/game'
import Point from '../../../src/types/point'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { game } from '../../../fixtures/data'
import jwt from 'jsonwebtoken'
import {
    addGuestPlayer,
    createGame,
    finishGame,
    getActiveGames,
    getGameById,
    getGamesByTeam,
    getPointsByGame,
    joinGame,
    searchGames,
    withGameToken,
} from '../../../src/services/data/game'

const validToken = jwt.sign({}, 'secret', { expiresIn: '3 hours' })
const point: Point = {
    _id: 'point1',
    pointNumber: 1,
    teamOneActive: true,
    teamTwoActive: true,
    teamOneActions: [],
    teamTwoActions: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    pullingTeam: { name: 'Team 1' },
    receivingTeam: { name: 'Team 2' },
}

afterEach(() => {
    RNEncryptedStorage.getItem.mockReset()
    RNEncryptedStorage.setItem.mockReset()
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
            }),
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

describe('test create game', () => {
    it('should handle network success', async () => {
        jest.spyOn(GameServices, 'createGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game },
                status: 201,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve(game),
        )

        const result = await createGame({} as any)
        expect(result).toMatchObject(game)
    })

    it('should handle network failure', async () => {
        jest.spyOn(GameServices, 'createGame').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(createGame({} as any)).rejects.toMatchObject({
            message: Constants.CREATE_GAME_ERROR,
        })
    })
})

describe('test add guest player', () => {
    it('with network success', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(validToken),
        )
        const updatedGame = {
            ...game,
            teamOnePlayers: [
                ...game.teamOnePlayers,
                {
                    _id: 'user1',
                    firstName: 'First 1',
                    lastName: 'Last 1',
                    username: 'user1',
                },
            ],
        }

        jest.spyOn(GameServices, 'addGuestPlayer').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    game: updatedGame,
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve(updatedGame),
        )

        const result = await addGuestPlayer({
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'user1',
        })
        expect(result).toMatchObject(updatedGame)
    })

    it('with network failure', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(validToken),
        )
        jest.spyOn(GameServices, 'addGuestPlayer').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(
            addGuestPlayer({ firstName: 'First 1', lastName: 'Last 1' }),
        ).rejects.toMatchObject({ message: Constants.ADD_GUEST_ERROR })
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
            }),
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
            }),
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

describe('test join game', () => {
    it('should handle network success', async () => {
        jest.spyOn(GameServices, 'joinGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game, token: validToken },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValueOnce(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve(game),
        )

        const result = await joinGame('gameid', 'teamid', '123456')
        expect(result).toMatchObject(game)
        expect(RNEncryptedStorage.setItem).toHaveBeenCalledWith(
            'game_token',
            validToken,
        )
    })

    it('should handle network failure', async () => {
        jest.spyOn(GameServices, 'joinGame').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(
            joinGame('gameid', 'teamid', '123456'),
        ).rejects.toMatchObject({
            message: Constants.JOIN_GAME_ERROR,
        })
        expect(RNEncryptedStorage.setItem).not.toHaveBeenCalled()
    })
})

describe('test finish game', () => {
    it('handles network success', async () => {
        jest.spyOn(GameServices, 'finishGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await finishGame()
        expect(result).toMatchObject(game)
    })

    it('handles network failure', async () => {
        jest.spyOn(GameServices, 'finishGame').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        await expect(finishGame()).rejects.toMatchObject({
            message: Constants.FINISH_GAME_ERROR,
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
            }),
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
        jest.spyOn(LocalGameServices, 'activeGames').mockReturnValue(
            Promise.resolve([game]),
        )
        const result = await getActiveGames('user1')
        expect(result.length).toBe(1)
        expect(result[0]).toMatchObject(game)
    })
    it('with local failure', async () => {
        jest.spyOn(LocalGameServices, 'activeGames').mockReturnValue(
            Promise.reject({ message: 'test error' }),
        )
        await expect(getActiveGames('user')).rejects.toMatchObject({
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
