import * as React from 'react'
import Section from '../../../src/components/molecules/Section'
import renderer from 'react-test-renderer'
import { Text, View } from 'react-native'
import { fireEvent, render } from '@testing-library/react-native'

it('matches snapshot', () => {
    const snapshot = renderer
        .create(
            <Section
                title="title"
                onButtonPress={() => ({})}
                listData={[]}
                renderItem={() => <View />}
                buttonText="button"
                showButton={true}
            />,
        )
        .toJSON()

    expect(snapshot).toMatchSnapshot()
})

it('basic list data displayed', () => {
    const mockFn = jest.fn()

    const { getByText } = render(
        <Section
            title="title"
            onButtonPress={mockFn}
            listData={['item1', 'item2', 'item3']}
            renderItem={({ item }) => {
                return <Text>{item}</Text>
            }}
            buttonText="button"
            showButton={true}
        />,
    )

    expect(getByText('title')).toBeTruthy()
    expect(getByText('item1')).toBeTruthy()
    expect(getByText('item2')).toBeTruthy()
    expect(getByText('item3')).toBeTruthy()
    expect(() => {
        getByText('item4')
    }).toThrow()

    fireEvent.press(getByText('button'))
    expect(mockFn).toHaveBeenCalledTimes(1)
})

it('display with error', () => {
    const mockFn = jest.fn()

    const { getByText } = render(
        <Section
            title="title"
            onButtonPress={mockFn}
            listData={['item1', 'item2', 'item3']}
            renderItem={({ item }) => {
                return <Text>{item}</Text>
            }}
            buttonText="button"
            showButton={false}
            error="No valid data"
        />,
    )

    expect(getByText('No valid data')).toBeTruthy()
    expect(() => {
        getByText('item1')
    }).toThrow()

    expect(() => {
        getByText('button')
    }).toThrow()
})
