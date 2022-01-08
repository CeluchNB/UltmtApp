import * as React from 'react'
import {
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    useColorScheme,
} from 'react-native'
import { darkColors, lightColors } from '../../theme/colors'
import { size, weight } from '../../theme/fonts'

const ScreenTitle: React.FC<{
    title: string
    style?: StyleProp<TextStyle>
}> = ({ title, style }) => {
    const selfStyle = StyleSheet.create({
        title: {
            fontSize: size.fontLarge,
            color:
                useColorScheme() === 'dark'
                    ? darkColors.textPrimary
                    : lightColors.textPrimary,
            fontWeight: weight.bold,
        },
    })

    return <Text style={[selfStyle.title, style]}>{title}</Text>
}

export default ScreenTitle
