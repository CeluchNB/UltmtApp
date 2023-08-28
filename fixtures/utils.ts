import { IdentifiedPlayerStats } from '../src/types/stats'
import { ReactTestInstance } from 'react-test-renderer'
import { expect } from '@jest/globals'
import { waitFor } from '@testing-library/react-native'

export const waitUntilRefreshComplete = async (node: ReactTestInstance) => {
    await waitFor(() => {
        expect(node.props.refreshControl.props.refreshing).toBe(false)
    })
}

export const getInitialPlayerData = (
    overrides: Partial<IdentifiedPlayerStats>,
): IdentifiedPlayerStats => {
    return {
        _id: 'user1',
        firstName: 'First 1',
        lastName: 'Last 1',
        username: 'first1last1',
        goals: 0,
        assists: 0,
        hockeyAssists: 0,
        blocks: 0,
        throwaways: 0,
        drops: 0,
        stalls: 0,
        touches: 0,
        catches: 0,
        completedPasses: 0,
        droppedPasses: 0,
        callahans: 0,
        pointsPlayed: 0,
        pulls: 0,
        wins: 0,
        losses: 0,
        plusMinus: 0,
        catchingPercentage: 0,
        throwingPercentage: 0,
        ppAssists: 0,
        ppBlocks: 0,
        ppDrops: 0,
        ppGoals: 0,
        ppThrowaways: 0,
        winPercentage: 0,
        games: [],
        teams: [],
        ...overrides,
    }
}
