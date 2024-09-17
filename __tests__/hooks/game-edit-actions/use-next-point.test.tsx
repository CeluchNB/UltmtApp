import * as PointNetwork from '@ultmt-app/services/network/point'
import { AxiosResponse } from 'axios'
import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useNextPoint } from '@ultmt-app/hooks/game-edit-actions/use-next-point'
import { useRealm } from '@ultmt-app/context/realm'
import { ActionSchema, GameSchema, PointSchema } from '@ultmt-app/models'
import { ActionType, LiveServerActionData } from '@ultmt-app/types/action'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import React, { ReactNode, useEffect, useState } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const game = GameFactory.build()
const point = PointFactory.build({
    pointNumber: 1,
    teamOneScore: 0,
    teamTwoScore: 0,
})

const offlineGameSchema = new GameSchema(game, true, [])
const onlineGameSchema = new GameSchema(game, false, [])
const pointSchema = new PointSchema(point)

const liveActionData: LiveServerActionData = {
    actionNumber: 2,
    actionType: ActionType.TEAM_ONE_SCORE,
    tags: [],
    comments: [],
    teamNumber: 'one',
}
const actionSchema = new ActionSchema(liveActionData, point._id)
const setCurrentPointNumber = jest.fn()

let realmData: import('realm')
const OfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        realm.write(() => {
            realm.deleteAll()
            realm.create('Action', actionSchema)
        })
        return () => {
            realm.close()
        }
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={
                {
                    game: offlineGameSchema,
                    point: pointSchema,
                    team: 'one',
                    setCurrentPointNumber,
                } as unknown as LiveGameContextData
            }>
            {children}
        </LiveGameContext.Provider>
    )
}

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()
    const [currentPoint, setCurrentPoint] = useState<PointSchema | null>()

    useEffect(() => {
        realmData = realm
        realm.write(() => {
            realm.deleteAll()
            realm.create('Point', pointSchema)
            realm.create('Action', actionSchema)
        })
        const newPoint = realm.objectForPrimaryKey<PointSchema>(
            'Point',
            point._id,
        )
        setCurrentPoint(newPoint)
        return () => {
            realm.close()
        }
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={
                {
                    game: onlineGameSchema,
                    point: currentPoint,
                    team: 'one',
                    setCurrentPointNumber,
                } as unknown as LiveGameContextData
            }>
            {children}
        </LiveGameContext.Provider>
    )
}

describe('useNextPoint', () => {
    it('handles offline next point', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }
        const { result } = renderHook(() => useNextPoint(point._id), {
            wrapper,
        })

        await act(async () => {
            await result.current.mutateAsync({
                pullingTeam: 'one',
                emitNextPoint: jest.fn(),
            })
        })

        expect(setCurrentPointNumber).toHaveBeenCalled()

        const newPoint = realmData
            .objects<PointSchema>('Point')
            .filtered('pointNumber == $0 && gameId == $1', 2, game._id)[0]

        expect(newPoint.teamOneScore).toBe(1)
    })

    it('handles online next point', async () => {
        const spy = jest.spyOn(PointNetwork, 'nextPoint').mockReturnValue(
            Promise.resolve({
                data: {
                    point: PointFactory.build({
                        pointNumber: 2,
                        gameId: game._id,
                    }),
                },
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
        const { result } = renderHook(() => useNextPoint(point._id), {
            wrapper,
        })

        await act(async () => {
            await result.current.mutateAsync({
                pullingTeam: 'one',
                emitNextPoint: jest.fn(),
            })
        })

        expect(spy).toHaveBeenCalled()
        expect(setCurrentPointNumber).toHaveBeenCalled()

        // const newPoint = realmData
        //     .objects<PointSchema>('Point')
        //     .filtered('pointNumber == $0 && gameId == $1', 2, game._id)[0]

        // expect(newPoint.teamOneScore).toBe(1)
    })
})
