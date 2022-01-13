import React from 'react'
import { TextInput } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

interface UserInputProps {
    placeholder: string
    isPassword?: boolean
    onChangeText?: (...event: any[]) => void
    value?: string
    style?: StyleProp<ViewStyle>
}

const UserInput: React.FC<UserInputProps> = props => {
    const { colors } = useColors()

    const selfStyle = StyleSheet.create({
        inputStyle: {
            backgroundColor: colors.primary,
            placeholderTextColor: colors.secondary,
        },
    })

    return (
        <TextInput
            style={[selfStyle.inputStyle, props.style]}
            placeholder={props.placeholder}
            mode="outlined"
            outlineColor={colors.textSecondary}
            activeOutlineColor={colors.textPrimary}
            secureTextEntry={props.isPassword}
            onChangeText={props.onChangeText}
            value={props.value}
            theme={{
                colors: {
                    text: colors.textPrimary,
                    placeholder: colors.secondary,
                },
            }}
        />
    )
}

export default UserInput
