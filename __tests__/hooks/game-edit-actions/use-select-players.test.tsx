import { BSON } from 'realm'
import { InGameStatsUserFactory } from '../../test-data/user'
import { LineSchema } from '@ultmt-app/models'
import { ReactNode } from 'react'
import { useSelectPlayers } from '@ultmt-app/hooks/game-edit-actions/use-select-players'
import { withRealm } from '../../utils/renderers'
import { act, renderHook } from '@testing-library/react-native'

// let realmData: import('realm')
const inGameStatusUser = InGameStatsUserFactory.build()
const gameId = new BSON.ObjectId().toHexString()
const line1 = new LineSchema({
    gameId,
    name: 'offense',
    players: [inGameStatusUser],
})
const line2 = new LineSchema({
    gameId,
    name: 'defense',
    players: [inGameStatusUser],
})

const getWrapper = () => {
    const wrapper = ({ children }: { children: ReactNode }) => {
        return withRealm(children, realm => {
            realm.write(() => {
                realm.deleteAll()
                realm.create('Line', line1)
                realm.create('Line', line2)
            })
        })
    }
    return wrapper
}

describe('use-select-players', () => {
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

    it('deselects player', () => {
        const { result } = renderHook(
            () => useSelectPlayers('', [inGameStatusUser]),
            { wrapper: getWrapper() },
        )
        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })

        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)

        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(false)
    })

    it('clears selection', () => {
        const { result } = renderHook(
            () => useSelectPlayers('', [inGameStatusUser]),
            { wrapper: getWrapper() },
        )
        act(() => {
            result.current.toggleSelection(inGameStatusUser)
        })

        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)

        act(() => {
            result.current.clearSelection()
        })
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(false)
    })

    it('selects line', () => {
        const { result } = renderHook(
            () => useSelectPlayers(gameId, [inGameStatusUser]),
            { wrapper: getWrapper() },
        )

        act(() => {
            result.current.toggleLine(line1._id?.toHexString() ?? '')
        })

        expect(
            result.current.lineOptions[line1._id?.toHexString() ?? ''].selected,
        ).toBe(true)
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)
    })

    it('deselects line', () => {
        const { result } = renderHook(
            () => useSelectPlayers(gameId, [inGameStatusUser]),
            { wrapper: getWrapper() },
        )

        act(() => {
            result.current.toggleLine(line1._id?.toHexString() ?? '')
        })

        expect(
            result.current.lineOptions[line1._id?.toHexString() ?? ''].selected,
        ).toBe(true)
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)

        act(() => {
            result.current.toggleLine(line1._id?.toHexString() ?? '')
        })

        expect(
            result.current.lineOptions[line1._id?.toHexString() ?? ''].selected,
        ).toBe(false)
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(false)
    })

    it('keeps selected line players', () => {
        const { result } = renderHook(
            () => useSelectPlayers(gameId, [inGameStatusUser]),
            { wrapper: getWrapper() },
        )

        act(() => {
            result.current.toggleLine(line1._id?.toHexString() ?? '')
            result.current.toggleLine(line2._id?.toHexString() ?? '')
        })

        expect(
            result.current.lineOptions[line1._id?.toHexString() ?? ''].selected,
        ).toBe(true)
        expect(
            result.current.lineOptions[line2._id?.toHexString() ?? ''].selected,
        ).toBe(true)
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)

        act(() => {
            result.current.toggleLine(line1._id?.toHexString() ?? '')
        })

        expect(
            result.current.lineOptions[line1._id?.toHexString() ?? ''].selected,
        ).toBe(false)
        expect(
            result.current.lineOptions[line2._id?.toHexString() ?? ''].selected,
        ).toBe(true)
        expect(
            result.current.playerOptions[inGameStatusUser._id].selected,
        ).toBe(true)
    })
})
