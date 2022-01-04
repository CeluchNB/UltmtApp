import * as React from 'react'
import { StyleSheet, Text, useColorScheme } from 'react-native'
import { darkColors, lightColors } from '../theme/colors'
import { size, weight } from '../theme/fonts'

const ScreenTitle: React.FC<{ title: string }> = ({ title }) => {
    const style = StyleSheet.create({
        title: {
            fontSize: size.fontLarge,
            color:
                useColorScheme() === 'dark'
                    ? darkColors.textPrimary
                    : lightColors.textPrimary,
            fontWeight: weight.bold,
            alignSelf: 'center',
            marginTop: 50,
        },
    })

    return <Text style={style.title}>{title}</Text>
}

export default ScreenTitle
