import { IconButton } from 'react-native-paper'
import React from 'react'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

interface GameUtilityBarProps {
    loading: boolean
    onReactivateGame?: () => void
    onDeleteGame?: () => void
}

const GameUtilityBar: React.FC<GameUtilityBarProps> = ({
    loading,
    onReactivateGame,
    onDeleteGame,
}) => {
    const {
        theme: { colors },
    } = useTheme()

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
            {loading && (
                <ActivityIndicator size="small" color={colors.textPrimary} />
            )}
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
