import * as React from 'react'
import SearchResultItem from '../../../src/components/atoms/SearchResultItem'
import renderer from 'react-test-renderer'
import { fireEvent, render } from '@testing-library/react-native'

it('test matches snapshot', () => {
    const snapshot = renderer.create(
        <SearchResultItem
            header="header"
            subheader="subheader"
            loading={false}
            onPress={() => ({})}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('test matches snapshot with loading', () => {
    const snapshot = renderer.create(
        <SearchResultItem
            header="item"
            subheader="subheader"
            loading={true}
            onPress={() => ({})}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('test matches snapshot without subheader', () => {
    const snapshot = renderer.create(
        <SearchResultItem header="item" loading={true} onPress={() => ({})} />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('test item press', () => {
    const mockFn = jest.fn()
    const { getByText } = render(
        <SearchResultItem header="item" loading={false} onPress={mockFn} />,
    )

    const view = getByText('item')
    fireEvent.press(view)

    expect(mockFn).toBeCalled()
})

it('test error exists', () => {
    const { getByText } = render(
        <SearchResultItem
            header="item"
            loading={false}
            onPress={() => {}}
            error="Test error"
        />,
    )
    const errorView = getByText('Test error')
    expect(errorView).toBeTruthy()
})
