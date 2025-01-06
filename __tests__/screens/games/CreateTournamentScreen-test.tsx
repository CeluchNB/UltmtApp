import * as TournamentNetwork from '../../../src/services/network/tournament'
import { AxiosResponse } from 'axios'
import { CreateTournamentProps } from '../../../src/types/navigation'
import CreateTournamentScreen from '../../../src/screens/games/CreateTournamentScreen'
import MockDate from 'mockdate'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import { tourney } from '../../../fixtures/data'
import { withRealm } from '../../utils/renderers'
import {
    CreateGameContext,
    CreateGameContextData,
} from '../../../src/context/create-game-context'
import { QueryClient, QueryClientProvider } from 'react-query'
import { act, fireEvent, render, screen } from '@testing-library/react-native'

const client = new QueryClient()
const pop = jest.fn()
const props: CreateTournamentProps = {
    navigation: { setOptions: jest.fn(), pop } as any,
    route: { params: {} } as any,
}

describe('CreateTournamentScreen', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
        MockDate.set('01-01-2023')
    })
    afterEach(() => {
        jest.clearAllMocks()
    })
    afterAll(() => {
        jest.useRealTimers()
        MockDate.reset()
    })

    it('renders', async () => {
        render(
            withRealm(
                <NavigationContainer>
                    <QueryClientProvider client={client}>
                        <CreateTournamentScreen {...props} />
                    </QueryClientProvider>
                </NavigationContainer>,
            ),
        )

        await act(async () => {})

        expect(screen.getByText('Tournament Name')).toBeTruthy()
        expect(screen.getByText('Tournament ID')).toBeTruthy()
        expect(screen.getByText('Start')).toBeTruthy()
        expect(screen.getByText('End')).toBeTruthy()
    })

    it('successfully calls tournament create', async () => {
        const spy = jest
            .spyOn(TournamentNetwork, 'createTournament')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: { tournament: tourney },
                    status: 201,
                    statusText: 'Created',
                } as AxiosResponse),
            )
        render(
            withRealm(
                <CreateGameContext.Provider
                    value={
                        {
                            setTournament: jest.fn(),
                        } as unknown as CreateGameContextData
                    }>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <CreateTournamentScreen {...props} />
                        </QueryClientProvider>
                    </NavigationContainer>
                </CreateGameContext.Provider>,
            ),
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
        expect(spy).toHaveBeenCalledWith('', {
            name,
            eventId,
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-01-01T00:00:00.000Z',
        })
        expect(pop).toHaveBeenCalledWith(2)
    })

    it('renders with error', async () => {
        const spy = jest
            .spyOn(TournamentNetwork, 'createTournament')
            .mockReturnValueOnce(
                Promise.resolve({
                    data: { message: 'test message' },
                    status: 400,
                    statusText: 'Bad',
                } as AxiosResponse),
            )
        render(
            withRealm(
                <CreateGameContext.Provider
                    value={
                        {
                            setTournament: jest.fn(),
                        } as unknown as CreateGameContextData
                    }>
                    <NavigationContainer>
                        <QueryClientProvider client={client}>
                            <CreateTournamentScreen {...props} />
                        </QueryClientProvider>
                    </NavigationContainer>
                </CreateGameContext.Provider>,
            ),
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
        expect(spy).toHaveBeenCalledWith('', {
            name,
            eventId,
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-01-01T00:00:00.000Z',
        })
        expect(pop).toHaveBeenCalled()
    })
})
