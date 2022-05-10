import * as React from 'react'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import {
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    ViewStyle,
} from 'react-native'

interface IconButtonTextProps {
    text: string
    icon: string
    onPress: () => void
    style?: StyleProp<ViewStyle>
}

const IconButtonText: React.FC<IconButtonTextProps> = ({
    text,
    icon,
    onPress,
    style,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'column',
        },
        button: {
            padding: 0,
            margin: 0,
            alignSelf: 'center',
        },
        text: {
            padding: 0,
            margin: 0,
            alignSelf: 'center',
            alignContent: 'center',
            color: colors.textPrimary,
        },
    })

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <IconButton
                style={styles.button}
                color={colors.textPrimary}
                icon={icon}
                onPress={onPress}
            />
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    )
}

export default IconButtonText
