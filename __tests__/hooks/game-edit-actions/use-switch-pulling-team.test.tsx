import { DisplayTeamFactory } from '../../test-data/team'
import { PointFactory } from '../../test-data/point'
import { PointSchema } from '@ultmt-app/models'
import { TopLevelComponent } from './utils'
import { useSwitchPullingTeam } from '@ultmt-app/hooks/game-edit-actions/use-switch-pulling-team'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import React, { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const receivingTeam = DisplayTeamFactory.build()
const pullingTeam = DisplayTeamFactory.build()

const point = PointFactory.build({ pullingTeam, receivingTeam })
const pointSchema = new PointSchema(point)

const TestComponent = ({ children }: { children: ReactNode }) => {
    return (
        <LiveGameContext.Provider
            value={{ point: pointSchema } as LiveGameContextData}>
            {children}
        </LiveGameContext.Provider>
    )
}

describe('useSwitchPullingTeam', () => {
    it('handles set', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <TestComponent>{children}</TestComponent>
                </TopLevelComponent>
            )
        }
        const { result } = renderHook(() => useSwitchPullingTeam(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync()
        })

        expect(pointSchema.pullingTeam._id).toBe(receivingTeam._id)
        expect(pointSchema.receivingTeam._id).toBe(pullingTeam._id)
    })
})
