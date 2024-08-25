import * as PointNetwork from '@ultmt-app/services/network/point'
import { ActionType } from '@ultmt-app/types/action'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { GameFactory } from '../../test-data/game'
import { InGameStatsUserFactory } from '../../test-data/user'
import { PointFactory } from '../../test-data/point'
import { renderHook } from '@testing-library/react-native'
import { useBackPoint } from '@ultmt-app/hooks/game-edit-actions/use-back-point'
import { ActionSchema, GameSchema, PointSchema } from '@ultmt-app/models'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { ReactNode, useEffect, useState } from 'react'
import { RealmProvider, useRealm } from '@ultmt-app/context/realm'

const client = new QueryClient()

const setCurrentPointNumber = jest.fn()
const pointId = new BSON.ObjectId()
const lastPoint = PointFactory.build({ pointNumber: 1 })

const TopLevelComponent = ({ children }: { children: ReactNode }) => {
    return (
        <RealmProvider>
            <QueryClientProvider client={client}>
                {children}
            </QueryClientProvider>
        </RealmProvider>
    )
}

const OfflineGameComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()
    const game = GameFactory.build()
    const gameSchema = GameSchema.createOfflineGame(game, [])

    const point = PointFactory.build({
        pointNumber: 2,
        _id: pointId.toHexString(),
    })

    const pointSchema = PointSchema.createOfflinePoint(point)
    const [currentPoint, setCurrentPoint] = useState<PointSchema>()

    useEffect(() => {
        realm.write(() => {
            realm.deleteAll()
            realm.create('Point', PointSchema.createOfflinePoint(lastPoint))
            realm.create('Point', pointSchema)
            const pullAction = new ActionSchema(
                {
                    teamNumber: 'one',
                    comments: [],
                    actionNumber: 1,
                    actionType: ActionType.PULL,
                    tags: [],
                },
                point._id,
            )
            realm.create('Action', pullAction)
            const scoreAction = new ActionSchema(
                {
                    teamNumber: 'one',
                    comments: [],
                    actionNumber: 1,
                    actionType: ActionType.TEAM_TWO_SCORE,
                    tags: [],
                },
                point._id,
            )
            realm.create('Action', scoreAction)
        })
        const tempPoint = realm.objectForPrimaryKey<PointSchema>(
            'Point',
            pointSchema._id,
        )
        setCurrentPoint(tempPoint!)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={
                {
                    game: gameSchema,
                    point: currentPoint,
                    team: 'one',
                    setCurrentPointNumber,
                } as unknown as LiveGameContextData
            }>
            {children}
        </LiveGameContext.Provider>
    )
}

const OnlineGameComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()
    const game = GameFactory.build()
    const user = InGameStatsUserFactory.build()
    const gameSchema = new GameSchema(game, false, [
        { _id: lastPoint._id, pointStats: [user] },
    ])

    const point = PointFactory.build({
        pointNumber: 2,
        _id: pointId.toHexString(),
    })

    const pointSchema = new PointSchema(point)
    const [currentPoint, setCurrentPoint] = useState<PointSchema>()
    const [currentGame, setCurrentGame] = useState<GameSchema>()

    useEffect(() => {
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
            realm.create('Point', pointSchema)
            const pullAction = new ActionSchema(
                {
                    teamNumber: 'one',
                    comments: [],
                    actionNumber: 1,
                    actionType: ActionType.PULL,
                    tags: [],
                },
                point._id,
            )
            realm.create('Action', pullAction)
            const scoreAction = new ActionSchema(
                {
                    teamNumber: 'one',
                    comments: [],
                    actionNumber: 1,
                    actionType: ActionType.TEAM_TWO_SCORE,
                    tags: [],
                },
                point._id,
            )
            realm.create('Action', scoreAction)
        })
        const tempPoint = realm.objectForPrimaryKey<PointSchema>(
            'Point',
            pointSchema._id,
        )
        setCurrentPoint(tempPoint!)

        const tempGame = realm.objects<GameSchema>('Game')
        setCurrentGame(tempGame[0])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={
                {
                    game: currentGame,
                    point: currentPoint,
                    team: 'one',
                    setCurrentPointNumber,
                } as unknown as LiveGameContextData
            }>
            {children}
        </LiveGameContext.Provider>
    )
}

describe('useBackPoint', () => {
    it('handles offline back point', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineGameComponent>{children}</OfflineGameComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(
            () => useBackPoint(pointId.toHexString()),
            {
                wrapper,
            },
        )

        await result.current.mutateAsync()

        expect(setCurrentPointNumber).toHaveBeenCalledWith(1)
    })

    it('handles online back point', async () => {
        const spy = jest.spyOn(PointNetwork, 'backPoint').mockReturnValue(
            Promise.resolve({
                data: { actions: [], point: lastPoint },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OnlineGameComponent>{children}</OnlineGameComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(
            () => useBackPoint(pointId.toHexString()),
            {
                wrapper,
            },
        )

        await result.current.mutateAsync()

        expect(setCurrentPointNumber).toHaveBeenCalledWith(1)
        expect(spy).toHaveBeenCalled()
    })
})
