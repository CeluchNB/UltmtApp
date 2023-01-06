import { IconButton } from 'react-native-paper'
import React from 'react'
import { useColors } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

interface LivePointStatusProps {
    undoDisabled: boolean
    loading: boolean
    error?: string
    onUndo: () => void
}

const LivePointStatus: React.FC<LivePointStatusProps> = ({
    undoDisabled,
    loading,
    error,
    onUndo,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        headerContainer: {
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
        error: {
            color: colors.error,
            width: '80%',
        },
    })

    return (
        <View style={styles.headerContainer}>
            <Text style={styles.error}>{error}</Text>
            {!error && loading && (
                <ActivityIndicator color={colors.textPrimary} size="small" />
            )}
            <IconButton
                icon="undo"
                iconColor={colors.textPrimary}
                onPress={onUndo}
                disabled={undoDisabled}
                testID="undo-button"
            />
        </View>
    )
}

export default LivePointStatus
