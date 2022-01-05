import * as React from 'react'
import { Button } from 'react-native-paper'
import { ColorPalette, darkColors, lightColors } from '../theme/colors'
import { StyleSheet, useColorScheme } from 'react-native'

const PrimaryButton: React.FC<{ text: string }> = ({ text }) => {
    const isDarkMode = useColorScheme() === 'dark'
    const colors: ColorPalette = isDarkMode ? darkColors : lightColors

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
            style={styles.button}>
            {text}
        </Button>
    )
}

export default PrimaryButton
