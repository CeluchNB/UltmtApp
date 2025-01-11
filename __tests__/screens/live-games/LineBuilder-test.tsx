import { DisplayTeamFactory } from '../../test-data/team'
import { DisplayUserFactory } from '../../test-data/user'
import { GameSchema } from '@ultmt-app/models'
import LineBuilder from '@ultmt-app/screens/live-games/LineBuilder'
import { LineBuilderProps } from '@ultmt-app/types/navigation'
import React, { useEffect } from 'react'
import { RealmProvider, useRealm } from '@ultmt-app/context/realm'
import { fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/animations/TimingAnimation')

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
    useEffect(() => {
        realm.write(() => {
            realm.deleteAll()
            realm.create('Game', gameSchema)
        })
    }, [realm, gameSchema])

    const props: LineBuilderProps = {
        navigation: {},
        route: {
            params: {
                gameId: gameSchema._id,
                teamId: teamOne._id,
            },
        },
    } as LineBuilderProps

    return <LineBuilder {...props} />
}

describe('LineBuilder', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('can create line', async () => {
        render(
            <RealmProvider>
                <TestScreen />
            </RealmProvider>,
        )

        const addButton = screen.getByText('add line')
        fireEvent.press(addButton)

        const input = screen.getByPlaceholderText('Line name')
        fireEvent.changeText(input, 'offense')

        const doneButton = screen.getByText('done')
        fireEvent.press(doneButton)

        expect(screen.getByText('offense (0)')).toBeTruthy()

        for (const player of players.slice(0, 7)) {
            fireEvent.press(
                screen.getByText(`${player.firstName} ${player.lastName}`),
            )
        }

        fireEvent.press(screen.getByText('save'))

        expect(screen.getByText('offense (7)')).toBeTruthy()
    })

    it('can edit line', () => {
        render(
            <RealmProvider>
                <TestScreen />
            </RealmProvider>,
        )

        const addButton = screen.getByText('add line')
        fireEvent.press(addButton)

        const input = screen.getByPlaceholderText('Line name')
        fireEvent.changeText(input, 'offense')

        const doneButton = screen.getByText('done')
        fireEvent.press(doneButton)

        expect(screen.getByText('offense (0)')).toBeTruthy()

        for (const player of players.slice(0, 7)) {
            fireEvent.press(
                screen.getByText(`${player.firstName} ${player.lastName}`),
            )
        }

        fireEvent.press(screen.getByText('save'))

        fireEvent.press(screen.getByText('offense (7)'))

        fireEvent.press(screen.getByText('edit'))

        fireEvent.press(
            screen.getByText(`${players[0].firstName} ${players[0].lastName}`),
        )
        fireEvent.press(
            screen.getByText(`${players[1].firstName} ${players[1].lastName}`),
        )
        fireEvent.press(screen.getByText('save'))
        fireEvent.press(screen.getByText('offense (2)'))
    })

    it('can delete line', () => {
        render(
            <RealmProvider>
                <TestScreen />
            </RealmProvider>,
        )

        const addButton = screen.getByText('add line')
        fireEvent.press(addButton)

        const input = screen.getByPlaceholderText('Line name')
        fireEvent.changeText(input, 'offense')

        const doneButton = screen.getByText('done')
        fireEvent.press(doneButton)

        expect(screen.getByText('offense (0)')).toBeTruthy()
        fireEvent.press(screen.getByTestId('delete-button'))
        fireEvent.press(screen.getByText('confirm'))

        expect(screen.queryByText('offense (0)')).toBeNull()
    })
})
