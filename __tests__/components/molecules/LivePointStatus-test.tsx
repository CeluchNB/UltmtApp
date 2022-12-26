import LivePointStatus from '../../../src/components/molecules/LivePointStatus'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('LivePointStatus', () => {
    it('matches base snapshot', () => {
        const onUndo = jest.fn()
        const snapshot = render(
            <LivePointStatus
                undoDisabled={false}
                loading={false}
                onUndo={onUndo}
            />,
        )

        const undoBtn = snapshot.getByRole('button')
        fireEvent.press(undoBtn)
        expect(onUndo).toHaveBeenCalled()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('matches snapshot while loading', () => {
        const onUndo = jest.fn()
        const snapshot = render(
            <LivePointStatus
                undoDisabled={true}
                loading={true}
                onUndo={jest.fn()}
            />,
        )

        const undoBtn = snapshot.getByRole('button')
        fireEvent.press(undoBtn)
        expect(onUndo).not.toHaveBeenCalled()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })
})
