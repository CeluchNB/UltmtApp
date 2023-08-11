import { NavigationContainer } from '@react-navigation/native'
import PublicUserTeamScene from '../../../src/components/organisms/PublicUserTeamScene'
import React from 'react'
import { fetchProfileData } from '../../../fixtures/data'
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

describe('PublicUserTeamScene', () => {
    it('renders with data', () => {
        render(
            <NavigationContainer>
                <PublicUserTeamScene
                    loading={false}
                    refetch={jest.fn()}
                    user={fetchProfileData}
                />
            </NavigationContainer>,
        )

        expect(
            screen.getByText(`@${fetchProfileData.playerTeams[0].teamname}`),
        ).toBeTruthy()
        expect(
            screen.getByText(`@${fetchProfileData.playerTeams[1].teamname}`),
        ).toBeTruthy()
        expect(
            screen.getByText(`@${fetchProfileData.playerTeams[2].teamname}`),
        ).toBeTruthy()
        expect(
            screen.getByText(`@${fetchProfileData.managerTeams[0].teamname}`),
        ).toBeTruthy()
    })

    it('renders no team message', () => {
        render(
            <NavigationContainer>
                <PublicUserTeamScene
                    loading={false}
                    refetch={jest.fn()}
                    user={{
                        ...fetchProfileData,
                        playerTeams: [],
                        managerTeams: [],
                    }}
                />
            </NavigationContainer>,
        )

        expect(
            screen.getByText('This user has not joined any teams yet'),
        ).toBeTruthy()
    })

    it('renders error', () => {
        render(
            <NavigationContainer>
                <PublicUserTeamScene
                    loading={false}
                    refetch={jest.fn()}
                    error={{ message: 'test error' }}
                />
            </NavigationContainer>,
        )

        expect(screen.getByText('test error')).toBeTruthy()
    })

    it('navigates on team press', () => {
        render(
            <NavigationContainer>
                <PublicUserTeamScene
                    loading={false}
                    refetch={jest.fn()}
                    user={fetchProfileData}
                />
            </NavigationContainer>,
        )

        fireEvent.press(
            screen.getByText(`@${fetchProfileData.playerTeams[0].teamname}`),
        )
        expect(mockedNavigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Account',
            params: {
                screen: 'PublicTeamDetails',
                params: {
                    id: fetchProfileData.playerTeams[0]._id,
                },
            },
        })
    })

    it('calls refresh', async () => {
        const refetch = jest.fn()
        render(
            <NavigationContainer>
                <PublicUserTeamScene
                    loading={false}
                    refetch={refetch}
                    user={fetchProfileData}
                />
            </NavigationContainer>,
        )

        const scrollView = screen.getByTestId('public-user-team-scroll-view')
        const { refreshControl } = scrollView.props
        refreshControl.props.onRefresh()

        expect(refetch).toHaveBeenCalled()
    })
})
