import { ActionType } from '@ultmt-app/types/action'
import { LiveGameWizardState } from '@ultmt-app/types/game'
import { useLiveGameWizard } from '@ultmt-app/hooks/game-edit-actions/use-live-game-wizard'
import {
    LiveGameContext,
    LiveGameContextData,
} from '@ultmt-app/context/live-game-context'
import {
    PointEditContext,
    PointEditContextData,
} from '@ultmt-app/context/point-edit-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react-native'

const client = new QueryClient()

const getWrapper = (
    liveGameData: Partial<LiveGameContextData>,
    pointEditData: Partial<PointEditContextData>,
) => {
    return ({ children }: { children: ReactNode }) => {
        return (
            <QueryClientProvider client={client}>
                <LiveGameContext.Provider
                    value={liveGameData as LiveGameContextData}>
                    <PointEditContext.Provider
                        value={pointEditData as PointEditContextData}>
                        {children}
                    </PointEditContext.Provider>
                </LiveGameContext.Provider>
            </QueryClientProvider>
        )
    }
}

describe('useLiveGameWizard', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    describe('in set players state', () => {
        it('calls next', async () => {
            const onSelectPlayers = jest.fn()

            const { result } = renderHook(() => useLiveGameWizard(), {
                wrapper: getWrapper(
                    {
                        game: { playersPerPoint: 1 },
                        point: { pointNumber: 1 },
                    } as LiveGameContextData,
                    {
                        selectPlayers: {
                            selectedPlayers: [1],
                            toggleSelection: jest.fn(),
                        },
                        setPlayers: {
                            mutate: onSelectPlayers,
                            isLoading: false,
                            error: undefined,
                        },
                        myTeamActions: [],
                    } as unknown as PointEditContextData,
                ),
            })

            await act(async () => {
                await result.current.next()
            })

            expect(result.current.state).toBe(LiveGameWizardState.LOG_ACTIONS)
            expect(onSelectPlayers).toHaveBeenCalled()
        })

        it('calls back', async () => {
            const onBackPoint = jest.fn()
            const { result } = renderHook(() => useLiveGameWizard(), {
                wrapper: getWrapper(
                    {
                        game: { playersPerPoint: 1 },
                        point: { pointNumber: 1 },
                    } as LiveGameContextData,
                    {
                        selectPlayers: {
                            selectedPlayers: [1],
                            toggleSelection: jest.fn(),
                        },
                        backPoint: {
                            mutate: onBackPoint,
                            isLoading: false,
                            error: undefined,
                        },
                        myTeamActions: [],
                    } as unknown as PointEditContextData,
                ),
            })

            await act(async () => {
                await result.current.back()
            })

            expect(result.current.state).toBe(LiveGameWizardState.LOG_ACTIONS)
            expect(onBackPoint).toHaveBeenCalled()
        })

        it('sets back and next disabled true correctly ', () => {
            const { result } = renderHook(() => useLiveGameWizard(), {
                wrapper: getWrapper(
                    {
                        game: { playersPerPoint: 2 },
                        point: { pointNumber: 1 },
                    } as LiveGameContextData,
                    {
                        selectPlayers: {
                            selectedPlayers: [1],
                            toggleSelection: jest.fn(),
                        },
                        myTeamActions: [],
                    } as unknown as PointEditContextData,
                ),
            })

            expect(result.current.backDisabled).toBe(true)
            expect(result.current.nextDisabled).toBe(true)
        })

        it('sets back and next disabled false correctly', () => {
            const { result } = renderHook(() => useLiveGameWizard(), {
                wrapper: getWrapper(
                    {
                        game: { playersPerPoint: 1 },
                        point: { pointNumber: 2 },
                    } as LiveGameContextData,
                    {
                        selectPlayers: {
                            selectedPlayers: [1],
                            toggleSelection: jest.fn(),
                        },
                        myTeamActions: [],
                    } as unknown as PointEditContextData,
                ),
            })

            expect(result.current.backDisabled).toBe(false)
            expect(result.current.nextDisabled).toBe(false)
        })
    })

    describe('in log actions state', () => {
        it('calls next finish point', async () => {
            const onNextPoint = jest.fn()
            const { result } = renderHook(
                () => useLiveGameWizard(LiveGameWizardState.LOG_ACTIONS),
                {
                    wrapper: getWrapper(
                        {
                            game: { playersPerPoint: 1 },
                            point: { pointNumber: 1 },
                        } as LiveGameContextData,
                        {
                            selectPlayers: {
                                selectedPlayers: [1],
                                toggleSelection: jest.fn(),
                            },
                            nextPoint: {
                                mutate: onNextPoint,
                                isLoading: false,
                                error: undefined,
                            },
                            myTeamActions: [],
                        } as unknown as PointEditContextData,
                    ),
                },
            )

            await act(async () => {
                await result.current.next()
            })

            expect(result.current.state).toBe(LiveGameWizardState.SET_PLAYERS)
            expect(onNextPoint).toHaveBeenCalled()
        })

        it('sets back disabled false and next disabled true correctly', () => {
            const { result } = renderHook(
                () => useLiveGameWizard(LiveGameWizardState.LOG_ACTIONS),
                {
                    wrapper: getWrapper(
                        {
                            game: { playersPerPoint: 1 },
                            point: { pointNumber: 1 },
                        } as LiveGameContextData,
                        {
                            selectPlayers: {
                                selectedPlayers: [1],
                                toggleSelection: jest.fn(),
                            },
                            myTeamActions: [],
                        } as unknown as PointEditContextData,
                    ),
                },
            )

            expect(result.current.backDisabled).toBe(false)
            expect(result.current.nextDisabled).toBe(true)
        })

        it('sets back disabled true and next disabled false', () => {
            const { result } = renderHook(
                () => useLiveGameWizard(LiveGameWizardState.LOG_ACTIONS),
                {
                    wrapper: getWrapper(
                        {
                            game: { playersPerPoint: 1 },
                            point: { pointNumber: 1 },
                        } as LiveGameContextData,
                        {
                            selectPlayers: {
                                selectedPlayers: [1],
                                toggleSelection: jest.fn(),
                            },
                            myTeamActions: [
                                {
                                    actionType: ActionType.TEAM_ONE_SCORE,
                                },
                            ],
                        } as unknown as PointEditContextData,
                    ),
                },
            )

            expect(result.current.backDisabled).toBe(true)
            expect(result.current.nextDisabled).toBe(false)
        })
    })
})
