import * as AuthServices from '../../../src/services/data/auth'
import * as LiveActionNetwork from '../../../src/services/network/live-action'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { ActionType, SubscriptionObject } from '../../../src/types/action'
import {
    addAction,
    addLiveComment,
    deleteLiveComment,
    joinPoint,
    nextPoint,
    subscribe,
    undoAction,
    unsubscribe,
} from '../../../src/services/data/live-action'

afterEach(() => {
    RNEncryptedStorage.getItem.mockReset()
    RNEncryptedStorage.setItem.mockReset()
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
