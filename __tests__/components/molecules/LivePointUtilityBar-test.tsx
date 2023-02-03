import LivePointUtilityBar from '../../../src/components/molecules/LivePointUtilityBar'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('LivePointStatus', () => {
    it('matches base snapshot', () => {
        const onUndo = jest.fn()
        const snapshot = render(
            <LivePointUtilityBar
                undoDisabled={false}
                loading={false}
                onUndo={onUndo}
                onEdit={() => {}}
            />,
        )

        const undoBtn = snapshot.getByTestId('undo-button')
        fireEvent.press(undoBtn)
        expect(onUndo).toHaveBeenCalled()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('matches snapshot while loading', () => {
        const onUndo = jest.fn()
        const snapshot = render(
            <LivePointUtilityBar
                undoDisabled={true}
                loading={true}
                onUndo={jest.fn()}
                onEdit={() => {}}
            />,
        )

        const undoBtn = snapshot.getByTestId('undo-button')
        fireEvent.press(undoBtn)
        expect(onUndo).not.toHaveBeenCalled()
        expect(snapshot.toJSON()).toMatchSnapshot()
    })

    it('presses edit button', () => {
        const onEdit = jest.fn()
        const snapshot = render(
            <LivePointUtilityBar
                undoDisabled={true}
                loading={false}
                onUndo={jest.fn()}
                onEdit={onEdit}
            />,
        )

        const editBtn = snapshot.getByTestId('edit-button')
        fireEvent.press(editBtn)
        expect(onEdit).toHaveBeenCalled()
    })
})
