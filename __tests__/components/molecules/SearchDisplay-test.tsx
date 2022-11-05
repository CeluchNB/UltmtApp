import React from 'react'
import SearchDisplay from '../../../src/components/molecules/SearchDisplay'
import { Text } from 'react-native'
import {
    fireEvent,
    render,
    waitForElementToBeRemoved,
} from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

it('should match snapshot', () => {
    const snapshot = render(
        <SearchDisplay
            value="test"
            search={jest.fn()}
            renderItem={jest.fn()}
            onChangeText={jest.fn()}
        />,
    )

    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should handle search', async () => {
    const searchFn = jest
        .fn()
        .mockReturnValue(Promise.resolve(['Game 1', 'Game 2']))
    const onChangeFn = jest.fn()
    const renderFn = jest
        .fn()
        .mockImplementation(({ item }) => <Text>{item}</Text>)

    const { getByPlaceholderText, getByText, getByTestId } = render(
        <SearchDisplay
            search={searchFn}
            renderItem={renderFn}
            onChangeText={onChangeFn}
        />,
    )

    const input = getByPlaceholderText('Search teams...')
    fireEvent.changeText(input, 'test')

    expect(searchFn).toHaveBeenCalledWith('test')
    expect(onChangeFn).toHaveBeenCalledWith('test')

    await waitForElementToBeRemoved(() => getByTestId('search-indicator'))
    expect(renderFn).toHaveBeenCalled()

    expect(getByText('Game 1')).not.toBeNull()
    expect(getByText('Game 2')).not.toBeNull()
})
