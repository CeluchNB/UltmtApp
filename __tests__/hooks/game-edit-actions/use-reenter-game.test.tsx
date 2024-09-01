import * as GameNetwork from '@ultmt-app/services/network/game'
import * as StatsNetwork from '@ultmt-app/services/network/stats'
import { AxiosResponse } from 'axios'
import { GameFactory } from '../../test-data/game'
import { LiveGameWizardState } from '@ultmt-app/types/game'
import { PointFactory } from '../../test-data/point'
import { TeamFactory } from '../../test-data/team'
import { TopLevelComponent } from './utils'
import { useRealm } from '@ultmt-app/context/realm'
import { useReenterGame } from '@ultmt-app/hooks/game-edit-actions/use-reenter-game'
import { GameSchema, PointSchema } from '@ultmt-app/models'
import React, { ReactNode, useEffect } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            addListener: jest.fn().mockReturnValue(() => {}),
            navigate: mockedNavigate,
        }),
    }
})

const team = TeamFactory.build()
const game = GameFactory.build({ teamOne: team })
const point = PointFactory.build({ gameId: game._id, pointNumber: 1 })

const NoPointOfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', new GameSchema(game, true, []))
        })
    }, [realm])

    return <>{children}</>
}

const ActivePointOfflineComponent = ({ children }: { children: ReactNode }) => {
    const realm = useRealm()

    useEffect(() => {
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', new GameSchema(game, true, []))
            realm.create('Point', new PointSchema(point))
        })
    }, [realm])

    return <>{children}</>
}

describe('useReenterGame', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('handles online reenter', async () => {
        const gameSpy = jest.spyOn(GameNetwork, 'reenterGame').mockReturnValue(
            Promise.resolve({
                data: {
                    game,
                    point: undefined,
                    actions: [],
                    token: 'token',
                },
                status: 200,
                statusText: 'Good',
            } as AxiosResponse),
        )
        const statsSpy = jest
            .spyOn(StatsNetwork, 'getGameStats')
            .mockReturnValue(
                Promise.resolve({
                    data: { game: { points: [] } },
                    status: 200,
                    statusText: 'Good',
                } as AxiosResponse),
            )
        const wrapper = ({ children }: { children: ReactNode }) => {
            return <TopLevelComponent>{children}</TopLevelComponent>
        }

        const { result } = renderHook(() => useReenterGame(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({
                gameId: game._id,
                teamId: team._id,
            })
        })

        expect(gameSpy).toHaveBeenCalled()
        expect(statsSpy).toHaveBeenCalled()
        expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
            screen: 'FirstPoint',
            params: {
                gameId: game._id,
                team: 'one',
            },
        })
    })

    it('handles offline reenter with no points', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <NoPointOfflineComponent>
                        {children}
                    </NoPointOfflineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(() => useReenterGame(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({
                gameId: game._id,
                teamId: team._id,
            })
        })

        expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
            screen: 'FirstPoint',
            params: {
                gameId: game._id,
                team: 'one',
            },
        })
    })

    it('handles offline reenter with point', async () => {
        const wrapper = ({ children }: { children: ReactNode }) => {
            return (
                <TopLevelComponent>
                    <ActivePointOfflineComponent>
                        {children}
                    </ActivePointOfflineComponent>
                </TopLevelComponent>
            )
        }

        const { result } = renderHook(() => useReenterGame(), { wrapper })

        await act(async () => {
            await result.current.mutateAsync({
                gameId: game._id,
                teamId: team._id,
            })
        })

        expect(mockedNavigate).toHaveBeenCalledWith('LiveGame', {
            screen: 'LiveGameEdit',
            params: {
                gameId: game._id,
                team: 'one',
                pointNumber: 1,
                state: LiveGameWizardState.SET_PLAYERS,
            },
        })
    })
})
