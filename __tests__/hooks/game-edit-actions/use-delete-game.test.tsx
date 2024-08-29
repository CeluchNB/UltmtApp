import * as GameNetwork from '@ultmt-app/services/network/game'
import { ActionType } from '@ultmt-app/types/action'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { TopLevelComponent } from './utils'
import { renderHook } from '@testing-library/react-native'
import { useDeleteGame } from '@ultmt-app/hooks/game-edit-actions/use-delete-game'
import { useRealm } from '@ultmt-app/context/realm'
import { ActionSchema, GameSchema, PointSchema } from '@ultmt-app/models'
import React, { ReactNode, useEffect } from 'react'

const game = GameFactory.build()
const gameSchema = new GameSchema(game, false, [])
const point = PointFactory.build({ gameId: game._id })
const pointSchema = new PointSchema(point)
const actionId = new BSON.ObjectId()
const actionSchema = new ActionSchema(
    {
        actionType: ActionType.PULL,
        teamNumber: 'one',
        actionNumber: 1,
        tags: [],
        comments: [],
    },
    point._id,
    actionId,
)

// TODO: need to fix this. Just get realm from global import? Fix in other places too
let realmData: import('realm')

const GameComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realmData = realm
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
            realm.create('Point', pointSchema)
            realm.create('Action', actionSchema)
        })
    })

    return <>{children}</>
}

const wrapper = ({ children }: { children: ReactNode }) => {
    return (
        <TopLevelComponent>
            <GameComponent>{children}</GameComponent>
        </TopLevelComponent>
    )
}

describe('useDeleteGame', () => {
    it('deletes game', async () => {
        const spy = jest.spyOn(GameNetwork, 'deleteGame').mockReturnValue(
            Promise.resolve({
                data: {},
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        const { result } = renderHook(() => useDeleteGame(), {
            wrapper,
        })

        await result.current.mutateAsync({
            gameId: game._id,
            teamId: game.teamOne._id,
        })

        expect(spy).toHaveBeenCalled()
        expect(RNEncryptedStorage.setItem).toHaveBeenCalled()

        const gameResult = realmData.objectForPrimaryKey('Game', game._id)
        expect(gameResult).toBeNull()

        const pointResult = realmData.objectForPrimaryKey('Point', point._id)
        expect(pointResult).toBeNull()

        const actionResult = realmData.objectForPrimaryKey('Action', actionId)
        expect(actionResult).toBeNull()
    })
})
