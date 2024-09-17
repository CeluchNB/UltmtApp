import * as GameNetwork from '@ultmt-app/services/network/game'
import * as TeamNetwork from '@ultmt-app/services/network/team'
import { AxiosResponse } from 'axios'
import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import { TeamFactory } from '../../test-data/team'
import { TopLevelComponent } from './utils'
import { usePushFullGame } from '@ultmt-app/hooks/game-edit-actions/use-push-full-game'
import { useRealm } from '@ultmt-app/context/realm'
import {
    ActionSchema,
    GameSchema,
    PointSchema,
    TeamSchema,
} from '@ultmt-app/models'
import { ActionType, LiveServerActionData } from '@ultmt-app/types/action'
import React, { ReactNode, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const team = TeamFactory.build()
const game = GameFactory.build({
    teamOneScore: 0,
    teamTwoScore: 1,
    teamOne: { _id: team._id, name: team.name, place: team.place },
})
const point = PointFactory.build({
    gameId: game._id,
    teamOneScore: 0,
    teamTwoScore: 1,
})
const action1: LiveServerActionData = {
    actionNumber: 1,
    actionType: ActionType.PULL,
    teamNumber: 'one',
    tags: [],
    comments: [],
}
const action2: LiveServerActionData = {
    actionNumber: 1,
    actionType: ActionType.TEAM_TWO_SCORE,
    teamNumber: 'one',
    tags: [],
    comments: [],
}

const gameSchema = new GameSchema(game, true, [])
const pointSchema = new PointSchema(point)
const action1Schema = new ActionSchema(action1, point._id)
const action2Schema = new ActionSchema(action2, point._id)
const teamSchema = new TeamSchema(team)
let realmData: import('realm')

const TestComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
            realm.create('Point', pointSchema)
            realm.create('Action', action1Schema)
            realm.create('Action', action2Schema)
            realm.create('Team', teamSchema)
        })
    }, [realm])

    return <>{children}</>
}

describe('usePushFullGame', () => {
    it('successfully pushes simple game', async () => {
        const pushSpy = jest
            .spyOn(GameNetwork, 'pushOfflineGame')
            .mockReturnValue(
                Promise.resolve({
                    data: { guests: [] },
                    status: 201,
                    statusText: 'Good',
                } as AxiosResponse),
            )
        const teamSpy = jest
            .spyOn(TeamNetwork, 'getManagedTeam')
            .mockReturnValue(
                Promise.resolve({
                    data: { team },
                    status: 200,
                    statusText: 'Good',
                } as AxiosResponse),
            )
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <TestComponent>{children}</TestComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(() => usePushFullGame(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync(game._id)
        })

        expect(pushSpy).toHaveBeenCalled()
        expect(teamSpy).toHaveBeenCalled()

        const gameResult = realmData.objectForPrimaryKey('Game', game._id)
        expect(gameResult).toBeNull()

        const pointResult = realmData.objectForPrimaryKey('Point', point._id)
        expect(pointResult).toBeNull()

        const actionResult = realmData
            .objects('Action')
            .filtered('pointId == $0', point._id)
        expect(actionResult.length).toBe(0)
    })
})
