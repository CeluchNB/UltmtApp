import * as TournamentNetwork from '@ultmt-app/services/network/tournament'
import { AxiosResponse } from 'axios'
import { BSON } from 'realm'
import { RealmProvider } from '@ultmt-app/context/realm'
import { renderHook } from '@testing-library/react-native'
import { useCreateTournament } from '@ultmt-app/hooks/game-edit-actions/use-create-tournament'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { ReactNode } from 'react'

const client = new QueryClient()
const wrapper = ({ children }: { children: ReactNode }) => {
    return (
        <QueryClientProvider client={client}>
            <RealmProvider>{children}</RealmProvider>
        </QueryClientProvider>
    )
}

describe('useCreateTournament', () => {
    it('with successful network response', async () => {
        const _id = new BSON.ObjectId()
        const spy = jest
            .spyOn(TournamentNetwork, 'createTournament')
            .mockReturnValue(
                Promise.resolve({
                    data: {
                        tournament: {
                            _id: _id.toHexString(),
                            startDate: '2024-01-01',
                            endDate: '2024-01-02',
                            name: 'tournament',
                            eventId: 'tournament',
                        },
                    },
                    status: 201,
                    statusText: 'Created',
                } as AxiosResponse),
            )
        const { result } = renderHook(() => useCreateTournament(), { wrapper })

        const tournament = await result.current.mutateAsync({
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            name: 'tournament',
            eventId: 'tournament',
        })

        expect(spy).toHaveBeenCalled()

        expect(tournament._id).toBe(_id.toHexString())
        expect(tournament.eventId).toBe('tournament')
    })

    it('with failed network response', async () => {
        const spy = jest
            .spyOn(TournamentNetwork, 'createTournament')
            .mockReturnValue(
                Promise.resolve({
                    data: {},
                    status: 400,
                    statusText: 'Error',
                } as AxiosResponse),
            )
        const { result } = renderHook(() => useCreateTournament(), { wrapper })

        const tournament = await result.current.mutateAsync({
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            name: 'tournament',
            eventId: 'tournament',
        })

        expect(spy).toHaveBeenCalled()

        expect(tournament._id).toBeDefined()
        expect(tournament.eventId).toBe('tournament')
    })
})
