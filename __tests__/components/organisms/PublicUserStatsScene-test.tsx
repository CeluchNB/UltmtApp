import * as StatsData from '../../../src/services/data/stats'
import { ApiError } from '../../../src/types/services'
import PublicUserStatsScene from '../../../src/components/organisms/PublicUserStatsScene'
import React from 'react'
import { getInitialPlayerData } from '../../../fixtures/utils'
import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { game, teamOne } from '../../../fixtures/data'

describe('PublicUserStatsScene', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders correctly', async () => {
        jest.spyOn(StatsData, 'getPlayerStats').mockResolvedValue(
            getInitialPlayerData({ assists: 1, blocks: 2 }),
        )
        render(<PublicUserStatsScene userId="user1" teams={[]} games={[]} />)

        expect(screen.getByText('Filter by Team')).toBeTruthy()
        expect(screen.getByText('Filter by Game')).toBeTruthy()

        expect(await screen.findByText('Goals')).toBeTruthy()
        expect(await screen.findByText('Assists')).toBeTruthy()
        expect(await screen.findByText('Blocks')).toBeTruthy()
        expect(await screen.findByText('Throwaways')).toBeTruthy()
        expect(await screen.findByText('1')).toBeTruthy()
        expect(await screen.findByText('2')).toBeTruthy()
    })

    it('calls refresh', async () => {
        const spy = jest
            .spyOn(StatsData, 'getPlayerStats')
            .mockResolvedValue(getInitialPlayerData({ assists: 1, blocks: 2 }))

        render(<PublicUserStatsScene userId="user1" teams={[]} games={[]} />)

        const scrollView = screen.getByTestId('public-user-stats-scroll-view')
        await act(async () => {
            const { refreshControl } = scrollView.props
            refreshControl.props.onRefresh()
        })

        expect(spy).toHaveBeenCalledTimes(2)
        expect(await screen.findByText('1')).toBeTruthy()
        expect(await screen.findByText('2')).toBeTruthy()
    })

    it('filters by team correctly', async () => {
        const spy = jest
            .spyOn(StatsData, 'filterPlayerStats')
            .mockResolvedValue(getInitialPlayerData({ assists: 6 }))

        render(
            <PublicUserStatsScene
                userId="user1"
                teams={[teamOne]}
                games={[]}
            />,
        )

        const teamButton = screen.getByText('Filter by Team')
        fireEvent.press(teamButton)

        const teamItem1 = screen.getByTestId('checkbox-0')
        fireEvent(teamItem1, 'onChange')

        // test clear all
        const clearBtn = screen.getByText('clear all')
        fireEvent.press(clearBtn)

        const teamItem2 = screen.getByTestId('checkbox-0')
        fireEvent(teamItem2, 'onChange')

        const doneBtn = screen.getByText('done')
        fireEvent.press(doneBtn)

        expect(spy).toHaveBeenCalledWith('user1', [teamOne._id], [])

        expect(await screen.findByText('6')).toBeTruthy()
    })

    it('filters by game correctly', async () => {
        const spy = jest
            .spyOn(StatsData, 'filterPlayerStats')
            .mockResolvedValue(getInitialPlayerData({ assists: 6 }))

        render(
            <PublicUserStatsScene
                userId="user1"
                teams={[]}
                games={[{ game, teamId: 'team1' }]}
            />,
        )

        const teamButton = screen.getByText('Filter by Game')
        fireEvent.press(teamButton)

        const gameItem1 = screen.getByTestId('checkbox-0')
        fireEvent(gameItem1, 'onChange')

        // test clear all
        const clearBtn = screen.getByText('clear all')
        fireEvent.press(clearBtn)

        const gameItem2 = screen.getByTestId('checkbox-0')
        fireEvent(gameItem2, 'onChange')

        const doneBtn = screen.getByText('done')
        fireEvent.press(doneBtn)

        expect(spy).toHaveBeenCalledWith('user1', [], [game._id])

        expect(await screen.findByText('6')).toBeTruthy()
    })

    it('displays an error', async () => {
        const spy = jest
            .spyOn(StatsData, 'filterPlayerStats')
            .mockRejectedValue(new ApiError('test error'))

        render(
            <PublicUserStatsScene
                userId="user1"
                teams={[]}
                games={[{ game, teamId: 'team1' }]}
            />,
        )

        const teamButton = screen.getByText('Filter by Game')
        fireEvent.press(teamButton)

        const teamItem = screen.getByTestId('checkbox-0')
        fireEvent(teamItem, 'onChange')

        const doneBtn = screen.getByText('done')
        fireEvent.press(doneBtn)

        expect(spy).toHaveBeenCalledWith('user1', [], [game._id])

        expect(await screen.findByText('test error')).toBeTruthy()
    })
})
