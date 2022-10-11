import * as AuthServices from '../../../src/services/network/auth'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { getAccessToken, login, logout } from '../../../src/services/data/auth'

const validToken = 'token1'
const errorText = 'Bad network call in test'

it('should handle network login success', async () => {
    jest.spyOn(AuthServices, 'login').mockReturnValue(
        Promise.resolve({
            data: {
                tokens: { access: validToken, refresh: validToken },
            },
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )

    const token = await login('', '')
    expect(token).toEqual(validToken)
    expect(RNEncryptedStorage.setItem).toHaveBeenCalled()
})

it('should handle network login failures', async () => {
    jest.spyOn(AuthServices, 'login').mockReturnValue(
        Promise.reject({
            data: { message: errorText },
            status: 400,
            statusText: 'Bad',
            headers: {},
            config: {},
        }),
    )

    expect(login('', '')).rejects.toThrow()
})

it('should handle network logout success', async () => {
    jest.spyOn(AuthServices, 'logout').mockReturnValueOnce(
        Promise.resolve({
            data: {},
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )

    await logout(validToken)
    expect(RNEncryptedStorage.removeItem).toHaveBeenCalled()
})

it('should handle network logout failure', async () => {
    jest.spyOn(AuthServices, 'logout').mockReturnValueOnce(
        Promise.reject({
            data: {},
            status: 400,
            statusText: 'Bad',
            headers: {},
            config: {},
        }),
    )

    expect(logout(validToken)).rejects.toThrow()
    expect(RNEncryptedStorage.removeItem).toHaveBeenCalled()
})

it('should handle get local token success', async () => {
    RNEncryptedStorage.getItem.mockReturnValueOnce(Promise.resolve(validToken))

    const result = await getAccessToken()
    expect(result).toBe(validToken)
})

it('should handle unfound local token', async () => {
    RNEncryptedStorage.getItem.mockReturnValueOnce(Promise.reject(null))

    expect(getAccessToken()).rejects.toThrow()
})

it('should handle get local token failure', () => {
    jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValueOnce(
        Promise.reject(validToken),
    )

    expect(getAccessToken()).rejects.toThrow()
})
