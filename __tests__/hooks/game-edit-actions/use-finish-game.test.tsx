import * as GameNetwork from '@ultmt-app/services/network/game'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useFinishGame } from '@ultmt-app/hooks/game-edit-actions/use-finish-game'
import { useRealm } from '@ultmt-app/context/realm'
import { ActionSchema, GameSchema, PointSchema } from '@ultmt-app/models'
import { ActionType, LiveServerActionData } from '@ultmt-app/types/action'
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
const action1: LiveServerActionData = {
    teamNumber: 'one',
    actionNumber: 1,
    actionType: ActionType.PULL,
    comments: [],
    tags: [],
}

const action2: LiveServerActionData = {
    teamNumber: 'one',
    actionNumber: 2,
    actionType: ActionType.TEAM_TWO_SCORE,
    comments: [],
    tags: [],
}

let realmData: import('realm')

const OfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        const gameSchema = new GameSchema(game, true, [])
        const pointSchema = new PointSchema(point)
        const action1Schema = new ActionSchema(action1, point._id)
        const action2Schema = new ActionSchema(action2, point._id)
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
            realm.create('Point', pointSchema)
            realm.create('Action', action1Schema)
            realm.create('Action', action2Schema)
        })
    }, [realm])

    return <>{children}</>
}

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        const gameSchema = new GameSchema(game, false, [])
        const pointSchema = new PointSchema(point)
        const action1Schema = new ActionSchema(action1, point._id)
        const action2Schema = new ActionSchema(action2, point._id)
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
            realm.create('Point', pointSchema)
            realm.create('Action', action1Schema)
            realm.create('Action', action2Schema)
        })
    }, [realm])

    return <>{children}</>
}

describe('useFinishGame', () => {
    it('handles offline', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }
        const { result } = renderHook(
            () => useFinishGame(gameId.toHexString()),
            { wrapper },
        )

        // TODO: this isn't great
        await new Promise(r => setTimeout(r, 1000))
        await act(async () => {
            await result.current.mutateAsync()
        })

        expect(mockedNavigate).toHaveBeenCalled()

        const gameResult = realmData.objectForPrimaryKey(
            'Game',
            gameId.toHexString(),
        )
        expect(gameResult?.teamTwoScore).toBe(point.teamTwoScore + 1)

        const pointResult = realmData.objectForPrimaryKey('Point', point._id)
        expect(pointResult?.teamTwoScore).toBe(point.teamTwoScore + 1)
    })

    it('handles online', async () => {
        const spy = jest.spyOn(GameNetwork, 'finishGame').mockReturnValue(
            Promise.resolve({
                data: {},
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
            () => useFinishGame(gameId.toHexString()),
            { wrapper },
        )

        // TODO: this isn't great
        await new Promise(r => setTimeout(r, 1000))
        await act(async () => {
            await result.current.mutateAsync()
        })

        expect(mockedNavigate).toHaveBeenCalled()
        expect(spy).toHaveBeenCalled()

        const gameResult = realmData.objectForPrimaryKey(
            'Game',
            gameId.toHexString(),
        )
        expect(gameResult).toBeNull()

        const pointResult = realmData.objectForPrimaryKey('Point', point._id)
        expect(pointResult).toBeNull()
    })
})
