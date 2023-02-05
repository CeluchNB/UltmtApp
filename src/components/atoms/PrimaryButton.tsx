import * as React from 'react'
import { Button } from 'react-native-paper'
import { useTheme } from '../../hooks'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

interface PrimaryButtonProps {
    text: string
    onPress: () => void
    loading: boolean
    style?: StyleProp<ViewStyle>
    disabled?: boolean
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    text,
    onPress,
    loading,
    style,
    disabled = false,
}) => {
    const {
        theme: { colors, id },
    } = useTheme()

    const selfStyle = StyleSheet.create({
        button: {
            backgroundColor: disabled ? colors.gray : colors.textPrimary,
        },
    })

    return (
        <Button
            mode="contained"
            compact={true}
            dark={id === 'light'}
            uppercase={true}
            disabled={disabled}
            style={[selfStyle.button, style]}
            onPress={onPress}
            loading={loading}>
            {text}
        </Button>
    )
}

export default PrimaryButton
