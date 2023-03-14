import DatePicker from 'react-native-date-picker'
import { TextInput } from 'react-native-paper'
import { useTheme } from '../../hooks'
import React, { useState } from 'react'
import { StyleProp, StyleSheet, TextStyle, View } from 'react-native'

interface TextDateInputProps {
    value: Date
    style?: StyleProp<TextStyle>
    onChange: (date: Date) => void
}

const TextDateInput: React.FC<TextDateInputProps> = ({
    value,
    style,
    onChange,
}) => {
    const {
        theme: { colors },
    } = useTheme()
    const [open, setOpen] = useState(false)

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
        },
        input: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
        },
    })

    return (
        <View>
            <View style={styles.container}>
                <TextInput
                    style={[styles.input, style]}
                    outlineColor={colors.textPrimary}
                    activeOutlineColor={colors.textPrimary}
                    placeholder={value.toLocaleDateString('en-US')}
                    placeholderTextColor={colors.textPrimary}
                    mode="outlined"
                    onPressOut={() => {
                        setOpen(true)
                    }}
                    focusable={false}
                    testID="date-text-input"
                />
            </View>
            <DatePicker
                modal
                open={open}
                date={value}
                mode="date"
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
