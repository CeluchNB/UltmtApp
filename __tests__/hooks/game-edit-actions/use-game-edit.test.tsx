import * as GameNetwork from '@ultmt-app/services/network/game'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { GameFactory } from '../../test-data/game'
import { GameSchema } from '@ultmt-app/models'
import { TopLevelComponent } from './utils'
import { useGameEditor } from '@ultmt-app/hooks'
import { useRealm } from '@ultmt-app/context/realm'
import React, { ReactNode, useEffect } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'

const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
        }),
    }
})

const onlineGameId = new BSON.ObjectId()
const onlineGame = GameFactory.build({ _id: onlineGameId.toHexString() })

let realmData: import('realm')

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        const gameSchema = new GameSchema(onlineGame, false, [])
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
        })
    }, [realm])

    return <>{children}</>
}

const offlineGameId = new BSON.ObjectId()
const offlineGame = GameFactory.build({ _id: offlineGameId.toHexString() })

const OfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        const gameSchema = new GameSchema(offlineGame, true, [])
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
        })
    }, [realm])

    return <>{children}</>
}

describe('useGameEdit', () => {
    it('handles online edit', async () => {
        const spy = jest.spyOn(GameNetwork, 'editGame').mockReturnValue(
            Promise.resolve({
                data: { game: { ...onlineGame, scoreLimit: 99 } },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OnlineComponent>{children}</OnlineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(
            () => useGameEditor(onlineGameId.toHexString()),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.game).not.toBeNull()
        })

        await act(async () => {
            await result.current.mutateAsync({ scoreLimit: 99 })
        })

        expect(spy).toHaveBeenCalled()

        const gameResult = realmData.objectForPrimaryKey(
            'Game',
            onlineGameId.toHexString(),
        )
        expect(gameResult?.scoreLimit).toBe(99)
    })

    it('handles offline edit', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(
            () => useGameEditor(offlineGameId.toHexString()),
            { wrapper },
        )

        await waitFor(() => {
            expect(result.current.game).not.toBeNull()
        })

        await act(async () => {
            await result.current.mutateAsync({ scoreLimit: 99 })
        })

        const gameResult = realmData.objectForPrimaryKey(
            'Game',
            offlineGameId.toHexString(),
        )
        expect(gameResult?.scoreLimit).toBe(99)
    })
})
