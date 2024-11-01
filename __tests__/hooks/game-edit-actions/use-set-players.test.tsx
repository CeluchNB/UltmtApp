import * as PointNetwork from '@ultmt-app/services/network/point'
import { AxiosResponse } from 'axios'
import { DisplayUserFactory } from '../../test-data/user'
import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useRealm } from '@ultmt-app/context/realm'
import { useSetPlayers } from '@ultmt-app/hooks/game-edit-actions/use-set-players'
import { GameSchema, PointSchema } from '@ultmt-app/models'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import React, { ReactNode, useEffect } from 'react'
import { act, renderHook, waitFor } from '@testing-library/react-native'

const game = GameFactory.build()
const point1 = PointFactory.build({
    teamOnePlayers: [],
    teamOneActivePlayers: [],
})
const point2 = PointFactory.build({
    teamOnePlayers: [],
    teamOneActivePlayers: [],
})

let realmData: import('realm')

const OfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()
    const gameSchema = new GameSchema(game, true, [])

    useEffect(() => {
        realmData = realm

        realm.write(() => {
            realm.deleteAll()
            realm.create('Point', new PointSchema(point1))
        })
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={{ game: gameSchema } as LiveGameContextData}>
            {children}
        </LiveGameContext.Provider>
    )
}

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()
    const gameSchema = new GameSchema(game, false, [])

    useEffect(() => {
        realmData = realm

        realm.write(() => {
            realm.deleteAll()
            realm.create('Point', new PointSchema(point2))
        })
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={{ game: gameSchema } as LiveGameContextData}>
            {children}
        </LiveGameContext.Provider>
    )
}

describe('useSetPlayers', () => {
    it('handles offline set', async () => {
        const players = DisplayUserFactory.buildList(7)
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }
        const { result } = renderHook(
            () => useSetPlayers(point1._id, jest.fn()),
            { wrapper },
        )

        await new Promise(r => setTimeout(r, 1000))
        await act(async () => {
            await result.current.mutateAsync(players)
        })

        const pointResult = realmData.objectForPrimaryKey<PointSchema>(
            'Point',
            point1._id,
        )
        expect(pointResult?.teamOnePlayers.length).toBe(players.length)
        expect(pointResult?.teamOneActivePlayers.length).toBe(players.length)
        expect(pointResult?.teamOnePlayers[0].username).toBe(
            players[0].username,
        )
    })

    it('handles online set', async () => {
        const players = DisplayUserFactory.buildList(7)
        const spy = jest.spyOn(PointNetwork, 'setPlayers').mockReturnValue(
            Promise.resolve({
                data: {
                    point: {
                        ...point2,
                        teamOnePlayers: players,
                        teamOneActivePlayers: players,
                    },
                },
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
            () => useSetPlayers(point2._id, jest.fn()),
            { wrapper },
        )

        await new Promise(r => setTimeout(r, 1000))
        await act(async () => {
            await result.current.mutateAsync(players)
        })

        await waitFor(async () => {
            expect(spy).toHaveBeenCalled()
        })

        const pointResult = realmData.objectForPrimaryKey<PointSchema>(
            'Point',
            point2._id,
        )
        expect(pointResult?.teamOnePlayers.length).toBe(players.length)
        expect(pointResult?.teamOneActivePlayers.length).toBe(players.length)
    })
})
