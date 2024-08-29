import * as PointNetwork from '@ultmt-app/services/network/point'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { GameFactory } from '../../test-data/game'
import { GameSchema } from '@ultmt-app/models'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useFirstPoint } from '@ultmt-app/hooks/game-edit-actions/use-first-point'
import { useRealm } from '@ultmt-app/context/realm'
import React, { ReactNode, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-native'

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

const gameId = new BSON.ObjectId()
const game = GameFactory.build({ _id: gameId.toHexString() })
const point = PointFactory.build({ gameId: gameId.toHexString() })

let realmData: import('realm')

const OfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        const gameSchema = new GameSchema(game, true, [])
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
        })
    }, [realm])

    return <>{children}</>
}

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        const gameSchema = new GameSchema(game, false, [])
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
        })
    }, [realm])

    return <>{children}</>
}

describe('useFirstPoint', () => {
    it('handles offline', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(
            () => useFirstPoint(gameId.toHexString()),
            { wrapper },
        )

        // TODO: this isn't great
        await new Promise(r => setTimeout(r, 1000))
        await act(async () => {
            await result.current.mutateAsync('one')
        })

        const pointResult = realmData
            .objects('Point')
            .filtered('gameId == $0', gameId.toHexString())
        expect(pointResult.length).toBe(1)
    })

    it('handles online', async () => {
        const spy = jest.spyOn(PointNetwork, 'nextPoint').mockReturnValue(
            Promise.resolve({
                data: { point },
                status: 201,
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
            () => useFirstPoint(gameId.toHexString()),
            { wrapper },
        )

        // TODO: this isn't great
        await new Promise(r => setTimeout(r, 1000))
        await act(async () => {
            await result.current.mutateAsync('one')
        })

        expect(spy).toHaveBeenCalled()
        const pointResult = realmData
            .objects('Point')
            .filtered('gameId == $0', gameId.toHexString())
        expect(pointResult.length).toBe(1)
    })
})
