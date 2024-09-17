import * as TeamData from '../../../src/services/data/team'
import { PublicTeamAllYearsScene } from '../../../src/components/organisms/PublicTeamAllYearsScene'
import React from 'react'
import { TeamFactory } from '../../test-data/team'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const mockedPush = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            addListener: jest.fn().mockReturnValue(() => {}),
            push: mockedPush,
        }),
    }
})

const team1 = TeamFactory.build({
    seasonStart: '2024',
    seasonEnd: '2024',
    seasonNumber: 1,
})
const team2 = TeamFactory.build({
    seasonStart: '2024',
    seasonEnd: '2025',
    seasonNumber: 2,
})
const team3 = TeamFactory.build({
    seasonStart: '2025',
    seasonEnd: '2025',
    seasonNumber: 3,
})

const client = new QueryClient()

describe('PublicTeamAllYearsScene', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders years', async () => {
        jest.spyOn(TeamData, 'getTeamsByContinutationId').mockReturnValue(
            Promise.resolve([team1, team2, team3]),
        )
        render(
            <QueryClientProvider client={client}>
                <PublicTeamAllYearsScene continuationId="test" />
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('2024')).toBeTruthy()
        })
        expect(screen.getByText('2024 - 2025')).toBeTruthy()
        expect(screen.getByText('2025')).toBeTruthy()
    })

    it('handles year press', async () => {
        jest.spyOn(TeamData, 'getTeamsByContinutationId').mockReturnValue(
            Promise.resolve([team1, team2, team3]),
        )
        render(
            <QueryClientProvider client={client}>
                <PublicTeamAllYearsScene continuationId="test" />
            </QueryClientProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('2024')).toBeTruthy()
        })
        const button = screen.getByText('2025')
        fireEvent.press(button)

        expect(mockedPush).toHaveBeenCalled()
    })
})
