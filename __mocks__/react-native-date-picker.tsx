import React from 'react'
import { Button, Text, View } from 'react-native'

const DatePicker: React.FC<{
    open: boolean
    onConfirm: (date: Date) => void
    onCancel: () => void
}> = ({ open, onConfirm, onCancel }) => {
    if (!open) {
        return null
    }

    return (
        <View>
            <Text>Open modal</Text>
            <Button
                title="confirm"
                onPress={() => {
                    onConfirm(new Date('01-01-2021'))
                }}
            />
            <Button title="cancel" onPress={onCancel} />
        </View>
    )
}

export default DatePicker
