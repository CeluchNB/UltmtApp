import { IconButton } from 'react-native-paper'
import React from 'react'
import { useColors } from '../../hooks'
import { StyleSheet, View } from 'react-native'

interface GameUtilityBarProps {
    onReactivateGame?: () => void
    onDeleteGame?: () => void
}

const GameUtilityBar: React.FC<GameUtilityBarProps> = ({
    onReactivateGame,
    onDeleteGame,
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
                    testID="reactivate-button"
                />
            )}
            {onDeleteGame && (
                <IconButton
                    size={20}
                    iconColor={colors.error}
                    icon="trash-can-outline"
                    onPress={onDeleteGame}
                    testID="delete-button"
                />
            )}
        </View>
    )
}

export default GameUtilityBar
