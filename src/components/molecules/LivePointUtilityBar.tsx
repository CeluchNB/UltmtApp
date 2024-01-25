import { IconButton } from 'react-native-paper'
import React from 'react'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'

interface LivePointUtilityBarProps {
    undoDisabled: boolean
    loading: boolean
    error?: string
    onUndo: () => void
    onEdit: () => void
}

const LivePointUtilityBar: React.FC<LivePointUtilityBarProps> = ({
    undoDisabled,
    loading,
    error,
    onUndo,
    onEdit,
}) => {
    const {
        theme: { colors },
    } = useTheme()

    const styles = StyleSheet.create({
        headerContainer: {
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
        error: {
            color: colors.error,
            width: '75%',
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
            <IconButton
                icon="pencil"
                iconColor={colors.textPrimary}
                onPress={onEdit}
                testID="edit-button"
            />
        </View>
    )
}

export default LivePointUtilityBar
