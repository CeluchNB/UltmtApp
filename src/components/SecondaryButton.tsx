import * as React from 'react'
import { Button } from 'react-native-paper'
import { StyleSheet } from 'react-native'
import { useColors } from '../hooks/useColors'

interface SecondaryButtonProps {
    text: string
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({ text }) => {
    const { colors } = useColors()

    const style = StyleSheet.create({
        button: {
            alignSelf: 'center',
            marginTop: 10,
        },
    })

    return (
        <Button
            style={style.button}
            mode="text"
            color={colors.textPrimary}
            onPress={() => {}}>
            {text}
        </Button>
    )
}

export default SecondaryButton
