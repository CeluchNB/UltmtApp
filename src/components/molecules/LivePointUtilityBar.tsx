import React from 'react'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button, IconButton } from 'react-native-paper'

interface LivePointUtilityBarProps {
    undoDisabled: boolean
    loading: boolean
    error?: string
    onUndo: () => void
    onEdit: () => void
    actionButton?: {
        title: string
        loading: boolean
        rightIcon?: string
        onAction: () => void
    }
}

const LivePointUtilityBar: React.FC<LivePointUtilityBarProps> = ({
    undoDisabled,
    loading,
    error,
    onUndo,
    onEdit,
    actionButton,
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
            {actionButton && (
                <Button
                    textColor={colors.textPrimary}
                    onPress={actionButton.onAction}
                    loading={actionButton.loading}
                    icon={actionButton.rightIcon}>
                    {actionButton.title}
                </Button>
            )}
        </View>
    )
}

export default LivePointUtilityBar
