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
    rightIcon?: boolean
    onRightPress?: () => {}
}

const UserInput: React.FC<UserInputProps> = ({
    placeholder,
    isPassword,
    onChangeText,
    value,
    style,
    rightIcon,
    onRightPress,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        inputStyle: {
            backgroundColor: colors.primary,
            placeholderTextColor: colors.secondary,
        },
        rightButton: {
            color: colors.textPrimary,
        },
    })

    return (
        <TextInput
            style={[styles.inputStyle, style]}
            placeholder={placeholder}
            mode="outlined"
            outlineColor={colors.textSecondary}
            activeOutlineColor={colors.textPrimary}
            secureTextEntry={isPassword}
            onChangeText={onChangeText}
            value={value}
            right={
                rightIcon && (
                    <TextInput.Icon
                        name="eye"
                        color={colors.textPrimary}
                        onPressIn={onRightPress}
                        onPressOut={onRightPress}
                        testID="right-button"
                    />
                )
            }
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
