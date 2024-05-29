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
        leftIcon?: string
        disabled: boolean
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
        actionsContainer: {
            flexDirection: 'row',
        },
        leftContainer: {
            alignContent: 'flex-start',
            flexDirection: 'row',
            flex: 1,
        },
        rightContainer: {
            alignContent: 'flex-end',
            alignSelf: 'center',
        },
        error: {
            color: colors.error,
            width: '75%',
        },
        actionButton: { alignSelf: 'center' },
        actionButtonContent: { flexDirection: 'row-reverse' },
    })

    return (
        <View>
            <View style={styles.actionsContainer}>
                <View style={styles.leftContainer}>
                    <IconButton
                        icon="pencil"
                        iconColor={colors.textPrimary}
                        onPress={onEdit}
                        testID="edit-button"
                    />
                    <IconButton
                        icon="undo"
                        iconColor={colors.textPrimary}
                        onPress={onUndo}
                        disabled={undoDisabled}
                        testID="undo-button"
                    />
                    {!error && loading && (
                        <ActivityIndicator
                            color={colors.textPrimary}
                            size="small"
                        />
                    )}
                </View>
                {actionButton && (
                    <View style={styles.rightContainer}>
                        <Button
                            textColor={colors.textPrimary}
                            onPress={actionButton.onAction}
                            loading={actionButton.loading}
                            style={styles.actionButton}
                            contentStyle={styles.actionButtonContent}
                            disabled={actionButton.disabled}
                            icon={actionButton.leftIcon}>
                            {actionButton.title}
                        </Button>
                    </View>
                )}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    )
}

export default LivePointUtilityBar
