import * as PointNetwork from '@ultmt-app/services/network/point'
import { AxiosResponse } from 'axios'
import { DisplayTeamFactory } from '../../test-data/team'
import { GameFactory } from '../../test-data/game'
import { PointFactory } from '../../test-data/point'
import { TopLevelComponent } from './utils'
import { useSetPullingTeam } from '@ultmt-app/hooks/game-edit-actions/use-set-pulling-team'
import { GameSchema, PointSchema } from '@ultmt-app/models'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import React, { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const teamOne = DisplayTeamFactory.build()
const teamTwo = DisplayTeamFactory.build()
const offlineGame = GameFactory.build({ teamOne, teamTwo })
const offlinePoint = PointFactory.build({
    pullingTeam: DisplayTeamFactory.build(),
})

const offlineGameSchema = new GameSchema(offlineGame, true, [])
const offlinePointSchema = new PointSchema(offlinePoint)

const onlineGame = GameFactory.build({ teamOne, teamTwo })
const onlinePoint = PointFactory.build({
    pullingTeam: DisplayTeamFactory.build(),
})

const onlineGameSchema = new GameSchema(onlineGame, false, [])
const onlinePointSchema = new PointSchema(onlinePoint)

const OfflineComponent = ({ children }: { children: ReactNode }) => {
    return (
        <LiveGameContext.Provider
            value={
                {
                    game: offlineGameSchema,
                    point: offlinePointSchema,
                } as LiveGameContextData
            }>
            {children}
        </LiveGameContext.Provider>
    )
}

const OnlineComponent = ({ children }: { children: ReactNode }) => {
    return (
        <LiveGameContext.Provider
            value={
                {
                    game: onlineGameSchema,
                    point: onlinePointSchema,
                } as LiveGameContextData
            }>
            {children}
        </LiveGameContext.Provider>
    )
}

describe('useSetPullingTeam', () => {
    it('handles offline set', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <OfflineComponent>{children}</OfflineComponent>
                </TopLevelComponent>
            )
        }
        const { result } = renderHook(() => useSetPullingTeam(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync('one')
        })

        expect(offlinePointSchema?.pullingTeam._id).toBe(teamOne._id)
    })

    it('handles online set', async () => {
        const spy = jest.spyOn(PointNetwork, 'setPullingTeam').mockReturnValue(
            Promise.resolve({
                data: {
                    point: {
                        ...offlinePoint,
                        pullingTeam: teamOne,
                        receivingTeam: teamTwo,
                    },
                },
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
        const { result } = renderHook(() => useSetPullingTeam(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync('one')
        })

        expect(spy).toHaveBeenCalled()

        expect(onlinePointSchema?.pullingTeam._id).toBe(teamOne._id)
    })
})
