import DatePicker from 'react-native-date-picker'
import { TextInput } from 'react-native-paper'
import { useColors } from '../../hooks'
import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'

interface TextDateInputProps {
    value: Date
    onChange: (date: Date) => void
}

const TextDateInput: React.FC<TextDateInputProps> = ({ value, onChange }) => {
    const { colors } = useColors()
    const [open, setOpen] = useState(false)

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
        },
    })

    return (
        <View>
            <View style={styles.container}>
                <TextInput
                    style={{
                        backgroundColor: colors.primary,
                        color: colors.textPrimary,
                    }}
                    outlineColor={colors.textPrimary}
                    activeOutlineColor={colors.textPrimary}
                    placeholder={value.toLocaleDateString('en-US')}
                    placeholderTextColor={colors.textPrimary}
                    mode="outlined"
                    onPressOut={() => {
                        setOpen(true)
                    }}
                    focusable={false}
                />
            </View>
            <DatePicker
                modal
                open={open}
                date={value}
                mode="date"
                minimumDate={new Date('2022-01-01')}
                maximumDate={new Date()}
                onConfirm={date => {
                    setOpen(false)
                    onChange(date)
                }}
                onCancel={() => {
                    setOpen(false)
                }}
            />
        </View>
    )
}

export default TextDateInput
