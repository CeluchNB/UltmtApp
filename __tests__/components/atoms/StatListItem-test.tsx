import * as React from 'react'
import { DisplayStat } from '../../../src/types/stats'
import StatListItem from '../../../src/components/atoms/StatListItem'
import { render } from '@testing-library/react-native'
import renderer from 'react-test-renderer'

const stat: DisplayStat = {
    name: 'Goals',
    value: 10,
    points: 100,
}

it('test matches snapshot', () => {
    const snapshot = renderer.create(<StatListItem stat={stat} />)
    expect(snapshot).toMatchSnapshot()
})

it('test renders correct view', () => {
    const { getByText } = render(<StatListItem stat={stat} />)

    const title = getByText('Goals')
    const value = getByText(stat.value.toString())

    expect(title).toBeTruthy()
    expect(value).toBeTruthy()
})
