import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useCreateAction } from '@ultmt-app/hooks/game-edit-actions/use-create-action'
import { ActionType, LiveServerActionData } from '@ultmt-app/types/action'
import { GameSchema, PointSchema } from '@ultmt-app/models'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import React, { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const OfflineComponent = ({ children }: { children: ReactNode }) => {
    const game = GameFactory.build()
    const point = PointFactory.build()

    const gameSchema = GameSchema.createOfflineGame(game, [])
    const pointSchema = PointSchema.createOfflinePoint(point)

    return (
        <TopLevelComponent>
            <LiveGameContext.Provider
                value={
                    {
                        game: gameSchema,
                        point: pointSchema,
                        team: 'one',
                    } as LiveGameContextData
                }>
                {children}
            </LiveGameContext.Provider>
        </TopLevelComponent>
    )
}

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    const game = GameFactory.build()
    const point = PointFactory.build()

    const gameSchema = new GameSchema(game, false, [])
    const pointSchema = new PointSchema(point)

    return (
        <TopLevelComponent>
            <LiveGameContext.Provider
                value={
                    {
                        game: gameSchema,
                        point: pointSchema,
                        team: 'one',
                    } as LiveGameContextData
                }>
                {children}
            </LiveGameContext.Provider>
        </TopLevelComponent>
    )
}

describe('useCreateAction', () => {
    it('handles offline create', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(() => useCreateAction(), { wrapper })

        await act(async () => {
            const data = await result.current.mutateAsync({
                actionNumber: 0,
                actionType: ActionType.PULL,
                comments: [],
                tags: [],
            })

            expect(data?.actionNumber).toBe(1)
        })
    })

    it('handles online create action', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OnlineComponent>{children}</OnlineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(() => useCreateAction(), { wrapper })

        const expected: LiveServerActionData = {
            actionNumber: 0,
            actionType: ActionType.PULL,
            comments: [],
            tags: [],
            teamNumber: 'one',
        }
        await act(async () => {
            const data = await result.current.mutateAsync(expected)
            expect(data).toMatchObject(expected)
        })
    })
})
