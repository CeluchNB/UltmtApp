import React from 'react'
import SearchBar from '../../../src/components/atoms/SearchBar'
import { act, fireEvent, render } from '@testing-library/react-native'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

it('should match snapshot', () => {
    const snapshot = render(
        <SearchBar
            placeholder="Search stuff..."
            focusable={false}
            filter={true}
            onChangeText={() => {}}
            onFilterPress={() => {}}
            onPress={() => {}}
        />,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should match snapshot with minimal props', () => {
    const snapshot = render(
        <SearchBar placeholder="Search stuff..." />,
    ).toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('should fire on press button', () => {
    const onPress = jest.fn()
    const { getByPlaceholderText } = render(
        <SearchBar
            placeholder="Search stuff..."
            focusable={false}
            filter={true}
            onChangeText={() => {}}
            onFilterPress={() => {}}
            onPress={onPress}
        />,
    )

    const bar = getByPlaceholderText('Search stuff...')
    fireEvent(bar, 'onPressOut')
    expect(onPress).toHaveBeenCalled()
})

it('should fire change text', async () => {
    const onChangeText = jest.fn()
    const { getByPlaceholderText } = render(
        <SearchBar
            placeholder="Search stuff..."
            focusable={false}
            filter={true}
            onChangeText={onChangeText}
            onFilterPress={() => {}}
            onPress={() => {}}
        />,
    )

    const bar = getByPlaceholderText('Search stuff...')
    fireEvent.changeText(bar, 'test')
    await act(async () => {})
    expect(onChangeText).toHaveBeenCalledWith('test')
})

it('should press filter', () => {
    const onFilter = jest.fn()
    const { getByText } = render(
        <SearchBar
            placeholder="Search stuff..."
            focusable={false}
            filter={true}
            onChangeText={() => {}}
            onFilterPress={onFilter}
            onPress={() => {}}
        />,
    )

    const filter = getByText('Filter')
    fireEvent.press(filter)
    expect(onFilter).toHaveBeenCalled()
})
