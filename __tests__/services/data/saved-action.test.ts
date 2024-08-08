import * as ActionServices from '../../../src/services/network/saved-action'
import * as Constants from '../../../src/utils/constants'
import * as LocalServices from '../../../src/services/local/action'
import { AxiosResponse } from 'axios'
import { savedAction } from '../../../fixtures/data'
import {
    addComment,
    deleteComment,
} from '../../../src/services/data/saved-action'

describe('test add comment', () => {
    it('with successful network call', async () => {
        jest.spyOn(ActionServices, 'addComment').mockReturnValueOnce(
            Promise.resolve({
                data: { action: savedAction },
                config: {},
                status: 200,
                statusText: 'Good',
                headers: {},
            } as AxiosResponse),
        )
        const localSpy = jest
            .spyOn(LocalServices, 'saveDisplayActions')
            .mockReturnValueOnce(Promise.resolve())

        const result = await addComment('action1', 'point1', 'Test')

        expect(localSpy).toHaveBeenCalledWith('point1', [savedAction])
        expect(result).toMatchObject(savedAction)
    })

    it('with unsuccessful network call', async () => {
        jest.spyOn(ActionServices, 'addComment').mockReturnValueOnce(
            Promise.reject({
                data: {},
                config: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
            }),
        )
        const localSpy = jest
            .spyOn(LocalServices, 'saveDisplayActions')
            .mockReturnValueOnce(Promise.resolve())
        localSpy.mockReset()

        await expect(
            addComment('action1', 'point1', 'Test'),
        ).rejects.toMatchObject({ message: Constants.GENERIC_GET_TOKEN_ERROR })
        expect(localSpy).not.toHaveBeenCalled()
    })
})

describe('delete comment', () => {
    it('with successful network call', async () => {
        jest.spyOn(ActionServices, 'deleteComment').mockReturnValueOnce(
            Promise.resolve({
                data: { action: savedAction },
                config: {},
                status: 200,
                statusText: 'Good',
                headers: {},
            } as AxiosResponse),
        )
        const localSpy = jest
            .spyOn(LocalServices, 'saveDisplayActions')
            .mockReturnValueOnce(Promise.resolve())

        const result = await deleteComment('action1', '1', 'point1')

        expect(localSpy).toHaveBeenCalledWith('point1', [savedAction])
        expect(result).toMatchObject(savedAction)
    })

    it('with unsuccessful network call', async () => {
        jest.spyOn(ActionServices, 'deleteComment').mockReturnValueOnce(
            Promise.reject({
                data: {},
                config: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
            }),
        )
        const localSpy = jest
            .spyOn(LocalServices, 'saveDisplayActions')
            .mockReturnValueOnce(Promise.resolve())
        localSpy.mockReset()

        await expect(
            deleteComment('action1', '1', 'point1'),
        ).rejects.toMatchObject({ message: Constants.GENERIC_GET_TOKEN_ERROR })
        expect(localSpy).not.toHaveBeenCalled()
    })
})
