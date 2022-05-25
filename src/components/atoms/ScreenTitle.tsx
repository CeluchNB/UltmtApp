import * as React from 'react'
import { useColors } from '../../hooks'
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native'
import { size, weight } from '../../theme/fonts'

const ScreenTitle: React.FC<{
    title: string
    style?: StyleProp<TextStyle>
}> = ({ title, style }) => {
    const { colors } = useColors()
    const selfStyle = StyleSheet.create({
        title: {
            fontSize: size.fontLarge,
            color: colors.textPrimary,
            fontWeight: weight.bold,
        },
    })

    return (
        <Text style={[selfStyle.title, style]} numberOfLines={1}>
            {title}
        </Text>
    )
}

export default ScreenTitle
