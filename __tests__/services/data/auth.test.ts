import * as AuthData from '../../../src/services/data/auth'
import * as AuthServices from '../../../src/services/network/auth'
import { AxiosResponse } from 'axios'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import jwt from 'jsonwebtoken'
import {
    hasValidAccessToken,
    isLoggedIn,
    login,
    logout,
    refreshToken,
    refreshTokenIfNecessary,
    withToken,
} from '../../../src/services/data/auth'

const validToken = jwt.sign({}, 'secret', { expiresIn: '1 hour' })
const errorText = 'Bad network call in test'

afterEach(() => {
    RNEncryptedStorage.getItem.mockReset()
    RNEncryptedStorage.setItem.mockReset()
})

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
        } as AxiosResponse),
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

    await expect(login('', '')).rejects.toBeDefined()
})

it('should handle network logout success', async () => {
    jest.spyOn(AuthServices, 'logout').mockReturnValueOnce(
        Promise.resolve({
            data: {},
            status: 200,
            statusText: 'Good',
            headers: {},
            config: {},
        } as AxiosResponse),
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

    await expect(logout()).rejects.toBeDefined()
    expect(RNEncryptedStorage.removeItem).toHaveBeenCalled()
})

describe('should handle is logged in', () => {
    it('should handle is logged in success', async () => {
        RNEncryptedStorage.getItem.mockReturnValue(Promise.resolve(validToken))

        const result = await isLoggedIn()
        expect(result).toBe(true)
    })

    it('with unfound refresh token', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(Promise.resolve(null))

        await expect(isLoggedIn()).rejects.toBeDefined()
    })

    it('with expired refresh token', async () => {
        const expToken = jwt.sign({ exp: 10 }, 'test')
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(expToken),
        )
        await expect(isLoggedIn()).rejects.toBeDefined()
    })

    it('with unfound access token', async () => {
        RNEncryptedStorage.getItem
            .mockReturnValueOnce(Promise.resolve(validToken))
            .mockReturnValueOnce(Promise.resolve(null))

        await expect(isLoggedIn()).rejects.toBeDefined()
    })
})

describe('refresh token', () => {
    it('should handle refresh token with refresh token', async () => {
        jest.spyOn(RNEncryptedStorage, 'getItem').mockReturnValueOnce(
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
            } as AxiosResponse),
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

        await expect(refreshToken()).rejects.toBeDefined()
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

        await expect(refreshToken()).rejects.toBeDefined()
    })
})

describe('should handle with token wrapper', () => {
    const networkCall = jest.fn()
    afterEach(async () => {
        networkCall.mockReset()
    })
    it('with no refresh', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(validToken),
        )
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
        expect(networkCall).toBeCalledWith(validToken, 'test')
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
                    toJSON: () => {
                        return { status: 401 }
                    },
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
            } as AxiosResponse),
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

        await expect(withToken(networkCall)).rejects.toBeDefined()
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

        await expect(withToken(networkCall)).rejects.toBeDefined()
    })
})

describe('has valid access token', () => {
    it('with no token', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(Promise.resolve(''))
        const result = await hasValidAccessToken()
        expect(result).toBe(false)
    })

    it('with expired token', async () => {
        const expToken = jwt.sign({ exp: 10 }, 'test')
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(expToken),
        )
        const result = await hasValidAccessToken()
        expect(result).toBe(false)
    })

    it('with valid token', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(validToken),
        )
        const result = await hasValidAccessToken()
        expect(result).toBe(true)
    })
})

describe('refresh token if necessary', () => {
    it('when unnecessary', async () => {
        RNEncryptedStorage.getItem.mockReturnValueOnce(
            Promise.resolve(validToken),
        )
        const spy = jest
            .spyOn(AuthData, 'refreshToken')
            .mockReturnValueOnce(Promise.resolve(validToken))

        await refreshTokenIfNecessary()
        expect(spy).not.toHaveBeenCalled()
    })

    it('when necessary', async () => {
        RNEncryptedStorage.getItem
            .mockReturnValueOnce(Promise.resolve(''))
            .mockReturnValueOnce(Promise.resolve(validToken))

        const spy = jest.spyOn(AuthServices, 'refreshToken')

        spy.mockReset()
        spy.mockReturnValueOnce(
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
            } as AxiosResponse),
        )

        await refreshTokenIfNecessary()
        expect(spy).toHaveBeenCalled()
    })
})
