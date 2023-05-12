import { NavigationContainer } from '@react-navigation/native'
import PublicUserGamesScene from '../../../src/components/organisms/PublicUserGamesScene'
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { game, teamOne } from '../../../fixtures/data'

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

describe('PublicUserGamesScene', () => {
    it('renders correctly', () => {
        render(
            <NavigationContainer>
                <PublicUserGamesScene
                    gameLists={[{ title: 'Team One', data: [game], index: 0 }]}
                    teams={[teamOne]}
                    loading={false}
                    refetch={jest.fn()}
                />
            </NavigationContainer>,
        )

        expect(screen.getByText('Team One')).toBeTruthy()
        expect(screen.getByText(`vs. ${game.teamTwo.name}`)).toBeTruthy()
    })

    it('renders error', () => {
        render(
            <NavigationContainer>
                <PublicUserGamesScene
                    gameLists={[{ title: 'Team One', data: [game], index: 0 }]}
                    teams={[teamOne]}
                    loading={false}
                    refetch={jest.fn()}
                    error={{ message: 'test error' }}
                />
            </NavigationContainer>,
        )

        expect(screen.getByText('test error')).toBeTruthy()
    })

    it('calls refetch correctly', () => {
        const refetch = jest.fn()
        render(
            <NavigationContainer>
                <PublicUserGamesScene
                    gameLists={[{ title: 'Team One', data: [game], index: 0 }]}
                    teams={[teamOne]}
                    loading={false}
                    refetch={refetch}
                />
            </NavigationContainer>,
        )

        const sectionList = screen.getByTestId('public-user-game-section-list')
        const { refreshControl } = sectionList.props
        refreshControl.props.onRefresh()

        expect(refetch).toHaveBeenCalledTimes(1)
    })

    it('calls navigate correctly', () => {
        render(
            <NavigationContainer>
                <PublicUserGamesScene
                    gameLists={[{ title: 'Team One', data: [game], index: 0 }]}
                    teams={[teamOne]}
                    loading={false}
                    refetch={jest.fn()}
                />
            </NavigationContainer>,
        )

        const teamBtn = screen.getByText(`vs. ${game.teamTwo.name}`)
        fireEvent.press(teamBtn)

        expect(mockedNavigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Games',
            params: {
                screen: 'ViewGame',
                params: { gameId: game._id },
            },
        })
    })
})
