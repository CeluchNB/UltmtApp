import { InGameStatsUserFactory } from '../../test-data/user'
import { useSelectPlayers } from '@ultmt-app/hooks/game-edit-actions/use-select-players'
import { act, renderHook } from '@testing-library/react-native'

describe('use-select-players', () => {
    const inGameStatusUser = InGameStatsUserFactory.build()

    it('selects players', async () => {
        const { result } = renderHook(() => useSelectPlayers())
        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })

        expect(result.current.selectedPlayers[0]).toMatchObject(
            inGameStatusUser,
        )
    })

    it('deselects player', () => {
        const { result } = renderHook(() => useSelectPlayers())
        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })

        expect(result.current.selectedPlayers[0]).toMatchObject(
            inGameStatusUser,
        )

        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })
        expect(result.current.selectedPlayers.length).toBe(0)
    })

    it('clears selection', () => {
        const { result } = renderHook(() => useSelectPlayers())
        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })

        expect(result.current.selectedPlayers[0]).toMatchObject(
            inGameStatusUser,
        )

        act(() => {
            result.current.clearSelection()
        })
        expect(result.current.selectedPlayers.length).toBe(0)
    })
})
