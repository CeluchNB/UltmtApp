import * as UserServices from '../../../src/services/network/user'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { CreateUserData, DisplayUser, User } from '../../../src/types/user'
import {
    changeEmail,
    changeName,
    changePassword,
    createAccount,
    deleteAccount,
    fetchProfile,
    getPublicUser,
    joinTeamByCode,
    leaveManagerRole,
    leaveTeam,
    requestPasswordRecovery,
    resetPassword,
    searchUsers,
    setOpenToRequests,
    setPrivate,
} from '../../../src/services/data/user'

const validToken = 'token1'
const errorText = 'Bad network call in test'
const user: User = {
    _id: 'id',
    firstName: 'first',
    lastName: 'last',
    username: 'firstlast',
    email: 'email@email.com',
    requests: [],
    playerTeams: [],
    managerTeams: [],
    archiveTeams: [],
    stats: [],
    openToRequests: true,
    private: false,
}

const displayUsers: DisplayUser[] = [
    {
        _id: 'id',
        firstName: 'first',
        lastName: 'last',
        username: 'firstlast',
    },
    {
        _id: 'id2',
        firstName: 'first2',
        lastName: 'last2',
        username: 'firstlast2',
    },
]

const createUser: CreateUserData = {
    firstName: 'first',
    lastName: 'last',
    username: 'firstlast',
    email: 'email@email.com',
    password: 'Pass1234!',
}

describe('test user data calls', () => {
    beforeEach(() => {
        RNEncryptedStorage.setItem.mockReset()
        RNEncryptedStorage.removeItem.mockReset()
    })

    it('should handle network fetch profile success', async () => {
        jest.spyOn(UserServices, 'fetchProfile').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await fetchProfile()
        expect(result).toEqual(user)
    })

    it('should handle network fetch profile failure', async () => {
        jest.spyOn(UserServices, 'fetchProfile').mockReturnValueOnce(
            Promise.reject({
                data: { message: errorText },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(fetchProfile()).rejects.toThrow()
    })

    it('should handle network create account success', async () => {
        jest.spyOn(UserServices, 'createAccount').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    user,
                    tokens: { access: validToken, refresh: validToken },
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await createAccount(createUser)
        expect(result).toEqual({ user })
        expect(RNEncryptedStorage.setItem).toHaveBeenCalled()
    })

    it('should handle network create account failure', async () => {
        jest.spyOn(UserServices, 'createAccount').mockReturnValueOnce(
            Promise.reject({
                data: { message: errorText },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(createAccount(createUser)).rejects.toThrow()
        expect(RNEncryptedStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle too few search characters correctly', () => {
        expect(searchUsers('')).rejects.toThrow()
    })

    it('should handle network search users success', async () => {
        jest.spyOn(UserServices, 'searchUsers').mockReturnValueOnce(
            Promise.resolve({
                data: { users: displayUsers },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await searchUsers('123')
        expect(result).toEqual(displayUsers)
    })

    it('should handle network search users failure', () => {
        jest.spyOn(UserServices, 'searchUsers').mockReturnValueOnce(
            Promise.reject({
                data: { message: errorText },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(searchUsers('123')).rejects.toThrow()
    })

    it('should handle network leave team success', async () => {
        jest.spyOn(UserServices, 'leaveTeam').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await leaveTeam('')
        expect(result).toEqual(user)
    })

    it('should handle network leave team failure', async () => {
        jest.spyOn(UserServices, 'leaveTeam').mockReturnValueOnce(
            Promise.reject({
                data: { user },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(leaveTeam('')).rejects.toThrow()
    })

    it('should handle network get public user success', async () => {
        jest.spyOn(UserServices, 'getPublicUser').mockReturnValueOnce(
            Promise.resolve({
                data: user,
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await getPublicUser('')
        expect(result).toEqual(user)
    })

    it('should handle network get public team failure', async () => {
        jest.spyOn(UserServices, 'getPublicUser').mockReturnValueOnce(
            Promise.reject({
                data: { message: errorText },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(getPublicUser('')).rejects.toThrow()
    })

    it('should handle network leave manager role success', async () => {
        jest.spyOn(UserServices, 'leaveManagerRole').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await leaveManagerRole('')
        expect(result).toEqual(user)
    })

    it('should handle network leave manager role failure', async () => {
        jest.spyOn(UserServices, 'leaveManagerRole').mockReturnValueOnce(
            Promise.reject({
                data: { message: errorText },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        expect(leaveManagerRole('')).rejects.toThrow()
    })

    it('should handle request password recovery network success', async () => {
        jest.spyOn(UserServices, 'requestPasswordRecovery').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await requestPasswordRecovery('')
        expect(result).toBeUndefined()
    })

    it('should handle request password recovery network failure', async () => {
        jest.spyOn(UserServices, 'requestPasswordRecovery').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        expect(requestPasswordRecovery('')).rejects.toThrow()
    })

    it('should handle reset password network success', async () => {
        jest.spyOn(UserServices, 'resetPassword').mockReturnValueOnce(
            Promise.resolve({
                data: {
                    user,
                    tokens: { access: validToken, refresh: validToken },
                },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await resetPassword('', '')
        expect(result.user).toBe(user)
        expect(RNEncryptedStorage.setItem).toBeCalledTimes(2)
    })

    it('should handle reset password network failure', async () => {
        jest.spyOn(UserServices, 'resetPassword').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        expect(resetPassword('', '')).rejects.toThrow()
    })

    it('should handle set open to requests network success', async () => {
        jest.spyOn(UserServices, 'setOpenToRequests').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await setOpenToRequests(true)
        expect(result).toBe(user)
    })

    it('should handle set open to requests network failure', async () => {
        jest.spyOn(UserServices, 'setOpenToRequests').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )
        expect(setOpenToRequests(true)).rejects.toThrow()
    })

    it('should handle change name network success', async () => {
        jest.spyOn(UserServices, 'changeName').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await changeName('', '')
        expect(result).toBe(user)
    })

    it('should handle change name network failure', async () => {
        jest.spyOn(UserServices, 'changeName').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(changeName('', '')).rejects.toThrow()
    })

    it('should handle set private network success', async () => {
        jest.spyOn(UserServices, 'setPrivate').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )
        const result = await setPrivate(true)
        expect(result).toBe(user)
    })

    it('should handle set private network failure', async () => {
        jest.spyOn(UserServices, 'setPrivate').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(setPrivate(true)).rejects.toThrow()
    })

    it('should handle change email network success', async () => {
        jest.spyOn(UserServices, 'changeEmail').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await changeEmail('', '', '')
        expect(result).toBe(user)
    })

    it('should handle change email network failure', async () => {
        jest.spyOn(UserServices, 'changeEmail').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(changeEmail('', '', '')).rejects.toThrow()
    })

    it('should handle change password network success', async () => {
        jest.spyOn(UserServices, 'changePassword').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await changePassword('', '', '')
        expect(result).toBe(user)
    })

    it('should handle change password network failure', async () => {
        jest.spyOn(UserServices, 'changePassword').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(changePassword('', '', '')).rejects.toThrow()
    })

    it('should handle delete account network success', async () => {
        jest.spyOn(UserServices, 'deleteAccount').mockReturnValueOnce(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        await expect(deleteAccount()).resolves.toEqual(undefined)
        expect(RNEncryptedStorage.removeItem).toHaveBeenCalledTimes(2)
    })

    it('should handle delete account network failure', async () => {
        jest.spyOn(UserServices, 'deleteAccount').mockReturnValueOnce(
            Promise.reject({
                data: {},
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        await expect(deleteAccount()).rejects.toBeDefined()
        expect(RNEncryptedStorage.removeItem).toHaveBeenCalledTimes(2)
    })

    it('should handle join team by code network success', async () => {
        jest.spyOn(UserServices, 'joinTeamByCode').mockReturnValueOnce(
            Promise.resolve({
                data: { user },
                status: 200,
                statusText: 'Good',
                headers: {},
                config: {},
            }),
        )

        const result = await joinTeamByCode('')
        expect(result).toEqual(user)
    })

    it('should hanlde join team by code network failure', async () => {
        jest.spyOn(UserServices, 'joinTeamByCode').mockReturnValueOnce(
            Promise.reject({
                data: { message: 'error' },
                status: 400,
                statusText: 'Bad',
                headers: {},
                config: {},
            }),
        )

        expect(joinTeamByCode('')).rejects.toThrow()
    })
})
