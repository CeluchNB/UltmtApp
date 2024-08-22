import { DisplayTeamFactory } from '../../test-data/team'
import { DisplayUserFactory } from '../../test-data/user'
import LiveGameEditScreen from '../../../src/screens/live-games/LiveGameEdit'
import { LiveGameProps } from '../../../src/types/navigation'
import { NavigationContainer } from '@react-navigation/native'
import { GameSchema, PointSchema } from '../../../src/models'
import { QueryClient, QueryClientProvider } from 'react-query'
import React, { useEffect } from 'react'
import { RealmProvider, useRealm } from '../../../src/context/realm'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'

const teamOne = DisplayTeamFactory.build()
const teamTwo = DisplayTeamFactory.build()
const players = DisplayUserFactory.buildList(14).sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(
        `${b.firstName} ${b.lastName}`,
    ),
)

const createGameData = {
    creator: DisplayUserFactory.build(),
    teamOne,
    teamTwo,
    teamTwoDefined: false,
    scoreLimit: 15,
    halfScore: 8,
    startTime: new Date(),
    softcapMins: 90,
    hardcapMins: 105,
    playersPerPoint: 7,
    timeoutPerHalf: 1,
    floaterTimeout: false,
}

const TestScreen = () => {
    const realm = useRealm()

    const gameSchema = GameSchema.createOfflineGame(createGameData, players)
    const pointSchema = PointSchema.createOfflinePoint({
        pointNumber: 1,
        teamOneScore: 0,
        teamTwoScore: 0,
        pullingTeam: teamOne,
        receivingTeam: teamTwo,
        gameId: gameSchema._id,
    })
    useEffect(() => {
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
            realm.create('Point', pointSchema)
        })
    }, [realm, gameSchema, pointSchema])

    const props: LiveGameProps = {
        navigation: {},
        route: {
            params: {
                gameId: gameSchema._id,
                pointNumber: 1,
                team: 'one',
            },
        },
    } as LiveGameProps

    return <LiveGameEditScreen {...props} />
}

describe('LiveGameEdit', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('renders', async () => {
        render(
            <NavigationContainer>
                <QueryClientProvider client={new QueryClient()}>
                    <RealmProvider>
                        <TestScreen />
                    </RealmProvider>
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(screen.getByText('7 players on next D point')).toBeTruthy()
        })
        expect(screen.getByText(`@${teamOne.teamname}`)).toBeTruthy()
        expect(screen.getByText(`@${teamTwo.teamname}`)).toBeTruthy()

        for (const player of players.slice(0, 9)) {
            const regex = new RegExp(
                `.*${player.firstName}.*${player.lastName}.*`,
            )
            expect(screen.getByText(regex)).toBeTruthy()
        }

        expect(screen.getByText('Back')).toBeTruthy()
        expect(screen.getByText('Start Point')).toBeTruthy()
    })

    it('handles player select', async () => {
        render(
            <NavigationContainer>
                <QueryClientProvider client={new QueryClient()}>
                    <RealmProvider>
                        <TestScreen />
                    </RealmProvider>
                </QueryClientProvider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(screen.getByText('7 players on next D point')).toBeTruthy()
        })

        for (const player of players.slice(0, 7)) {
            const regex = new RegExp(
                `.*${player.firstName}.*${player.lastName}.*`,
            )
            fireEvent.press(screen.getByText(regex))
        }
        const lastPlayer = players[6]
        const regex = new RegExp(
            `.*${lastPlayer.firstName}.*${lastPlayer.lastName}.*`,
        )
        // unselect and re-select
        fireEvent.press(screen.getByText(regex))
        fireEvent.press(screen.getByText(regex))

        const startPointButton = screen.getByText('Start Point')
        fireEvent.press(startPointButton)

        await waitFor(() => {
            expect(screen.getByText('Finish Point')).toBeTruthy()
        })

        expect(screen.getAllByText('Pull').length).toBe(
            createGameData.playersPerPoint,
        )
        expect(screen.getByText('Back')).toBeTruthy()
    })

    it('handles point finish', async () => {})
})
