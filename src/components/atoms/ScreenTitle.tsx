import * as React from 'react'
import { useTheme } from '../../hooks'
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native'

const ScreenTitle: React.FC<{
    title: string
    style?: StyleProp<TextStyle>
}> = ({ title, style }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const selfStyle = StyleSheet.create({
        title: {
            fontSize: size.fontThirty,
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
