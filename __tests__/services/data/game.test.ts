import * as Constants from '../../../src/utils/constants'
import * as GameServices from '../../../src/services/network/game'
import * as LocalActionServices from '../../../src/services/local/action'
import * as LocalGameServices from '../../../src/services/local/game'
import * as LocalPointServices from '../../../src/services/local/point'
import * as PointServices from '../../../src/services/network/point'
import Point from '../../../src/types/point'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { game } from '../../../fixtures/data'
import jwt from 'jsonwebtoken'
import {
    ActionType,
    LiveServerAction,
    SavedServerAction,
} from '../../../src/types/action'
import {
    activeGameOffline,
    addGuestPlayer,
    createGame,
    deleteGame,
    finishGame,
    getActiveGames,
    getGameById,
    getGamesByTeam,
    getOfflineGameById,
    getPointsByGame,
    joinGame,
    pushOfflineGame,
    reactivateInactiveGame,
    resurrectActiveGame,
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
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: false }),
        )
        RNEncryptedStorage.setItem.mockReturnValueOnce(Promise.resolve())

        const result = await createGame({} as any, false, [])
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

        await expect(createGame({} as any, false, [])).rejects.toMatchObject({
            message: Constants.CREATE_GAME_ERROR,
        })
    })

    it('offline creation', async () => {
        jest.spyOn(LocalGameServices, 'createOfflineGame').mockReturnValueOnce(
            Promise.resolve('game1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: false }),
        )
        const result = await createGame({} as any, true, [])
        expect(result).toMatchObject(game)
    })
})

describe('test add guest player', () => {
    it('with network success', async () => {
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

        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(false),
        )
        jest.spyOn(LocalGameServices, 'activeGameId').mockReturnValue(
            Promise.resolve('game1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...updatedGame, offline: false }),
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

    it('successful offline addition', async () => {
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
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(LocalGameServices, 'activeGameId').mockReturnValue(
            Promise.resolve('game1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(Promise.resolve({ ...game, offline: true }))
            .mockReturnValueOnce(
                Promise.resolve({ ...updatedGame, offline: true }),
            )
        const result = await addGuestPlayer({
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'user1',
        })
        expect(result).toMatchObject(updatedGame)
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

        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: false }),
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
        jest.spyOn(LocalGameServices, 'deleteFullGame').mockReturnValueOnce(
            Promise.resolve(),
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

    it('successful offline finish', async () => {
        jest.spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(Promise.resolve({ ...game, offline: true }))
            .mockReturnValueOnce(Promise.resolve({ ...game, offline: true }))
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        jest.spyOn(LocalGameServices, 'activeGameId').mockReturnValueOnce(
            Promise.resolve('game1'),
        )

        const result = await finishGame()
        expect(result).toMatchObject({ ...game, teamOneActive: false })
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
            Promise.resolve([{ ...game, offline: false }]),
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

describe('get active game offline', () => {
    it('with return value', async () => {
        jest.spyOn(LocalGameServices, 'activeGameOffline').mockReturnValueOnce(
            Promise.resolve(true),
        )
        const result = await activeGameOffline()
        expect(result).toBe(true)
    })
})

describe('resurrect active game', () => {
    it('with valid data', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValue(
            Promise.resolve({ ...game, offline: false }),
        )
        jest.spyOn(GameServices, 'reactivateGame').mockReturnValue(
            Promise.resolve({
                data: { game, token: validToken },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        RNEncryptedStorage.setItem.mockReturnValueOnce(Promise.resolve())
        const result = await resurrectActiveGame('game1', 'team1')
        expect(result).toMatchObject(game)
    })

    it('with error', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValue(
            Promise.reject({ message: 'test error' }),
        )

        await expect(
            resurrectActiveGame('game1', 'team1'),
        ).rejects.toMatchObject({ message: Constants.GET_GAME_ERROR })
    })

    it('successful offline resurrect', async () => {
        jest.spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(Promise.resolve({ ...game, offline: true }))
            .mockReturnValueOnce(Promise.resolve({ ...game, offline: true }))
        RNEncryptedStorage.setItem.mockReturnValueOnce(Promise.resolve())
        const result = await resurrectActiveGame('game1', 'team1')
        expect(result).toMatchObject(game)
    })
})

describe('test get offline game by id', () => {
    it('with local success', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: true }),
        )
        const result = await getOfflineGameById('game1')
        expect(result).toMatchObject({ ...game, offline: true })
    })

    it('with local failure', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockRejectedValueOnce(
            Promise.resolve({ message: 'test' }),
        )
        await expect(getOfflineGameById('game1')).rejects.toMatchObject({
            message: Constants.GET_GAME_ERROR,
        })
    })
})

describe('test push offline game', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    const action: LiveServerAction = {
        comments: [],
        tags: ['huck'],
        actionNumber: 1,
        actionType: ActionType.CATCH,
        teamNumber: 'one',
        playerOne: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'firstlast1',
        },
        playerTwo: {
            _id: 'user2',
            firstName: 'First 2',
            lastName: 'Last 2',
            username: 'firstlast2',
        },
    }

    it('with successful push', async () => {
        const pushSpy = jest
            .spyOn(GameServices, 'pushOfflineGame')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: { game },
                    status: 201,
                    statusText: 'error',
                    config: {},
                    headers: {},
                }),
            )
        const getGameSpy = jest
            .spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(
                Promise.resolve({
                    ...game,
                    offline: true,
                    points: ['point1'],
                }),
            )
        const getPointSpy = jest
            .spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(
                Promise.resolve({ ...point, teamOneActions: ['action1'] }),
            )
        const getActionsSpy = jest
            .spyOn(LocalActionServices, 'getActionsByPoint')
            .mockReturnValueOnce(
                Promise.resolve([
                    { ...action, _id: 'action1', pointId: 'point1' },
                ]),
            )

        const deleteGameSpy = jest
            .spyOn(LocalGameServices, 'deleteFullGame')
            .mockReturnValueOnce(Promise.resolve())

        await pushOfflineGame('game1')
        expect(pushSpy).toHaveBeenCalled()
        expect(getGameSpy).toHaveBeenCalled()
        expect(getPointSpy).toHaveBeenCalled()
        expect(getActionsSpy).toHaveBeenCalled()
        expect(deleteGameSpy).toHaveBeenCalled()
    })

    it('with error', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockRejectedValueOnce(
            Promise.resolve({ message: 'test' }),
        )

        await expect(pushOfflineGame('game1')).rejects.toMatchObject({
            message: Constants.FINISH_GAME_ERROR,
        })
    })
})

describe('test reactivate inactive game', () => {
    const savedActions: SavedServerAction[] = [
        {
            _id: 'action1',
            actionNumber: 1,
            actionType: ActionType.PICKUP,
            tags: ['pickup'],
            team: {
                _id: 'team1',
                place: 'Pgh',
                name: 'Temper',
                teamname: 'pghtemper',
                seasonStart: '2022',
                seasonEnd: '2022',
            },
            comments: [],
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'firstlast1',
            },
        },
        {
            _id: 'action2',
            actionNumber: 2,
            actionType: ActionType.CATCH,
            tags: [],
            team: {
                _id: 'team1',
                place: 'Pgh',
                name: 'Temper',
                teamname: 'pghtemper',
                seasonStart: '2022',
                seasonEnd: '2022',
            },
            comments: [],
            playerOne: {
                _id: 'user2',
                firstName: 'First 2',
                lastName: 'Last 2',
                username: 'firstlast2',
            },
            playerTwo: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'firstlast1',
            },
        },
        {
            _id: 'action3',
            actionNumber: 3,
            actionType: ActionType.TEAM_ONE_SCORE,
            tags: [],
            team: {
                _id: 'team1',
                place: 'Pgh',
                name: 'Temper',
                teamname: 'pghtemper',
                seasonStart: '2022',
                seasonEnd: '2022',
            },
            comments: [],
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'firstlast1',
            },
            playerTwo: {
                _id: 'user2',
                firstName: 'First 2',
                lastName: 'Last 2',
                username: 'firstlast2',
            },
        },
    ]
    it('with successful calls', async () => {
        jest.spyOn(GameServices, 'reactivateGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game, token: validToken },
                status: 201,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameId').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(
            LocalGameServices,
            'setActiveGameOffline',
        ).mockReturnValueOnce(Promise.resolve())
        jest.spyOn(GameServices, 'getPointsByGame').mockReturnValueOnce(
            Promise.resolve({
                data: { points: [point] },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValue(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalActionServices, 'getActions').mockReturnValueOnce(
            Promise.resolve(savedActions),
        )
        jest.spyOn(
            LocalActionServices,
            'saveMultipleServerActions',
        ).mockReturnValueOnce(Promise.resolve())
        jest.spyOn(PointServices, 'reactivatePoint').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: false }),
        )

        const result = await reactivateInactiveGame('game1', 'team1')
        expect(result).toMatchObject({ ...game, offline: false })
    })

    it('with team two', async () => {
        jest.spyOn(GameServices, 'reactivateGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game, token: validToken },
                status: 201,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameId').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(
            LocalGameServices,
            'setActiveGameOffline',
        ).mockReturnValueOnce(Promise.resolve())
        jest.spyOn(GameServices, 'getPointsByGame').mockReturnValueOnce(
            Promise.resolve({
                data: { points: [{ ...point, pointNumber: 2 }, point] },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValue(
            Promise.resolve(undefined),
        )
        jest.spyOn(LocalActionServices, 'getActions').mockReturnValue(
            Promise.resolve(savedActions),
        )
        jest.spyOn(
            LocalActionServices,
            'saveMultipleServerActions',
        ).mockReturnValue(Promise.resolve())
        jest.spyOn(PointServices, 'reactivatePoint').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({ ...game, offline: false }),
        )

        const result = await reactivateInactiveGame('game1', 'team2')
        expect(result).toMatchObject({ ...game, offline: false })
    })

    it('with error', async () => {
        jest.spyOn(GameServices, 'reactivateGame').mockRejectedValueOnce(
            Promise.resolve({
                data: {},
                status: 400,
                statusText: 'Good',
                config: {},
                headers: {},
            }),
        )

        await expect(
            reactivateInactiveGame('game1', 'team1'),
        ).rejects.toMatchObject({ message: Constants.GET_GAME_ERROR })
    })
})

describe('test delete game', () => {
    it('with success', async () => {
        jest.spyOn(LocalGameServices, 'deleteFullGame').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(GameServices, 'deleteGame').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'good',
                config: {},
                headers: {},
            }),
        )

        await expect(deleteGame('game1', 'team1')).resolves.toBeUndefined()
    })

    it('with error', async () => {
        jest.spyOn(LocalGameServices, 'deleteFullGame').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(GameServices, 'deleteGame').mockRejectedValueOnce(
            Promise.resolve({
                data: {},
                status: 401,
                statusText: 'bad',
                config: {},
                headers: {},
            }),
        )
        await expect(deleteGame('game1', 'team1')).rejects.toMatchObject({
            message: Constants.DELETE_GAME_ERROR,
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
