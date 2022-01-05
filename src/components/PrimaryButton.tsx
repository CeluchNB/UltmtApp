import * as React from 'react'
import { Button } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { useColors } from '../hooks/useColors'

interface PrimaryButtonProps {
    text: string
    onPress: () => {}
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ text, onPress }) => {
    const { colors, isDarkMode } = useColors()

    const styles = StyleSheet.create({
        button: {
            backgroundColor: colors.textPrimary,
            marginTop: 20,
            alignSelf: 'center',
        },
    })
    return (
        <Button
            mode="contained"
            compact={true}
            dark={!isDarkMode}
            style={styles.button}
            onPress={onPress}>
            {text}
        </Button>
    )
}

export default PrimaryButton
