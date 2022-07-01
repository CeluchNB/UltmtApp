import * as React from 'react'
import { Button } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleProp, ViewStyle } from 'react-native'

interface SecondaryButtonProps {
    text: string
    onPress: () => {}
    style?: StyleProp<ViewStyle>
    loading?: boolean
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    text,
    onPress,
    style,
    loading = false,
}) => {
    const { colors } = useColors()

    return (
        <Button
            style={[{ borderColor: colors.textPrimary }, style]}
            mode="outlined"
            color={colors.textPrimary}
            onPress={onPress}
            loading={loading}>
            {text}
        </Button>
    )
}

export default SecondaryButton
