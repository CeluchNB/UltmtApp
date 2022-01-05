import * as React from 'react'
import PrimaryButton from '../components/PrimaryButton'
import ScreenTitle from '../components/ScreenTitle'
import UserInput from '../components/UserInput'
import { ColorPalette, darkColors, lightColors } from '../theme/colors'
import { StyleSheet, View, useColorScheme } from 'react-native'

const LoginScreen: React.FC<{}> = () => {
    const isDarkMode = useColorScheme() === 'dark'
    const colors: ColorPalette = isDarkMode ? darkColors : lightColors
    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
        },
    })
    return (
        <View style={styles.screen}>
            <ScreenTitle title="Login" />
            <UserInput placeholder="Username" />
            <UserInput placeholder="Password" />
            <PrimaryButton text="Login" />
        </View>
    )
}

export default LoginScreen
