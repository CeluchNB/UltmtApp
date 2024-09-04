import { DisplayTeamFactory } from '../../test-data/team'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useRealm } from '@ultmt-app/context/realm'
import { useUndoAction } from '@ultmt-app/hooks/game-edit-actions/use-undo-action'
import { ActionSchema, PointSchema } from '@ultmt-app/models'
import { ActionType, LiveServerActionData } from '@ultmt-app/types/action'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import React, { ReactNode, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const receivingTeam = DisplayTeamFactory.build()
const pullingTeam = DisplayTeamFactory.build()

const point = PointFactory.build({ pullingTeam, receivingTeam })
const pointSchema = new PointSchema(point)

const action: LiveServerActionData = {
    actionNumber: 1,
    actionType: ActionType.PULL,
    teamNumber: 'one',
    tags: [],
    comments: [],
}

const actionSchema = new ActionSchema(action, point._id)

let realmData: import('realm')
const TestComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        realm.write(() => {
            realm.create('Action', actionSchema)
        })
    }, [realm])

    return (
        <LiveGameContext.Provider
            value={{ point: pointSchema } as LiveGameContextData}>
            {children}
        </LiveGameContext.Provider>
    )
}

describe('useUndoAction', () => {
    it('undoes action', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <TestComponent>{children}</TestComponent>
                </TopLevelComponent>
            )
        }
        const { result } = renderHook(() => useUndoAction(), { wrapper })

        await act(async () => {
            result.current.mutateAsync()
        })

        const actions = realmData
            .objects('Action')
            .filtered('pointId == $0', point._id)
        expect(actions.length).toBe(0)
    })
})
