import * as Constants from '../../../src/utils/constants'
import * as LocalActionServices from '../../../src/services/local/action'
import * as LocalPointServices from '../../../src/services/local/point'
import Point from '../../../src/types/point'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { point } from '../../../fixtures/data'
import {
    ActionFactory,
    ActionType,
    ClientActionData,
    LiveServerActionData,
} from '../../../src/types/action'
import {
    createOfflineAction,
    deleteLocalAction,
    saveLocalAction,
    undoOfflineAction,
} from '../../../src/services/data/live-action'

afterEach(() => {
    RNEncryptedStorage.getItem.mockReset()
    RNEncryptedStorage.setItem.mockReset()
    jest.resetAllMocks()
})

describe('save local action', () => {
    it('successful substitution on team one', async () => {
        const action: LiveServerActionData = {
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
            Promise.resolve({ ...action, _id: 'actoion1', pointId: 'point1' }),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValue(
            Promise.resolve(point),
        )
        let savedPoint: Point | undefined
        jest.spyOn(LocalPointServices, 'savePoint').mockImplementation(
            async p => {
                savedPoint = p
                return undefined
            },
        )

        const { action: resultAction } = await saveLocalAction(action, 'point1')
        expect(resultAction).toMatchObject(
            ActionFactory.createFromAction(action),
        )
        expect(savedPoint?.teamOnePlayers.length).toBe(1)
        expect(savedPoint?.teamOnePlayers[0]).toMatchObject(
            action.playerTwo || {},
        )
    })

    it('successful substitution on team two', async () => {
        const action: LiveServerActionData = {
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
            Promise.resolve({ ...action, _id: 'actoion1', pointId: 'point1' }),
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

        const { action: resultAction } = await saveLocalAction(action, 'point1')
        expect(resultAction).toMatchObject(
            ActionFactory.createFromAction(action),
        )
        expect(savedPoint?.teamTwoPlayers.length).toBe(1)
        expect(savedPoint?.teamTwoPlayers[0]).toMatchObject(
            action.playerTwo || {},
        )
    })

    it('with non-substitution action', async () => {
        const action: LiveServerActionData = {
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
            Promise.resolve({ ...action, _id: 'actoion1', pointId: 'point1' }),
        )
        const mockGetPoint = jest
            .spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve(point))
        const mockSavePoint = jest
            .spyOn(LocalPointServices, 'savePoint')
            .mockImplementationOnce(async () => {
                return undefined
            })

        const { action: resultAction } = await saveLocalAction(action, 'point1')
        expect(resultAction).toMatchObject(
            ActionFactory.createFromAction(action),
        )
        expect(mockGetPoint).toHaveBeenCalled()
        expect(mockSavePoint).toHaveBeenCalled()
    })

    it('with malformed substitution', async () => {
        const action: LiveServerActionData = {
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
            Promise.resolve({ ...action, _id: 'actoion1', pointId: 'point1' }),
        )
        const mockGetPoint = jest
            .spyOn(LocalPointServices, 'getPointById')
            .mockReturnValueOnce(Promise.resolve(point))

        const mockSavePoint = jest
            .spyOn(LocalPointServices, 'savePoint')
            .mockImplementationOnce(async () => {
                return undefined
            })

        const { action: resultAction } = await saveLocalAction(action, 'point1')
        expect(resultAction).toMatchObject(
            ActionFactory.createFromAction(action),
        )
        expect(mockGetPoint).toHaveBeenCalled()
        expect(mockSavePoint).toHaveBeenCalled()
    })
})

describe('delete local action', () => {
    it('with local success', async () => {
        const action: LiveServerActionData = {
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
        jest.spyOn(LocalActionServices, 'deleteAction').mockReturnValueOnce(
            Promise.resolve(action),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(),
        )

        const { action: resultAction } = await deleteLocalAction(
            'one',
            1,
            'point1',
        )
        expect(resultAction).toMatchObject(action)
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

describe('create offline action', () => {
    it('successfully', async () => {
        const action: LiveServerActionData = {
            actionNumber: 1,
            actionType: ActionType.CATCH,
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

        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        jest.spyOn(LocalActionServices, 'upsertAction').mockReturnValueOnce(
            Promise.resolve({ ...action, _id: 'action1', pointId: 'point1' }),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(),
        )

        const { action: resultAction } = await createOfflineAction(
            {
                // action: {
                tags: [],
                actionType: action.actionType,
                playerOne: action.playerOne,
                playerTwo: action.playerTwo,
                // comments: [],
                // actionNumber: 1,
                // },
                // reporterDisplay: action.actionType,
                // viewerDisplay: action.actionType,
                // setPlayersAndUpdateViewerDisplay: jest.fn(),
                // setTags: jest.fn(),
            },
            'point1',
        )

        expect(resultAction).toMatchObject(
            ActionFactory.createFromAction(action),
        )
    })

    it('with failure', async () => {
        jest.spyOn(LocalPointServices, 'getPointById').mockRejectedValueOnce(
            Promise.resolve(),
        )

        await expect(
            createOfflineAction({} as ClientActionData, 'point1'),
        ).rejects.toMatchObject({ message: Constants.GET_ACTION_ERROR })
    })
})

describe('undo offline action', () => {
    it('with success', async () => {
        const action: LiveServerActionData = {
            actionNumber: 1,
            actionType: ActionType.CATCH,
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
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        jest.spyOn(LocalActionServices, 'deleteAction').mockReturnValueOnce(
            Promise.resolve(action),
        )
        jest.spyOn(LocalPointServices, 'getPointById').mockReturnValueOnce(
            Promise.resolve(point),
        )
        jest.spyOn(LocalPointServices, 'savePoint').mockReturnValueOnce(
            Promise.resolve(),
        )

        const { action: resultAction } = await undoOfflineAction('point1')
        expect(resultAction).toMatchObject(action)
    })

    it('with failure', async () => {
        jest.spyOn(LocalPointServices, 'getPointById').mockRejectedValueOnce(
            Promise.resolve(),
        )

        await expect(undoOfflineAction('point1')).rejects.toMatchObject({
            message: Constants.GET_ACTION_ERROR,
        })
    })
})
