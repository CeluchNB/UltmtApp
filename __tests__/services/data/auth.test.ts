import * as AuthServices from '../../../src/services/network/auth'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import {
    isLoggedIn,
    login,
    logout,
    refreshToken,
    withToken,
} from '../../../src/services/data/auth'

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

    await login('', '')
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

    await logout()
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

    expect(logout()).rejects.toThrow()
    expect(RNEncryptedStorage.removeItem).toHaveBeenCalled()
})

it('should handle get local token success', async () => {
    RNEncryptedStorage.getItem.mockReturnValueOnce(Promise.resolve(validToken))

    const result = await isLoggedIn()
    expect(result).toBe(true)
})

it('should handle unfound local token', async () => {
    RNEncryptedStorage.getItem.mockReturnValueOnce(Promise.reject(null))

    expect(isLoggedIn()).rejects.toThrow()
})

it('should handle get local token failure', () => {
    jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValueOnce(
        Promise.reject(validToken),
    )

    expect(isLoggedIn()).rejects.toThrow()
})

it('should handle refresh token with refresh token', async () => {
    jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValueOnce(
        Promise.resolve(validToken),
    )
    jest.spyOn(AuthServices, 'refreshToken').mockReturnValueOnce(
        Promise.resolve({
            data: {
                tokens: { access: validToken, refresh: 'refresh.token.adsf' },
            },
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        }),
    )

    const token = await refreshToken()
    expect(token).toBe(validToken)
    expect(RNEncryptedStorage.setItem).toBeCalledWith(
        'access_token',
        validToken,
    )
    expect(RNEncryptedStorage.setItem).toBeCalledWith(
        'refresh_token',
        'refresh.token.adsf',
    )
})

it('should handle refresh token with unfound refresh token', async () => {
    jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValueOnce(
        Promise.resolve(''),
    )

    expect(refreshToken()).rejects.toThrow()
})

it('should handle refresh token with network error', async () => {
    jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValueOnce(
        Promise.resolve(validToken),
    )
    jest.spyOn(AuthServices, 'refreshToken').mockReturnValueOnce(
        Promise.reject({
            data: {},
            status: 400,
            statusText: 'Bad',
            headers: {},
            config: {},
        }),
    )

    expect(refreshToken()).rejects.toThrow()
})

describe('should handle with token wrapper', () => {
    const networkCall = jest.fn()
    afterEach(async () => {
        networkCall.mockReset()
    })
    it('with no refresh', async () => {
        networkCall.mockReturnValueOnce(
            Promise.resolve({
                data: {
                    account: 'valid',
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await withToken(networkCall, 'test')
        expect(networkCall).toBeCalledWith('', ['test'])
        expect(result.status).toBe(200)
        expect(result.data.account).toBe('valid')
    })

    it('with successful refresh', async () => {
        networkCall
            .mockReturnValueOnce(
                Promise.reject({
                    data: {},
                    status: 401,
                    statusText: 'Unauth',
                    headers: {},
                    config: {},
                }),
            )
            .mockReturnValueOnce(
                Promise.resolve({
                    data: {
                        account: 'valid',
                    },
                    status: 200,
                    statusText: 'Good',
                    headers: {},
                    config: {},
                }),
            )

        jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValue(
            Promise.resolve(validToken),
        )
        jest.spyOn(AuthServices, 'refreshToken').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    tokens: {
                        access: validToken,
                        refresh: 'refresh.token.adsf',
                    },
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await withToken(networkCall)
        expect(result.status).toBe(200)
        expect(result.data.account).toBe('valid')
    })

    it('with failed refresh', async () => {
        networkCall.mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 401,
                statusText: 'Unauth',
                headers: {},
                config: {},
            }),
        )

        jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValue(
            Promise.resolve(validToken),
        )
        jest.spyOn(AuthServices, 'refreshToken').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 401,
                statusText: 'Unauth',
                headers: {},
                config: {},
            }),
        )

        expect(withToken(networkCall)).rejects.toThrow()
    })

    it('with failed network call', async () => {
        networkCall.mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 401,
                statusText: 'Unauth',
                headers: {},
                config: {},
            }),
        )

        expect(withToken(networkCall)).rejects.toThrow()
    })
})
