import { InGameStatsUserFactory } from '../../test-data/user'
import { ReactNode } from 'react'
import { useSelectPlayers } from '@ultmt-app/hooks/game-edit-actions/use-select-players'
import { withRealm } from '../../utils/renderers'
import { act, renderHook } from '@testing-library/react-native'

// let realmData: import('realm')

const getWrapper = () => {
    const wrapper = ({ children }: { children: ReactNode }) => {
        return withRealm(children, realm => {
            // realmData = realm
            realm.write(() => {
                realm.deleteAll()
            })
        })
    }
    return wrapper
}

describe('use-select-players', () => {
    const inGameStatusUser = InGameStatsUserFactory.build()

    it('selects players', async () => {
        const { result } = renderHook(
            () => useSelectPlayers('', [inGameStatusUser]),
            {
                wrapper: getWrapper(),
            },
        )
        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })

        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)
    })

    // it('deselects player', () => {
    //     const { result } = renderHook(() => useSelectPlayers())
    //     act(() => {
    //         result.current.toggleSelection(inGameStatusUser)
    //     })

    //     expect(result.current.selectedPlayers[0]).toMatchObject(
    //         inGameStatusUser,
    //     )

    //     act(() => {
    //         result.current.toggleSelection(inGameStatusUser)
    //     })
    //     expect(result.current.selectedPlayers.length).toBe(0)
    // })

    // it('clears selection', () => {
    //     const { result } = renderHook(() => useSelectPlayers())
    //     act(() => {
    //         result.current.toggleSelection(inGameStatusUser)
    //     })

    //     expect(result.current.selectedPlayers[0]).toMatchObject(
    //         inGameStatusUser,
    //     )

    //     act(() => {
    //         result.current.clearSelection()
    //     })
    //     expect(result.current.selectedPlayers.length).toBe(0)
    // })
})
