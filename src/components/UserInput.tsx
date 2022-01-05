import React from 'react'
import { TextInput } from 'react-native-paper'
import { ColorPalette, darkColors, lightColors } from '../theme/colors'
import { StyleSheet, useColorScheme } from 'react-native'

export interface UserInputProps {
    placeholder: string
}

const UserInput: React.FC<UserInputProps> = props => {
    const isDarkMode = useColorScheme() === 'dark'
    const colors: ColorPalette = isDarkMode ? darkColors : lightColors

    const styles = StyleSheet.create({
        inputStyle: {
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            marginTop: 20,
            marginStart: 50,
            marginEnd: 50,
        },
    })

    return (
        <TextInput
            style={styles.inputStyle}
            placeholder={props.placeholder}
            placeholderTextColor={colors.secondary}
            mode="outlined"
            outlineColor={colors.textSecondary}
            activeOutlineColor={colors.textPrimary}
        />
    )
}

export default UserInput
