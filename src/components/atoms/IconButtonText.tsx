import * as React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useTheme } from '../../hooks'
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
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'column',
        },
        icon: {
            alignSelf: 'center',
            padding: 0,
            margin: 0,
        },
        text: {
            padding: 0,
            margin: 0,
            color: colors.textPrimary,
        },
    })

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
            <Icon
                style={styles.icon}
                name={icon}
                color={colors.textPrimary}
                size={25}
                testID="icon-button"
            />
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    )
}

export default IconButtonText
