import * as AccountReducer from '../../src/store/reducers/features/account/accountReducer'
import * as UserData from '../../src/services/data/user'
import { NavigationContainer } from '@react-navigation/native'
import ProfileScreen from '../../src/screens/ProfileScreen'
import { Props } from '../../src/types/navigation'
import { Provider } from 'react-redux'
import React from 'react'
import { fetchProfileData } from '../../fixtures/data'
import renderer from 'react-test-renderer'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const loginData = { token: 'sample.1234.token' }

const navigate = jest.fn()
const addListener = jest.fn()

const props: Props = {
    navigation: {
        navigate,
        addListener,
    } as any,
    route: {} as any,
}

beforeAll(async () => {
    jest.spyOn(UserData, 'login').mockImplementation(
        async (_username: string, _password: string) => {
            return loginData.token
        },
    )

    jest.spyOn(UserData, 'fetchProfile').mockImplementation(
        async (_token: string) => {
            return fetchProfileData
        },
    )
    store.dispatch(setProfile(fetchProfileData))
})

beforeEach(() => {
    navigate.mockReset()
    addListener.mockReset()
})

it('profile screen matches snapshot', async () => {
    jest.useFakeTimers()
    const snapshot = renderer.create(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot).toMatchSnapshot()
})

it('contains correct text from response', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    await act(async () => {
        const title = getByText(
            `${fetchProfileData.firstName} ${fetchProfileData.lastName}`,
        )
        expect(title).toBeTruthy()

        const username = getByText(`@${fetchProfileData.username}`)
        expect(username).toBeTruthy()

        const team1 = getByText(
            `${fetchProfileData.playerTeams[0].place} ${fetchProfileData.playerTeams[0].name}`,
        )
        expect(team1).toBeTruthy()

        const team2 = getByText(
            `${fetchProfileData.playerTeams[1].place} ${fetchProfileData.playerTeams[1].name}`,
        )
        expect(team2).toBeTruthy()

        const team3 = getByText(
            `${fetchProfileData.playerTeams[2].place} ${fetchProfileData.playerTeams[2].name}`,
        )
        expect(team3).toBeTruthy()
    })
})

it('should handle logout click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Sign Out')
    fireEvent.press(button)

    expect(navigate).toHaveBeenCalledTimes(1)
})

it('should handle manage teams click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('manage teams')
    fireEvent.press(button)
    expect(navigate).toHaveBeenCalledTimes(1)
})

it('should handle player team click', async () => {
    const { getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const team = getByText(
        `${fetchProfileData.playerTeams[0].place} ${fetchProfileData.playerTeams[0].name}`,
    )
    fireEvent.press(team)
    expect(navigate).toHaveBeenCalledTimes(1)
})

it('should handle create team click', async () => {
    const { getAllByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const buttons = getAllByTestId('create-button')
    fireEvent.press(buttons[1])
    expect(navigate).toHaveBeenCalledTimes(1)
})

it('should handle swipe functionality', async () => {
    const mockFn = jest.fn()
    const spy = jest
        .spyOn(AccountReducer, 'fetchProfile')
        .mockImplementation(mockFn)

    const { getByTestId } = render(
        <Provider store={store}>
            <NavigationContainer>
                <ProfileScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    // refactor once it is possible to fire swipe event
    const scrollView = getByTestId('profile-flat-list')
    const { refreshControl } = scrollView.props
    await act(async () => {
        refreshControl.props.onRefresh()
    })

    expect(mockFn).toHaveBeenCalled()
    spy.mockRestore()
})
