import * as React from 'react'
import { DisplayTeam } from '../../../src/types/team'
import TeamListItem from '../../../src/components/atoms/TeamListItem'
import renderer from 'react-test-renderer'
import { fireEvent, render } from '@testing-library/react-native'

const team: DisplayTeam = {
    _id: 'id1',
    place: 'Place1',
    name: 'Name1',
    teamname: 'teamname1',
    seasonStart: '2019',
    seasonEnd: '2019',
}

it('matches snapshot', () => {
    const snapshot = renderer.create(<TeamListItem team={team} />)

    expect(snapshot).toMatchSnapshot()
})

it('displays team in same year', () => {
    const { getByText } = render(<TeamListItem team={team} />)

    expect(getByText(`${team.place} ${team.name}`)).toBeTruthy()
    expect(getByText(team.seasonStart)).toBeTruthy()
})

it('displays team in different year', () => {
    team.seasonEnd = '2020'
    const { getByText } = render(<TeamListItem team={team} />)

    expect(getByText(`${team.place} ${team.name}`)).toBeTruthy()
    expect(getByText(`${team.seasonStart} - ${team.seasonEnd}`)).toBeTruthy()
})

it('test on press', () => {
    const onPress = jest.fn()
    const { getByText, getByTestId } = render(
        <TeamListItem team={team} onPress={onPress} />,
    )
    const userDisplay = getByText('Place1 Name1')
    fireEvent.press(userDisplay)

    const goButton = getByTestId('go-button')
    fireEvent.press(goButton)
    expect(onPress).toHaveBeenCalledTimes(2)
})
