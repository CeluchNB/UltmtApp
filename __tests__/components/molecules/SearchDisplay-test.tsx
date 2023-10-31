import React from 'react'
import SearchDisplay from '../../../src/components/molecules/SearchDisplay'
import { Text } from 'react-native'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const client = new QueryClient()

describe('SearchDisplay', () => {
    beforeAll(() => {
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    it('should render', async () => {
        render(
            <QueryClientProvider client={client}>
                <SearchDisplay
                    placeholder="Search teams..."
                    value="test"
                    search={jest.fn()}
                    renderItem={jest.fn()}
                    onChangeText={jest.fn()}
                />
            </QueryClientProvider>,
        )

        await waitForElementToBeRemoved(() =>
            screen.getByTestId('search-indicator'),
        )
        expect(screen.getByPlaceholderText('Search teams...')).toBeTruthy()
    })

    it('should handle search', async () => {
        const searchFn = jest
            .fn()
            .mockReturnValue(Promise.resolve(['Game 1', 'Game 2']))
        const onChangeFn = jest.fn()
        const renderFn = jest
            .fn()
            .mockImplementation(({ item }) => <Text>{item}</Text>)

        render(
            <QueryClientProvider client={client}>
                <SearchDisplay
                    placeholder="Search teams..."
                    search={searchFn}
                    renderItem={renderFn}
                    onChangeText={onChangeFn}
                />
            </QueryClientProvider>,
        )

        const input = screen.getByPlaceholderText('Search teams...')
        fireEvent.changeText(input, 'test')

        expect(searchFn).toHaveBeenCalledWith('test')
        expect(onChangeFn).toHaveBeenCalledWith('test')

        await waitForElementToBeRemoved(() =>
            screen.getByTestId('search-indicator'),
        )
        expect(renderFn).toHaveBeenCalled()

        expect(screen.getByText('Game 1')).not.toBeNull()
        expect(screen.getByText('Game 2')).not.toBeNull()
    })
})
