import * as TeamNetwork from '@ultmt-app/services/network/team'
import { AxiosResponse } from 'axios'
import { DisplayUserFactory } from '../../test-data/user'
import { GameFactory } from '../../test-data/game'
import { TeamFactory } from '../../test-data/team'
import { useAddGuest } from '@ultmt-app/hooks/game-edit-actions/use-add-guest'
import { withRealm } from '../../utils/renderers'
import { GameSchema, TeamSchema } from '@ultmt-app/models'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const client = new QueryClient()

const gameObject = GameFactory.build()

const offlineGameSchema = new GameSchema(gameObject, true, [])
const onlineGameSchema = new GameSchema(gameObject, false, [])

const team = TeamFactory.build({ _id: gameObject.teamOne._id, players: [] })
let realmData: import('realm')

const getWrapper = (game: GameSchema) => {
    const wrapper = ({ children }: { children: ReactNode }) => {
        return withRealm(
            <QueryClientProvider client={client}>
                <LiveGameContext.Provider
                    value={{ game } as LiveGameContextData}>
                    {children}
                </LiveGameContext.Provider>
            </QueryClientProvider>,
            realm => {
                realmData = realm
                realm.write(() => {
                    realm.deleteAll()
                    realm.create('Team', team)
                })
            },
        )
    }
    return wrapper
}

describe('useAddGuest', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('handles offline guest creation', async () => {
        const { result } = renderHook(() => useAddGuest(team._id), {
            wrapper: getWrapper(offlineGameSchema),
        })

        await act(async () => {
            await result.current.mutateAsync({
                firstName: 'First',
                lastName: 'Last',
            })
        })

        const newTeam = realmData.objectForPrimaryKey<TeamSchema>(
            'Team',
            team._id,
        )
        expect(newTeam?.players.length).toBe(1)
        expect(newTeam?.players[0]).toMatchObject({
            firstName: 'First',
            lastName: 'Last',
        })
    })

    it('handles online guest creation', async () => {
        const spy = jest.spyOn(TeamNetwork, 'createGuest').mockReturnValue(
            Promise.resolve({
                data: {
                    team: {
                        ...team,
                        players: [
                            DisplayUserFactory.build({
                                firstName: 'First',
                                lastName: 'Last',
                            }),
                        ],
                    },
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        const { result } = renderHook(() => useAddGuest(team._id), {
            wrapper: getWrapper(onlineGameSchema),
        })

        await act(async () => {
            await result.current.mutateAsync({
                firstName: 'First',
                lastName: 'Last',
            })
        })

        expect(spy).toHaveBeenCalled()
    })
})
