import * as React from 'react'
import { Button } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleProp, ViewStyle } from 'react-native'

interface SecondaryButtonProps {
    text: string
    onPress: () => {}
    style?: StyleProp<ViewStyle>
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    text,
    onPress,
    style,
}) => {
    const { colors } = useColors()

    return (
        <Button
            style={style}
            mode="text"
            color={colors.textPrimary}
            onPress={onPress}>
            {text}
        </Button>
    )
}

export default SecondaryButton
