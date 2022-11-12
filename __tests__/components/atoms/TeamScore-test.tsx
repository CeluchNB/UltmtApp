import React from 'react'
import TeamScore from '../../../src/components/atoms/TeamScore'
import { render } from '@testing-library/react-native'

it('should match snapshot with all data', () => {
    const snapshot = render(<TeamScore name="test" teamname="team" score={2} />)
    expect(snapshot.toJSON()).toMatchSnapshot()
})

it('should match snapshot with no teamname', () => {
    const snapshot = render(<TeamScore name="test" score={2} />)
    expect(snapshot.toJSON()).toMatchSnapshot()
})
