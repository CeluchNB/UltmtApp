import { Game } from '../../../src/types/game'
import { NavigationContainer } from '@react-navigation/native'
import React from 'react'
import TeamGamesScene from '../../../src/components/organisms/TeamGameScene'
import { UseQueryResult } from 'react-query'
import { game } from '../../../fixtures/data'
import { fireEvent, render, screen } from '@testing-library/react-native'

const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockedNavigate,
        }),
    }
})

describe('TeamGamesScene', () => {
    const teamThree = {
        _id: 'team3',
        teamname: 'team3',
        place: 'Place 3',
        name: 'Name 3',
        seasonStart: '06-01-2023',
        seasonEnd: '06-01-2023',
    }
    const data: Game[] = [
        game,
        {
            ...game,
            teamOne: teamThree,
        },
    ]
    it('renders game list', () => {
        render(
            <NavigationContainer>
                <TeamGamesScene
                    teamId="team1"
                    queryResult={
                        {
                            data,
                            isLoading: false,
                            isRefetching: false,
                            refetch: jest.fn(),
                        } as unknown as UseQueryResult<Game[]>
                    }
                />
            </NavigationContainer>,
        )

        expect(screen.getByText(`vs. ${game.teamTwo.name}`)).toBeTruthy()
        expect(
            screen.getByText(`vs. ${teamThree.place} ${teamThree.name}`),
        ).toBeTruthy()
    })

    it('calls refetch', () => {
        const refetch = jest.fn()
        render(
            <NavigationContainer>
                <TeamGamesScene
                    teamId="team1"
                    queryResult={
                        {
                            data,
                            isLoading: false,
                            isRefetching: false,
                            refetch,
                        } as unknown as UseQueryResult<Game[]>
                    }
                />
            </NavigationContainer>,
        )

        const flatList = screen.getByTestId('team-game-scene-list')
        const { refreshControl } = flatList.props
        refreshControl.props.onRefresh()

        expect(refetch).toHaveBeenCalled()
    })

    it('navigates on click', () => {
        render(
            <NavigationContainer>
                <TeamGamesScene
                    teamId="team1"
                    queryResult={
                        {
                            data,
                            isLoading: false,
                            isRefetching: false,
                            refetch: jest.fn(),
                        } as unknown as UseQueryResult<Game[]>
                    }
                />
            </NavigationContainer>,
        )

        const teamItem = screen.getByText(`vs. ${game.teamTwo.name}`)
        fireEvent.press(teamItem)

        expect(mockedNavigate).toHaveBeenCalledWith('ViewGame', {
            gameId: game._id,
        })
    })
})
