import * as PointData from '../../../src/services/data/point'
import ChangePullingTeamModal from '../../../src/components/molecules/ChangePullingTeamModal'
import { Provider } from 'react-redux'
import React from 'react'
import { setPoint } from '../../../src/store/reducers/features/point/livePointReducer'
import store from '../../../src/store/store'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react-native'
import { game, point } from '../../../fixtures/data'

const client = new QueryClient()

describe('ChangePullingTeamModal', () => {
    beforeAll(() => {
        jest.useFakeTimers({ legacyFakeTimers: true })
    })
    afterAll(() => {
        jest.useRealTimers()
    })

    it('displays correctly', () => {
        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <ChangePullingTeamModal
                        visible={true}
                        team="one"
                        game={game}
                        pointId="pointId"
                        onClose={jest.fn()}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText(game.teamOne.name)).toBeTruthy()
        expect(screen.getByText(game.teamTwo.name)).toBeTruthy()
    })

    it('handles submit', async () => {
        store.dispatch(setPoint(point))
        const updatedPoint = {
            ...point,
            pullingTeam: game.teamTwo,
            receivingTeam: game.teamOne,
        }
        jest.spyOn(PointData, 'setPullingTeam').mockReturnValue(
            Promise.resolve(updatedPoint),
        )

        const onClose = jest.fn()

        render(
            <Provider store={store}>
                <QueryClientProvider client={client}>
                    <ChangePullingTeamModal
                        visible={true}
                        team="one"
                        game={game}
                        pointId="pointId"
                        onClose={onClose}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // press team one first
        const teamOne = screen.getByText(game.teamOne.name)
        fireEvent.press(teamOne)

        const teamTwo = screen.getByText(game.teamTwo.name)
        fireEvent.press(teamTwo)

        const submitBtn = screen.getByText('submit')
        fireEvent.press(submitBtn)

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled()
        })

        expect(store.getState().livePoint.point).toMatchObject(updatedPoint)
    })
})
