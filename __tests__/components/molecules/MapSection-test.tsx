import '@testing-library/jest-native/extend-expect'
import * as React from 'react'
import MapSection from '../../../src/components/molecules/MapSection'
import { Text } from 'react-native'
import renderer from 'react-test-renderer'
import { fireEvent, render } from '@testing-library/react-native'

it('matches snapshot', () => {
    const snapshot = renderer.create(
        <MapSection
            title="title"
            listData={['item1', 'item2']}
            renderItem={item => {
                return <Text key={item}>{item}</Text>
            }}
            showButton={true}
            showCreateButton={true}
            loading={true}
        />,
    )

    expect(snapshot).toMatchSnapshot()
})

it('displays items correctly', () => {
    const { getByText } = render(
        <MapSection
            title="title"
            listData={['item1', 'item2']}
            renderItem={item => {
                return <Text key={item}>{item}</Text>
            }}
            showButton={true}
            showCreateButton={true}
        />,
    )

    const item1 = getByText('item1')
    const item2 = getByText('item2')
    expect(item1).toBeTruthy()
    expect(item2).toBeTruthy()
})

it('button press fires', () => {
    const fn = jest.fn()
    const { queryByTestId } = render(
        <MapSection
            title="title"
            listData={['item1', 'item2']}
            renderItem={item => {
                return <Text key={item}>{item}</Text>
            }}
            showButton={true}
            onButtonPress={fn}
            showCreateButton={true}
        />,
    )

    const button = queryByTestId('more-button')
    if (!button) {
        throw new Error('button does not exist')
    }
    fireEvent.press(button)
    expect(fn).toHaveBeenCalled()
})

it('create button fires', () => {
    const fn = jest.fn()
    const { queryByTestId } = render(
        <MapSection
            title="title"
            listData={['item1', 'item2']}
            renderItem={item => {
                return <Text key={item}>{item}</Text>
            }}
            showButton={true}
            showCreateButton={true}
            onCreatePress={fn}
        />,
    )

    const button = queryByTestId('create-button')
    if (!button) {
        throw new Error('button does not exist')
    }
    fireEvent.press(button)
    expect(fn).toHaveBeenCalled()
})
