import * as AuthServices from '../../../src/services/data/auth'
import * as LiveActionData from '../../../src/services/data/live-action'
import * as SavedActionData from '../../../src/services/data/saved-action'
import * as UserServices from '../../../src/services/data/user'
import { CommentProps } from '../../../src/types/navigation'
import CommentScreen from '../../../src/screens/games/CommentScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import store from '../../../src/store/store'
import {
    SavedServerActionData,
    SubscriptionObject,
} from '../../../src/types/action'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'
import { liveAction, savedAction } from '../../../fixtures/data'
import {
    setLiveAction,
    setSavedAction,
} from '../../../src/store/reducers/features/action/viewAction'
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const mockedNavigate = jest.fn()
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native')
    return {
        ...actualNav,
        useNavigation: () => ({
            addListener: jest.fn().mockReturnValue(() => {}),
            navigate: mockedNavigate,
        }),
    }
})

const updatedSavedAction: SavedServerActionData = {
    ...savedAction,
    comments: [
        {
            commentNumber: 1,
            comment: 'Test comment',
            user: {
                _id: 'user1',
                firstName: 'First1',
                lastName: 'Last1',
                username: 'firstast',
            },
        },
    ],
}

describe('Live CommentScreen', () => {
    const props: CommentProps = {
        navigation: {} as any,
        route: {
            params: { live: true, gameId: 'game1', pointId: 'point1' },
        } as any,
    }
    let subscriptions: SubscriptionObject
    beforeEach(() => {
        store.dispatch(setSavedAction(updatedSavedAction))
        store.dispatch(setLiveAction(liveAction))
        jest.spyOn(AuthServices, 'isLoggedIn').mockReturnValue(
            Promise.resolve(true),
        )
        jest.spyOn(UserServices, 'getUserId').mockReturnValue(
            Promise.resolve('user1'),
        )
        jest.spyOn(LiveActionData, 'joinPoint').mockReturnValue(
            Promise.resolve(),
        )

        jest.spyOn(LiveActionData, 'subscribe').mockImplementation(
            async subs => {
                subscriptions = subs
                return
            },
        )
        jest.spyOn(LiveActionData, 'unsubscribe').mockReturnValue()
    })
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )
        await waitFor(() => {
            expect(snapshot.getByText('Test comment')).toBeTruthy()
        })
        expect(snapshot).toMatchSnapshot()
    })

    it('should handle live submit', async () => {
        const spy = jest
            .spyOn(LiveActionData, 'addLiveComment')
            .mockReturnValue(Promise.resolve())

        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(getByText('Test comment')).toBeTruthy()
        })

        const input = getByPlaceholderText('Add a comment...')
        fireEvent.changeText(input, 'A new comment')

        const button = getByText('send')
        fireEvent.press(button)

        expect(spy).toHaveBeenCalled()
        await act(async () => {
            subscriptions.client({
                ...liveAction,
                comments: [
                    ...liveAction.comments,
                    {
                        comment: 'A new comment',
                        commentNumber: 2,
                        user: {
                            _id: 'user1',
                            firstName: 'First1',
                            lastName: 'Last1',
                            username: 'firstlast',
                        },
                    },
                ],
            })
        })

        await waitFor(() => {
            expect(getByText('A new comment')).toBeTruthy()
        })
    })

    it('should handle delete live comment', async () => {
        const spy = jest
            .spyOn(LiveActionData, 'deleteLiveComment')
            .mockReturnValue(Promise.resolve())

        const { queryByText, getAllByRole } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeTruthy()
        })

        const button = getAllByRole('button')[3]
        fireEvent.press(button)

        expect(spy).toHaveBeenCalled()
        await act(async () => {
            subscriptions.client({
                ...liveAction,
                comments: [],
            })
        })

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeFalsy()
        })
    })

    it('with live error', async () => {
        const { queryByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeTruthy()
        })

        await act(async () => {
            subscriptions.error({
                message: 'Live error',
            })
        })

        await waitFor(() => {
            expect(queryByText('Live error')).toBeTruthy()
        })
    })
})

describe('Saved CommentScreen', () => {
    const props: CommentProps = {
        navigation: {} as any,
        route: {
            params: { live: false, gameId: 'game1', pointId: 'point1' },
        } as any,
    }
    beforeEach(() => {
        store.dispatch(setSavedAction(updatedSavedAction))
        store.dispatch(setLiveAction(liveAction))
        jest.spyOn(AuthServices, 'isLoggedIn').mockReturnValue(
            Promise.resolve(true),
        )
        jest.spyOn(UserServices, 'getUserId').mockReturnValue(
            Promise.resolve('user1'),
        )
        jest.spyOn(LiveActionData, 'joinPoint').mockReturnValue(
            Promise.resolve(),
        )

        jest.spyOn(LiveActionData, 'subscribe').mockReturnValueOnce(
            Promise.resolve(),
        )
        jest.spyOn(LiveActionData, 'unsubscribe').mockReturnValue()
    })
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(snapshot.getByText('Test comment')).toBeTruthy()
        })

        expect(snapshot).toMatchSnapshot()
    })

    it('should handle add comment', async () => {
        const spy = jest.spyOn(SavedActionData, 'addComment').mockReturnValue(
            Promise.resolve({
                ...updatedSavedAction,
                comments: [
                    ...updatedSavedAction.comments,
                    {
                        commentNumber: 2,
                        comment: 'A new comment',
                        user: {
                            _id: 'user1',
                            firstName: 'First1',
                            lastName: 'Last1',
                            username: 'firstlast',
                        },
                    },
                ],
            }),
        )

        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(getByText('Test comment')).toBeTruthy()
        })

        const input = getByPlaceholderText('Add a comment...')
        fireEvent.changeText(input, 'A new comment')

        const button = getByText('send')
        fireEvent.press(button)

        expect(spy).toHaveBeenCalled()
        await waitFor(() => {
            expect(getByText('A new comment')).toBeTruthy()
        })
    })

    it('should handle delete comment', async () => {
        const spy = jest
            .spyOn(SavedActionData, 'deleteComment')
            .mockImplementation(async () => {
                return {
                    ...updatedSavedAction,
                    comments: [],
                }
            })

        const { queryByText, getAllByRole } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeTruthy()
        })

        const xButton = getAllByRole('button')[3]
        fireEvent.press(xButton)

        expect(spy).toHaveBeenCalled()

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeFalsy()
        })
    })

    it('should handle item press', async () => {
        render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(screen.queryByText('Test comment')).toBeTruthy()
        })

        const userDisplay = screen.getByText('First1 Last1')
        fireEvent.press(userDisplay)

        expect(mockedNavigate).toHaveBeenCalledTimes(1)
    })

    it('should handle add error', async () => {
        const spy = jest
            .spyOn(SavedActionData, 'addComment')
            .mockReturnValue(Promise.reject({ message: 'Add error' }))

        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(getByText('Test comment')).toBeTruthy()
        })

        const input = getByPlaceholderText('Add a comment...')
        fireEvent.changeText(input, 'A new comment')

        const button = getByText('send')
        fireEvent.press(button)

        expect(spy).toHaveBeenCalled()
        await waitFor(() => {
            expect(getByText('Add error')).toBeTruthy()
        })
    })

    it('should handle delete error', async () => {
        const spy = jest
            .spyOn(SavedActionData, 'deleteComment')
            .mockReturnValue(Promise.reject({ message: 'Delete error' }))

        const { queryByText, getAllByRole } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <CommentScreen {...props} />
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeTruthy()
        })

        const xButton = getAllByRole('button')[3]
        fireEvent.press(xButton)

        expect(spy).toHaveBeenCalled()

        await waitFor(() => {
            expect(queryByText('Delete error')).toBeTruthy()
        })
    })
})
