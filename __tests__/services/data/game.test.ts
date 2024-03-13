import * as Constants from '../../../src/utils/constants'
import * as GameServices from '../../../src/services/network/game'
import * as LocalActionServices from '../../../src/services/local/action'
import * as LocalGameServices from '../../../src/services/local/game'
import * as LocalPointServices from '../../../src/services/local/point'
import * as LocalTeamServices from '../../../src/services/local/team'
import * as StatsServices from '../../../src/services/network/stats'
import * as TeamServices from '../../../src/services/network/team'
import * as UserServices from '../../../src/services/data/user'
import AsyncStorage from '../../../__mocks__/@react-native-async-storage/async-storage'
import { AxiosResponse } from 'axios'
import Point from '../../../src/types/point'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { Team } from '../../../src/types/team'
import dayjs from 'dayjs'
import { game } from '../../../fixtures/data'
import jwt from 'jsonwebtoken'
import { ActionType, LiveServerActionData } from '../../../src/types/action'
import {
    activeGameOffline,
    addGuestPlayer,
    createGame,
    deleteExpiredGameViews,
    deleteGame,
    editGame,
    finishGame,
    getActiveGames,
    getGameById,
    getGamesByTeam,
    getOfflineGameById,
    getPointsByGame,
    joinGame,
    logGameOpen,
    pushOfflineGame,
    reactivateGame,
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
    teamOneActivePlayers: [],
    teamTwoActivePlayers: [],
    teamOneScore: 0,
    teamTwoScore: 0,
    teamOnePlayers: [],
    teamTwoPlayers: [],
    pullingTeam: { name: 'Team 1' },
    receivingTeam: { name: 'Team 2' },
}

const onlineGame = { ...game, offline: false, statsPoints: [] }
const offlineGame = { ...game, offline: true, statsPoints: [] }

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

describe('test create game', () => {
    it('should handle network success', async () => {
        jest.spyOn(GameServices, 'createGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game },
                status: 201,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve(onlineGame),
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
        jest.spyOn(UserServices, 'getUserId').mockReturnValueOnce(
            Promise.resolve('id1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve(onlineGame),
        )
        const result = await createGame(game, true, [])
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
            } as AxiosResponse),
        )

        jest.spyOn(
            LocalGameServices,
            'isActiveGameOffline',
        ).mockReturnValueOnce(Promise.resolve(false))
        jest.spyOn(LocalGameServices, 'getActiveGameId').mockReturnValue(
            Promise.resolve('game1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve({
                ...updatedGame,
                offline: false,
                statsPoints: [],
            }),
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
        jest.spyOn(
            LocalGameServices,
            'isActiveGameOffline',
        ).mockReturnValueOnce(Promise.resolve(true))
        jest.spyOn(LocalGameServices, 'getActiveGameId').mockReturnValue(
            Promise.resolve('game1'),
        )
        jest.spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(Promise.resolve(offlineGame))
            .mockReturnValueOnce(
                Promise.resolve({
                    ...updatedGame,
                    offline: true,
                    statsPoints: [],
                }),
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

describe('test join game', () => {
    it('should handle network success', async () => {
        jest.spyOn(GameServices, 'joinGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game, token: validToken },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            } as AxiosResponse),
        )

        jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
            Promise.resolve(onlineGame),
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
            } as AxiosResponse),
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
            .mockReturnValueOnce(Promise.resolve(offlineGame))
            .mockReturnValueOnce(Promise.resolve(offlineGame))
        jest.spyOn(
            LocalGameServices,
            'isActiveGameOffline',
        ).mockReturnValueOnce(Promise.resolve(true))
        jest.spyOn(LocalGameServices, 'getActiveGameId').mockReturnValueOnce(
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
            message: Constants.GET_GAME_ERROR,
        })
    })
})

describe('get active game offline', () => {
    it('with return value', async () => {
        jest.spyOn(
            LocalGameServices,
            'isActiveGameOffline',
        ).mockReturnValueOnce(Promise.resolve(true))
        const result = await activeGameOffline()
        expect(result).toBe(true)
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

    const action: LiveServerActionData = {
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
                } as AxiosResponse),
            )
        const getGameSpy = jest
            .spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(
                Promise.resolve({
                    ...game,
                    offline: true,
                    points: ['point1'],
                    statsPoints: [],
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
        const getTeamSpy = jest
            .spyOn(LocalTeamServices, 'getTeamById')
            .mockReturnValue(
                Promise.resolve({
                    _id: 'teamid',
                    players: [
                        {
                            _id: 'playerone',
                            firstName: 'First',
                            lastName: 'Last',
                            username: 'guest1234',
                            localGuest: true,
                        },
                    ],
                } as unknown as Team),
            )
        const saveTeamSpy = jest
            .spyOn(LocalTeamServices, 'saveTeams')
            .mockReturnValue(Promise.resolve())
        const createGuestSpy = jest
            .spyOn(TeamServices, 'createGuest')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        team: {
                            _id: 'teamid',
                            players: [
                                {
                                    _id: 'playerone',
                                    firstName: 'First',
                                    lastName: 'Last',
                                    username: 'guest1234',
                                    localGuest: true,
                                },
                            ],
                        },
                    },
                    status: 200,
                    statusText: 'Good',
                    headers: {},
                    config: {},
                } as AxiosResponse),
            )

        await pushOfflineGame('game1')
        expect(pushSpy).toHaveBeenCalled()
        expect(getGameSpy).toHaveBeenCalled()
        expect(getPointSpy).toHaveBeenCalled()
        expect(getActionsSpy).toHaveBeenCalled()
        expect(deleteGameSpy).toHaveBeenCalled()
        expect(getTeamSpy).toHaveBeenCalled()
        expect(saveTeamSpy).toHaveBeenCalled()
        expect(createGuestSpy).toHaveBeenCalled()
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

describe('test reactivate game', () => {
    it('reactivates online game with point', async () => {
        jest.spyOn(GameServices, 'reactivateGame').mockResolvedValue({
            data: {
                game: { ...game, offline: false },
                team: 'one',
                activePoint: point,
                actions: [
                    {
                        teamNumber: 'one',
                        actionType: 'Pull',
                        tags: [],
                        comments: [],
                    },
                ],
            },
            config: {},
            headers: {},
            status: 200,
            statusText: 'Good',
        } as AxiosResponse)
        jest.spyOn(StatsServices, 'getGameStats').mockResolvedValue({
            data: { game: { points: [] } },
        } as AxiosResponse)
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameId').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameOffline').mockReturnValue(
            Promise.resolve(),
        )
        RNEncryptedStorage.setItem.mockReturnValueOnce(Promise.resolve())
        jest.spyOn(LocalGameServices, 'getGameById').mockResolvedValue(
            onlineGame,
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(
            LocalActionServices,
            'deleteEditableActionsByPoint',
        ).mockReturnValue(Promise.resolve())
        jest.spyOn(
            LocalActionServices,
            'saveMultipleServerActions',
        ).mockReturnValue(Promise.resolve())
        jest.spyOn(LocalPointServices, 'getPointById').mockResolvedValueOnce(
            point,
        )

        const result = await reactivateGame('', '')
        expect(result).toMatchObject({
            game,
            team: 'one',
            activePoint: point,
            hasActiveActions: true,
        })
    })

    it('reactivates online game without point', async () => {
        jest.spyOn(GameServices, 'reactivateGame').mockResolvedValue({
            data: {
                game: { ...game, offline: false },
                team: 'one',
                activePoint: undefined,
                actions: [],
            },
            config: {},
            headers: {},
            status: 200,
            statusText: 'Good',
        } as AxiosResponse)
        jest.spyOn(StatsServices, 'getGameStats').mockResolvedValue({
            data: { game: { points: [] } },
        } as AxiosResponse)
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameId').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameOffline').mockReturnValue(
            Promise.resolve(),
        )
        RNEncryptedStorage.setItem.mockReturnValueOnce(Promise.resolve())
        jest.spyOn(LocalGameServices, 'getGameById').mockResolvedValue(
            onlineGame,
        )

        const result = await reactivateGame('', '')
        expect(result).toMatchObject({
            game,
            team: 'one',
            activePoint: undefined,
            hasActiveActions: false,
        })
    })

    it('reactivates offline game', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockResolvedValue(
            offlineGame,
        )
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameId').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameOffline').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(
            LocalPointServices,
            'getPointByPointNumber',
        ).mockResolvedValue(point)
        jest.spyOn(LocalActionServices, 'getActionsByPoint').mockResolvedValue([
            {
                _id: 'one',
                pointId: 'one',
                teamNumber: 'one',
                comments: [],
                tags: [],
                actionNumber: 1,
                actionType: ActionType.PULL,
            },
        ])

        const result = await reactivateGame('', '')
        expect(result).toMatchObject({
            game,
            activePoint: point,
            team: 'one',
            hasActiveActions: true,
        })
    })

    it('reactivates offline game with no point', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockResolvedValue(
            offlineGame,
        )
        jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameId').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(LocalGameServices, 'setActiveGameOffline').mockReturnValue(
            Promise.resolve(),
        )
        jest.spyOn(
            LocalPointServices,
            'getPointByPointNumber',
        ).mockRejectedValue({ message: 'error' })
        jest.spyOn(LocalActionServices, 'getActionsByPoint').mockResolvedValue(
            [],
        )

        const result = await reactivateGame('', '')
        expect(result).toMatchObject({
            game,
            activePoint: undefined,
            team: 'one',
            hasActiveActions: false,
        })
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
            } as AxiosResponse),
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

describe('test edit game', () => {
    it('with valid online game', async () => {
        const updatedGame = { ...game, offline: false, scoreLimit: 11 }
        jest.spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(Promise.resolve(onlineGame))
            .mockReturnValueOnce(
                Promise.resolve({
                    ...updatedGame,
                    offline: false,
                    statsPoints: [],
                }),
            )
        jest.spyOn(GameServices, 'editGame').mockReturnValueOnce(
            Promise.resolve({
                data: { game: updatedGame },
                status: 200,
                statusText: 'Good',
                config: {},
                headers: {},
            } as AxiosResponse),
        )

        const result = await editGame('game', { scoreLimit: 11 })
        expect(result).toMatchObject(updatedGame)
    })

    it('with valid offline game', async () => {
        const updatedGame = { ...game, offline: true, scoreLimit: 11 }
        jest.spyOn(LocalGameServices, 'getGameById')
            .mockReturnValueOnce(Promise.resolve(offlineGame))
            .mockReturnValueOnce(
                Promise.resolve({
                    ...updatedGame,
                    offline: true,
                    statsPoints: [],
                }),
            )

        const result = await editGame('game', { scoreLimit: 11 })
        expect(result).toMatchObject(updatedGame)
    })

    it('with error', async () => {
        jest.spyOn(LocalGameServices, 'getGameById').mockRejectedValueOnce(
            Promise.resolve({ message: 'error' }),
        )

        await expect(
            editGame('game', { scoreLimit: 11 }),
        ).rejects.toMatchObject({ message: Constants.UPDATE_GAME_ERROR })
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
