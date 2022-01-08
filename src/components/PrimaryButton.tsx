import * as React from 'react'
import { Button } from 'react-native-paper'
import { useColors } from '../hooks'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

interface PrimaryButtonProps {
    text: string
    onPress: () => {}
    loading: boolean
    style?: StyleProp<ViewStyle>
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    text,
    onPress,
    loading,
    style,
}) => {
    const { colors, isDarkMode } = useColors()

    const selfStyle = StyleSheet.create({
        button: {
            backgroundColor: colors.textPrimary,
        },
    })

    return (
        <Button
            mode="contained"
            compact={true}
            dark={!isDarkMode}
            style={[selfStyle.button, style]}
            onPress={onPress}
            loading={loading}>
            {text}
        </Button>
    )
}

export default PrimaryButton
