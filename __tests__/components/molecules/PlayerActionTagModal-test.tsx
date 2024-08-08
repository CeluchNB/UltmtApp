import { InGameStatsUserFactory } from '../../test-data/user'
import { LiveGameContext } from '../../../src/context/live-game-context'
import PlayerActionTagModal from '../../../src/components/molecules/PlayerActionTagModal'
import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')
const originalWarn = console.warn.bind(console.warn)
beforeAll(() => {
    jest.useFakeTimers({ legacyFakeTimers: true })
    console.warn = msg =>
        !msg.toString().includes('flexWrap: `wrap`') && originalWarn(msg)
})
afterAll(() => {
    jest.useRealTimers()
    console.warn = originalWarn
})

const players = InGameStatsUserFactory.buildList(7)

describe('PlayerActionTagModal', () => {
    it('should match snapshot', async () => {
        const snapshot = render(
            <LiveGameContext.Provider
                value={{
                    team: 'one',
                    players,
                    tags: ['huck', 'break', 'layout'],
                    addTag: jest.fn(),
                    setCurrentPointNumber: jest.fn(),
                    finishGameMutation: {
                        mutate: jest.fn(),
                        isLoading: false,
                        error: null,
                        reset: jest.fn(),
                    },
                }}>
                <PlayerActionTagModal visible={true} onClose={jest.fn()} />
            </LiveGameContext.Provider>,
        )

        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('should add tag correctly', async () => {
        const tags = ['huck', 'break', 'layout']
        const addTag = (tag: string) => {
            tags.push(tag)
        }

        const { getByPlaceholderText, getByText, rerender } = render(
            <LiveGameContext.Provider
                value={{
                    team: 'one',
                    players,
                    tags,
                    addTag,
                    setCurrentPointNumber: jest.fn(),
                    finishGameMutation: {
                        mutate: jest.fn(),
                        isLoading: false,
                        error: null,
                        reset: jest.fn(),
                    },
                }}>
                <PlayerActionTagModal visible={true} onClose={jest.fn()} />
            </LiveGameContext.Provider>,
        )

        const tagInput = getByPlaceholderText('New tag...')
        fireEvent.changeText(tagInput, 'test')

        const addBtn = getByText('add')
        fireEvent.press(addBtn)
        rerender(
            <LiveGameContext.Provider
                value={{
                    team: 'one',
                    players,
                    tags,
                    addTag,
                    setCurrentPointNumber: jest.fn(),
                    finishGameMutation: {
                        mutate: jest.fn(),
                        isLoading: false,
                        error: null,
                        reset: jest.fn(),
                    },
                }}>
                <PlayerActionTagModal visible={true} onClose={jest.fn()} />
            </LiveGameContext.Provider>,
        )

        await waitFor(() => {
            expect(getByText('test')).toBeTruthy()
        })
    })

    it('should call close correctly', async () => {
        const onClose = jest.fn()
        const { getByText } = render(
            <LiveGameContext.Provider
                value={{
                    team: 'one',
                    players,
                    tags: ['huck', 'break', 'layout'],
                    addTag: jest.fn(),
                    setCurrentPointNumber: jest.fn(),
                    finishGameMutation: {
                        mutate: jest.fn(),
                        isLoading: false,
                        error: null,
                        reset: jest.fn(),
                    },
                }}>
                <PlayerActionTagModal visible={true} onClose={onClose} />
            </LiveGameContext.Provider>,
        )

        const huckBtn = getByText('huck')
        fireEvent.press(huckBtn)

        const doneBtn = getByText('done')
        fireEvent.press(doneBtn)
        await act(async () => {})

        expect(onClose).toBeCalledWith(true, ['huck'])
    })
})
