import { IconButton } from 'react-native-paper'
import React from 'react'
import { useColors } from '../../hooks'
import { StyleSheet, View } from 'react-native'

interface GameUtilityBarProps {
    onReactivateGame?: () => void
}

const GameUtilityBar: React.FC<GameUtilityBarProps> = ({
    onReactivateGame,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-end',
        },
    })

    return (
        <View style={styles.container}>
            {onReactivateGame && (
                <IconButton
                    size={20}
                    iconColor={colors.textPrimary}
                    icon="arrow-u-left-top"
                    onPress={onReactivateGame}
                />
            )}
        </View>
    )
}

export default GameUtilityBar
