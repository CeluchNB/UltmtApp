import * as GameServices from '../../../src/services/network/game'
import * as LocalGameServices from '../../../src/services/local/game'
import GuestPlayerModal from '../../../src/components/molecules/GuestPlayerModal'
import { Provider } from 'react-redux'
import React from 'react'
import { game } from '../../../fixtures/data'
import store from '../../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

jest.spyOn(LocalGameServices, 'saveGame').mockReturnValue(
    Promise.resolve(undefined),
)

it('should match snapshot', () => {
    const snapshot = render(
        <Provider store={store}>
            <GuestPlayerModal visible={true} onClose={jest.fn()} />
        </Provider>,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should call add player correctly', async () => {
    const spy = jest.spyOn(GameServices, 'addGuestPlayer').mockReturnValue(
        Promise.resolve({
            data: {
                game: { ...game, startTime: '2022', tournament: undefined },
            },
            status: 200,
            statusText: 'Good',
            config: {},
            headers: {},
        }),
    )
    jest.spyOn(LocalGameServices, 'getGameById').mockReturnValueOnce(
        Promise.resolve({
            ...game,
            startTime: '2022' as unknown as Date,
            tournament: undefined,
            offline: false,
        }),
    )
    let visible = true

    const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <GuestPlayerModal
                visible={true}
                onClose={() => {
                    visible = false
                }}
            />
        </Provider>,
    )

    const firstInput = getByPlaceholderText('First Name')
    const lastInput = getByPlaceholderText('Last Name')

    fireEvent.changeText(firstInput, 'First')
    fireEvent.changeText(lastInput, 'Last')

    const button = getByText('add')
    fireEvent.press(button)

    await waitFor(() => {
        expect(spy).toHaveBeenCalled()
    })
    expect(visible).toBe(false)
})

it('with form errors', async () => {
    const spy = jest.spyOn(GameServices, 'addGuestPlayer').mockReturnValue(
        Promise.resolve({
            data: {
                game: { ...game, startTime: '2022', tournament: undefined },
            },
            status: 200,
            statusText: 'Good',
            config: {},
            headers: {},
        }),
    )
    spy.mockClear()
    let visible = true

    const { getByText, findByText } = render(
        <Provider store={store}>
            <GuestPlayerModal
                visible={true}
                onClose={() => {
                    visible = false
                }}
            />
        </Provider>,
    )

    const button = getByText('add')
    fireEvent.press(button)

    await findByText('First name is required.')
    expect(spy).not.toHaveBeenCalled()
    expect(visible).toBe(true)
})

it('with network error', async () => {
    const spy = jest.spyOn(GameServices, 'addGuestPlayer').mockReturnValue(
        Promise.reject({
            data: { message: 'Bad guest' },
            status: 400,
            statusText: 'Bad',
            config: {},
            headers: {},
        }),
    )
    spy.mockClear()
    let visible = true

    const { getByPlaceholderText, getByText } = render(
        <Provider store={store}>
            <GuestPlayerModal
                visible={true}
                onClose={() => {
                    visible = false
                }}
            />
        </Provider>,
    )

    const firstInput = getByPlaceholderText('First Name')
    const lastInput = getByPlaceholderText('Last Name')

    fireEvent.changeText(firstInput, 'First')
    fireEvent.changeText(lastInput, 'Last')

    const button = getByText('add')
    fireEvent.press(button)

    await waitFor(() => {
        expect(spy).toHaveBeenCalled()
    })
    expect(getByText('Bad guest')).not.toBeNull()
    expect(visible).toBe(true)
})
