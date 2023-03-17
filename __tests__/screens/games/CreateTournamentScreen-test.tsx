import * as TournamentData from '../../../src/services/data/tournament'
import { CreateTournamentProps } from '../../../src/types/navigation'
import CreateTournamentScreen from '../../../src/screens/games/CreateTournamentScreen'
import MockDate from 'mockdate'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import { tourney } from '../../../fixtures/data'
import { act, fireEvent, render, screen } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const pop = jest.fn()
const props: CreateTournamentProps = {
    navigation: { setOptions: jest.fn(), pop } as any,
    route: { params: {} } as any,
}

describe('CreateTournamentScreen', () => {
    beforeAll(() => {
        MockDate.set('01-01-2023')
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    afterAll(() => {
        MockDate.reset()
    })

    it('renders', async () => {
        render(
            <NavigationContainer>
                <Provider store={store}>
                    <CreateTournamentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await act(async () => {})

        expect(screen.getByText('Tournament Name')).toBeTruthy()
        expect(screen.getByText('Tournament ID')).toBeTruthy()
        expect(screen.getByText('Start')).toBeTruthy()
        expect(screen.getByText('End')).toBeTruthy()
    })

    it('successfully calls tournament create', async () => {
        const spy = jest
            .spyOn(TournamentData, 'createTournament')
            .mockReturnValueOnce(Promise.resolve(tourney))
        render(
            <NavigationContainer>
                <Provider store={store}>
                    <CreateTournamentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        const name = 'Nationals 2022'
        const eventId = 'nationals22'
        const nameField = screen.getByPlaceholderText('Name')
        const idField = screen.getByPlaceholderText('Unique Identifier')

        fireEvent.changeText(nameField, name)
        fireEvent.changeText(idField, eventId)

        const createButton = screen.getByText('create')
        fireEvent.press(createButton)

        await act(async () => {})
        expect(spy).toHaveBeenCalledWith({
            name,
            eventId,
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-01-01T00:00:00.000Z',
        })
        expect(pop).toHaveBeenCalledWith(2)
    })

    it('renders with error', async () => {
        const spy = jest
            .spyOn(TournamentData, 'createTournament')
            .mockReturnValueOnce(Promise.reject({ message: 'test message' }))
        render(
            <NavigationContainer>
                <Provider store={store}>
                    <CreateTournamentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        const name = 'Nationals 2022'
        const eventId = 'nationals22'
        const nameField = screen.getByPlaceholderText('Name')
        const idField = screen.getByPlaceholderText('Unique Identifier')

        fireEvent.changeText(nameField, name)
        fireEvent.changeText(idField, eventId)

        const createButton = screen.getByText('create')
        fireEvent.press(createButton)

        await act(async () => {})
        expect(spy).toHaveBeenCalledWith({
            name,
            eventId,
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-01-01T00:00:00.000Z',
        })
        expect(pop).not.toHaveBeenCalled()
        expect(screen.getByText('test message')).toBeTruthy()
    })
})
