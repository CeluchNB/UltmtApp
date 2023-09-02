import * as TeamData from '../../src/services/data/team'
import { CreateTeamProps } from '../../src/types/navigation'
import CreateTeamScreen from '../../src/screens/CreateTeamScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import mockDate from 'mockdate'
import renderer from 'react-test-renderer'
import store from '../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const navigate = jest.fn()
const goBack = jest.fn()

const props: CreateTeamProps = {
    navigation: {
        navigate,
        goBack,
    } as any,
    route: {} as any,
}

beforeAll(() => {
    mockDate.set('06/01/2022')
})

afterAll(() => {
    mockDate.reset()
})

beforeEach(async () => {
    navigate.mockReset()
    goBack.mockReset()
})

it('should match snapshot', async () => {
    const snapshot = renderer.create(
        <Provider store={store}>
            <NavigationContainer>
                <CreateTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    expect(snapshot).toMatchSnapshot()
})

it('should handle create team correctly', async () => {
    const mockFn = jest.fn()
    const spy = jest
        .spyOn(TeamData, 'createTeam')
        .mockImplementationOnce(mockFn)

    const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const teamPlaceText = getByPlaceholderText('Team Location')
    const teamNameText = getByPlaceholderText('Team Name')
    const teamHandleText = getByPlaceholderText('Team Handle')
    const button = getByText('Create')

    fireEvent.changeText(teamPlaceText, 'place')
    fireEvent.changeText(teamNameText, 'name')
    fireEvent.changeText(teamHandleText, 'handle')
    fireEvent.press(button)

    await waitFor(() => {
        expect(mockFn).toHaveBeenCalled()
    })
    expect(goBack).toHaveBeenCalledTimes(1)
    spy.mockRestore()
})

it('should not call create team without input values', async () => {
    const mockFn = jest.fn()
    const spy = jest
        .spyOn(TeamData, 'createTeam')
        .mockImplementationOnce(mockFn)

    const { getByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const button = getByText('Create')

    fireEvent.press(button)

    await waitFor(() => queryByText('Team location is required'))
    expect(mockFn).not.toHaveBeenCalled()
    expect(goBack).not.toHaveBeenCalled()
    spy.mockRestore()
})

it('should handle create team error correctly', async () => {
    const mockFn = jest
        .fn()
        .mockReturnValueOnce(Promise.reject({ message: 'error' }))
    const spy = jest
        .spyOn(TeamData, 'createTeam')
        .mockImplementationOnce(mockFn)

    const { getByPlaceholderText, getByText, queryByText } = render(
        <Provider store={store}>
            <NavigationContainer>
                <CreateTeamScreen {...props} />
            </NavigationContainer>
        </Provider>,
    )

    const teamPlaceText = getByPlaceholderText('Team Location')
    const teamNameText = getByPlaceholderText('Team Name')
    const teamHandleText = getByPlaceholderText('Team Handle')
    const button = getByText('Create')

    fireEvent.changeText(teamPlaceText, 'place')
    fireEvent.changeText(teamNameText, 'name')
    fireEvent.changeText(teamHandleText, 'handle')
    fireEvent.press(button)

    await waitFor(() => queryByText('error'))
    expect(mockFn).toHaveBeenCalled()
    expect(goBack).not.toHaveBeenCalled()
    spy.mockRestore()
})
