import * as GameNetwork from '@ultmt-app/services/network/game'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { DisplayTeamFactory } from '../../test-data/team'
import { GameFactory } from '../../test-data/game'
import RNEncryptedStorage from '../../../__mocks__/react-native-encrypted-storage'
import { TopLevelComponent } from './utils'
import { useJoinGame } from '@ultmt-app/hooks/game-edit-actions/use-join-game'
import { useRealm } from '@ultmt-app/context/realm'
import {
    CreateGameContext,
    CreateGameContextData,
} from '@ultmt-app/context/create-game-context'
import React, { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const teamOne = DisplayTeamFactory.build()
const gameId = new BSON.ObjectId()

let realm: import('realm')
const TestComponent = ({ children }: { children: ReactNode }) => {
    realm = useRealm()

    return (
        <CreateGameContext.Provider
            value={{ teamOne } as CreateGameContextData}>
            {children}
        </CreateGameContext.Provider>
    )
}

describe('useJoinGame', () => {
    it('handles success', async () => {
        const spy = jest.spyOn(GameNetwork, 'joinGame').mockReturnValue(
            Promise.resolve({
                data: {
                    game: GameFactory.build({ _id: gameId.toHexString() }),
                    token: 'token',
                },
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

        const { result } = renderHook(() => useJoinGame(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({ gameId: 'game', code: '123456' })
        })

        expect(spy).toHaveBeenCalled()
        expect(RNEncryptedStorage.setItem).toHaveBeenCalled()
        const gameResult = realm.objectForPrimaryKey(
            'Game',
            gameId.toHexString(),
        )
        expect(gameResult).not.toBeNull()
    })
})
