import React from 'react'
import { StyleSheet } from 'react-native'
import { TextInput } from 'react-native-paper'
import { useColors } from '../hooks/useColors'

interface UserInputProps {
    placeholder: string
    isPassword?: boolean
    onChangeText?: (...event: any[]) => void
    value?: string
}

const UserInput: React.FC<UserInputProps> = props => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        inputStyle: {
            backgroundColor: colors.primary,
            marginTop: 20,
            marginStart: 50,
            marginEnd: 50,
            placeholderTextColor: colors.secondary,
        },
    })

    return (
        <TextInput
            style={styles.inputStyle}
            placeholder={props.placeholder}
            mode="outlined"
            outlineColor={colors.textSecondary}
            activeOutlineColor={colors.textPrimary}
            secureTextEntry={props.isPassword}
            onChangeText={props.onChangeText}
            value={props.value}
            theme={{ colors: { text: colors.textPrimary } }}
        />
    )
}

export default UserInput
