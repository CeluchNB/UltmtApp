import * as AuthServices from '../../../src/services/data/auth'
import * as SavedActionData from '../../../src/services/data/saved-action'
import * as UserServices from '../../../src/services/data/user'
import * as useLivePoint from '../../../src/hooks/useLivePoint'
import ActionStack from '../../../src/utils/action-stack'
import { CommentProps } from '../../../src/types/navigation'
import CommentScreen from '../../../src/screens/games/CommentScreen'
import { NavigationContainer } from '@react-navigation/native'
import { Provider } from 'react-redux'
import React from 'react'
import { SavedServerActionData } from '../../../src/types/action'
import store from '../../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
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

jest.mock('react-native/Libraries/Animated/animations/TimingAnimation')

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

const client = new QueryClient()

describe('Live CommentScreen', () => {
    const mockActionStack = new ActionStack()
    const mockOnComment = jest.fn()
    const mockOnDeleteComment = jest.fn()

    const props: CommentProps = {
        navigation: {} as any,
        route: {
            params: { live: true, gameId: 'game1', pointId: 'point1' },
        } as any,
    }

    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    beforeEach(() => {
        store.dispatch(setSavedAction(updatedSavedAction))
        store.dispatch(setLiveAction(liveAction))
        jest.spyOn(AuthServices, 'isLoggedIn').mockReturnValue(
            Promise.resolve(true),
        )
        jest.spyOn(UserServices, 'getUserId').mockReturnValue(
            Promise.resolve('user1'),
        )
        jest.spyOn(useLivePoint, 'default').mockReturnValue({
            actionStack: mockActionStack,
            error: 'Live error',
            onComment: mockOnComment,
            onDeleteComment: mockOnDeleteComment,
            setActionStack: jest.fn(),
            onAction: jest.fn(),
            onNextPoint: jest.fn(),
            onUndo: jest.fn(),
            waiting: false,
        })
    })
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )
        await waitFor(() => {
            expect(snapshot.getByText('Test comment')).toBeTruthy()
        })
        expect(snapshot).toMatchSnapshot()
    })

    it('should handle live submit', async () => {
        mockOnComment.mockImplementationOnce((_arg1, _arg2, _arg3, arg4) => {
            store.dispatch(
                setLiveAction({
                    ...liveAction,
                    comments: [
                        ...liveAction.comments,
                        {
                            user: {
                                _id: 'id',
                                firstName: 'first',
                                lastName: 'last',
                                username: 'username',
                            },
                            comment: arg4,
                            commentNumber: 2,
                        },
                    ],
                }),
            )
        })
        const { getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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

        await waitFor(() => {
            expect(getByText('A new comment')).toBeTruthy()
        })
    })

    it('should handle delete live comment', async () => {
        mockOnDeleteComment.mockImplementationOnce(() => {
            store.dispatch(setLiveAction({ ...liveAction, comments: [] }))
        })
        const { queryByText, getAllByRole } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeTruthy()
        })

        const button = getAllByRole('button')[3]
        fireEvent.press(button)

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeFalsy()
        })
    })

    it('with live error', async () => {
        const { queryByText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
                </Provider>
            </NavigationContainer>,
        )

        await waitFor(() => {
            expect(queryByText('Test comment')).toBeTruthy()
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

    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    beforeEach(() => {
        store.dispatch(setSavedAction(updatedSavedAction))
        store.dispatch(setLiveAction(liveAction))
        jest.spyOn(AuthServices, 'isLoggedIn').mockReturnValue(
            Promise.resolve(true),
        )
        jest.spyOn(UserServices, 'getUserId').mockReturnValue(
            Promise.resolve('user1'),
        )
        jest.spyOn(useLivePoint, 'default').mockReturnValue({
            actionStack: new ActionStack(),
            error: undefined,
            onComment: jest.fn(),
            onDeleteComment: jest.fn(),
            setActionStack: jest.fn(),
            onAction: jest.fn(),
            onNextPoint: jest.fn(),
            onUndo: jest.fn(),
            waiting: false,
        })
    })
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should match snapshot', async () => {
        const snapshot = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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
            .mockRejectedValue({ message: 'Add error' })

        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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
            .mockRejectedValue({ message: 'Delete error' })

        const { queryByText, getAllByRole } = render(
            <NavigationContainer>
                <Provider store={store}>
                    <QueryClientProvider client={client}>
                        <CommentScreen {...props} />
                    </QueryClientProvider>
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
