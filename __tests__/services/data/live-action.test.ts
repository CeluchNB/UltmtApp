import * as AuthServices from '../../../src/services/data/auth'
import * as Constants from '../../../src/utils/constants'
import * as LiveActionNetwork from '../../../src/services/network/live-action'
import * as LocalActionServices from '../../../src/services/local/action'
import * as LocalPointServices from '../../../src/services/local/point'
import Point from '../../../src/types/point'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { point } from '../../../fixtures/data'
import {
    ActionType,
    LiveServerAction,
    SubscriptionObject,
} from '../../../src/types/action'
import {
    addAction,
    addLiveComment,
    deleteLiveComment,
    deleteLocalAction,
    joinPoint,
    nextPoint,
    saveLocalAction,
    subscribe,
    undoAction,
    unsubscribe,
} from '../../../src/services/data/live-action'

afterEach(() => {
    RNEncryptedStorage.getItem.mockReset()
    RNEncryptedStorage.setItem.mockReset()
    jest.resetAllMocks()
})

describe('basic actions', () => {
    it('add action', async () => {
        const spy = jest
            .spyOn(LiveActionNetwork, 'createAction')
            .mockReturnValue(Promise.resolve())

        const action = { actionType: ActionType.PULL, tags: [] }
        await addAction(action, 'point1')
        expect(spy).toHaveBeenCalledWith(action, 'point1')
    })

    it('join point', async () => {
        const spy = jest
            .spyOn(LiveActionNetwork, 'joinPoint')
            .mockReturnValue(Promise.resolve())

        await joinPoint('game1', 'point1')
        expect(spy).toHaveBeenCalledWith('game1', 'point1')
    })

    it('next point', async () => {
        const spy = jest
            .spyOn(LiveActionNetwork, 'nextPoint')
            .mockReturnValue(Promise.resolve())

        await nextPoint('point2')
        expect(spy).toHaveBeenCalledWith('point2')
    })

    it('subscribe', async () => {
        const spy = jest
            .spyOn(LiveActionNetwork, 'subscribe')
            .mockReturnValue(Promise.resolve())

        const subs: SubscriptionObject = {
            client: () => {},
            undo: () => {},
            error: () => {},
            point: () => {},
        }
        await subscribe(subs)
        expect(spy).toHaveBeenCalledWith(subs)
    })

    it('undo action', async () => {
        const spy = jest
            .spyOn(LiveActionNetwork, 'undoAction')
            .mockReturnValue(Promise.resolve())

        await undoAction('point1')
        expect(spy).toHaveBeenCalledWith('point1')
    })

    it('unsubscribe', () => {
        const spy = jest
            .spyOn(LiveActionNetwork, 'unsubscribe')
            .mockReturnValue()

        unsubscribe()
        expect(spy).toHaveBeenCalledWith()
    })
})

describe('comment actions', () => {
    describe('add comment', () => {
        it('with successful refresh', async () => {
            jest.spyOn(
                AuthServices,
                'refreshTokenIfNecessary',
            ).mockReturnValueOnce(Promise.resolve())
            const spy = jest
                .spyOn(LiveActionNetwork, 'addComment')
                .mockReturnValue(Promise.resolve())
            spy.mockReset()

            await addLiveComment('game1', 'point1', 1, 'one', 'test')
            expect(spy).toHaveBeenCalledWith(
                '',
                'game1',
                'point1',
                1,
                'one',
                'test',
            )
        })

        it('with unsuccessful refresh', async () => {
            jest.spyOn(
                AuthServices,
                'refreshTokenIfNecessary',
            ).mockReturnValueOnce(Promise.reject())
            const spy = jest
                .spyOn(LiveActionNetwork, 'addComment')
                .mockReturnValue(Promise.resolve())
            spy.mockReset()

            await addLiveComment('game1', 'point1', 1, 'one', 'test')
            expect(spy).toHaveBeenCalledWith(
                '',
                'game1',
                'point1',
                1,
                'one',
                'test',
            )
        })
    })

    describe('delete live comment', () => {
        it('with successful network call', async () => {
            jest.spyOn(
                AuthServices,
                'refreshTokenIfNecessary',
            ).mockReturnValueOnce(Promise.resolve())
            const spy = jest
                .spyOn(LiveActionNetwork, 'deleteComment')
                .mockReturnValue(Promise.resolve())
            spy.mockReset()

            await deleteLiveComment('game1', 'point1', 1, 'one', '1')
            expect(spy).toHaveBeenCalledWith(
                '',
                'game1',
                'point1',
                1,
                'one',
                '1',
            )
        })

        it('with unsuccessful network call', async () => {
            jest.spyOn(
                AuthServices,
                'refreshTokenIfNecessary',
            ).mockReturnValueOnce(Promise.reject())
            const spy = jest
                .spyOn(LiveActionNetwork, 'deleteComment')
                .mockReturnValue(Promise.resolve())
            spy.mockReset()

            await deleteLiveComment('game1', 'point1', 1, 'one', '1')
            expect(spy).toHaveBeenCalledWith(
                '',
                'game1',
                'point1',
                1,
                'one',
                '1',
            )
        })
    })
})

describe('save local action', () => {
    it('successful substitution on team one', async () => {
        const action: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.SUBSTITUTION,
            teamNumber: 'one',
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
            playerTwo: {
                _id: 'user2',
                firstName: 'First 2',
                lastName: 'Last 2',
                username: 'user2',
            },
            tags: [],
            comments: [],
        }

        jest.spyOn(LocalActionServices, 'upsertAction').mockReturnValueOnce(
            Promise.resolve(action),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        let savedPoint: Point | undefined
        jest.spyOn(LocalPointServices, 'savePoint').mockImplementationOnce(
            async p => {
                savedPoint = p
                return undefined
            },
        )

        const result = await saveLocalAction(action, 'point1')
        expect(result).toMatchObject(action)
        expect(savedPoint?.teamOnePlayers.length).toBe(1)
        expect(savedPoint?.teamOnePlayers[0]).toMatchObject(
            action.playerTwo || {},
        )
    })

    it('successful substitution on team two', async () => {
        const action: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.SUBSTITUTION,
            teamNumber: 'two',
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
            playerTwo: {
                _id: 'user2',
                firstName: 'First 2',
                lastName: 'Last 2',
                username: 'user2',
            },
            tags: [],
            comments: [],
        }

        jest.spyOn(LocalActionServices, 'upsertAction').mockReturnValueOnce(
            Promise.resolve(action),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        let savedPoint: Point | undefined
        jest.spyOn(LocalPointServices, 'savePoint').mockImplementationOnce(
            async p => {
                savedPoint = p
                return undefined
            },
        )

        const result = await saveLocalAction(action, 'point1')
        expect(result).toMatchObject(action)
        expect(savedPoint?.teamTwoPlayers.length).toBe(1)
        expect(savedPoint?.teamTwoPlayers[0]).toMatchObject(
            action.playerTwo || {},
        )
    })

    it('with non-substitution action', async () => {
        const action: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.CATCH,
            teamNumber: 'two',
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
            playerTwo: {
                _id: 'user2',
                firstName: 'First 2',
                lastName: 'Last 2',
                username: 'user2',
            },
            tags: [],
            comments: [],
        }

        jest.spyOn(LocalActionServices, 'upsertAction').mockReturnValueOnce(
            Promise.resolve(action),
        )
        const mockGetPoint = jest
            .spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve(point))
        const mockSavePoint = jest
            .spyOn(LocalPointServices, 'savePoint')
            .mockImplementationOnce(async () => {
                return undefined
            })

        const result = await saveLocalAction(action, 'point1')
        expect(result).toMatchObject(action)
        expect(mockGetPoint).not.toHaveBeenCalled()
        expect(mockSavePoint).not.toHaveBeenCalled()
    })

    it('with malformed substitution', async () => {
        const action: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.SUBSTITUTION,
            teamNumber: 'two',
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
            tags: [],
            comments: [],
        }

        jest.spyOn(LocalActionServices, 'upsertAction').mockReturnValueOnce(
            Promise.resolve(action),
        )
        const mockGetPoint = jest
            .spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve(point))

        const mockSavePoint = jest
            .spyOn(LocalPointServices, 'savePoint')
            .mockImplementationOnce(async () => {
                return undefined
            })

        const result = await saveLocalAction(action, 'point1')
        expect(result).toMatchObject(action)
        expect(mockGetPoint).not.toHaveBeenCalled()
        expect(mockSavePoint).not.toHaveBeenCalled()
    })

    it('handles local error', async () => {
        const action: LiveServerAction = {
            actionNumber: 1,
            actionType: ActionType.SUBSTITUTION,
            teamNumber: 'two',
            playerOne: {
                _id: 'user1',
                firstName: 'First 1',
                lastName: 'Last 1',
                username: 'user1',
            },
            playerTwo: {
                _id: 'user2',
                firstName: 'First 2',
                lastName: 'Last 2',
                username: 'user2',
            },
            tags: [],
            comments: [],
        }
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.reject({ message: 'test error' }),
        )
        await expect(saveLocalAction(action, 'point1')).rejects.toMatchObject({
            message: Constants.GET_ACTION_ERROR,
        })
    })
})

describe('delete local action', () => {
    it('with local success', async () => {
        jest.spyOn(LocalActionServices, 'deleteAction').mockReturnValueOnce(
            Promise.resolve(),
        )

        await expect(
            deleteLocalAction('one', 1, 'point1'),
        ).resolves.toBeUndefined()
    })

    it('with local failure', async () => {
        jest.spyOn(LocalActionServices, 'deleteAction').mockReturnValueOnce(
            Promise.reject(),
        )

        await expect(
            deleteLocalAction('one', 1, 'point1'),
        ).rejects.toMatchObject({ message: Constants.GET_ACTION_ERROR })
    })
})
