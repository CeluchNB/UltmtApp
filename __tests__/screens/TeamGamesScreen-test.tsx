import * as GameData from '../../src/services/data/game'
import { DisplayTeam } from '../../src/types/team'
import { Game } from '../../src/types/game'
import { Provider } from 'react-redux'
import React from 'react'
import { TeamGameProps } from '../../src/types/navigation'
import TeamGameScreen from '../../src/screens/TeamGamesScreen'
import { fetchProfileData } from '../../fixtures/data'
import { setProfile } from '../../src/store/reducers/features/account/accountReducer'
import store from '../../src/store/store'
import { fireEvent, render, waitFor } from '@testing-library/react-native'

export const getGame = (team: DisplayTeam): Game => {
    return {
        _id: 'game1',
        creator: {
            _id: 'user1',
            firstName: 'First 1',
            lastName: 'Last 1',
            username: 'first1last1',
        },
        teamOne: team,
        teamTwo: { name: 'Sockeye' },
        teamTwoDefined: false,
        scoreLimit: 15,
        halfScore: 8,
        teamOneScore: 3,
        teamTwoScore: 0,
        startTime: new Date('2022-10-12'),
        softcapMins: 75,
        hardcapMins: 90,
        teamOneActive: true,
        teamTwoActive: false,
        playersPerPoint: 7,
        resolveCode: '111111',
        timeoutPerHalf: 1,
        floaterTimeout: true,
        teamOnePlayers: [],
        teamTwoPlayers: [],
        tournament: undefined,
        points: [],
    }
}

const props: TeamGameProps = {
    navigation: {
        navigate: jest.fn(),
    } as any,
    route: {} as any,
}

describe('TeamGamesScreen', () => {
    beforeEach(() => {
        jest.spyOn(GameData, 'getGamesByTeam').mockImplementation(
            async (teamId: string) => {
                if (teamId === fetchProfileData.managerTeams[0]._id) {
                    return [getGame(fetchProfileData.managerTeams[0])]
                }
                return [getGame(fetchProfileData.playerTeams[0])]
            },
        )
        store.dispatch(setProfile(fetchProfileData))
    })
    it('matches snapshot', async () => {
        const snapshot = render(
            <Provider store={store}>
                <TeamGameScreen {...props} />
            </Provider>,
        )
        await waitFor(async () => {
            expect(snapshot.getAllByText(`3 - 0`).length).toBe(2)
        })
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('navigates on press', async () => {
        const { getAllByText } = render(
            <Provider store={store}>
                <TeamGameScreen {...props} />
            </Provider>,
        )
        await waitFor(async () => {
            expect(getAllByText(`3 - 0`).length).toBe(2)
        })
        const team = getAllByText('3 - 0')[0]
        fireEvent.press(team)

        expect(props.navigation.navigate).toHaveBeenCalledWith('Tabs', {
            screen: 'Games',
            params: {
                screen: 'ViewGame',
                params: { gameId: 'game1' },
            },
        })
    })
})
