import LivePointUtilityBar from '../../../src/components/molecules/LivePointUtilityBar'
import React from 'react'
import { fireEvent, render } from '@testing-library/react-native'

describe('LivePointUtilityBar', () => {
    it('matches base snapshot', () => {
        const onUndo = jest.fn()
        const snapshot = render(
            <LivePointUtilityBar
                undoButton={{
                    onPress: onUndo,
                    disabled: false,
                    visible: true,
                }}
                lineBuilderButton={{
                    onPress: () => {},
                    disabled: false,
                    visible: false,
                }}
                loading={false}
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
                undoButton={{
                    onPress: onUndo,
                    disabled: true,
                    visible: true,
                }}
                lineBuilderButton={{
                    onPress: () => {},
                    disabled: false,
                    visible: false,
                }}
                loading={true}
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
                undoButton={{
                    onPress: () => {},
                    disabled: false,
                    visible: true,
                }}
                lineBuilderButton={{
                    onPress: () => {},
                    disabled: false,
                    visible: false,
                }}
                loading={false}
                onEdit={onEdit}
            />,
        )

        const editBtn = snapshot.getByTestId('edit-button')
        fireEvent.press(editBtn)
        expect(onEdit).toHaveBeenCalled()
    })
})
