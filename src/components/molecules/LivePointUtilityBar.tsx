import React from 'react'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button, IconButton } from 'react-native-paper'

interface LivePointUtilityBarProps {
    loading: boolean
    error?: string
    onEdit: () => void
    undoButton: {
        onPress: () => void
        disabled: boolean
        visible: boolean
    }
    lineBuilderButton: {
        onPress: () => void
        disabled: boolean
        visible: boolean
    }
    actionButton?: {
        title: string
        loading: boolean
        leftIcon?: string
        disabled: boolean
        onAction: () => void
    }
}

const LivePointUtilityBar: React.FC<LivePointUtilityBarProps> = ({
    loading,
    error,
    onEdit,
    undoButton,
    lineBuilderButton,
    actionButton,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const {
        onPress: onUndo,
        disabled: undoDisabled,
        visible: undoVisible,
    } = undoButton

    const {
        onPress: onLineBuilder,
        disabled: lineBuilderDisabled,
        visible: lineBuilderVisible,
    } = lineBuilderButton

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
                    {undoVisible && (
                        <IconButton
                            icon="undo"
                            iconColor={colors.textPrimary}
                            onPress={() => onUndo?.()}
                            disabled={undoDisabled}
                            testID="undo-button"
                            theme={{
                                colors: { onSurfaceDisabled: colors.gray },
                            }}
                        />
                    )}
                    {lineBuilderVisible && (
                        <IconButton
                            icon="account-supervisor-outline"
                            iconColor={colors.textPrimary}
                            onPress={() => onLineBuilder?.()}
                            disabled={lineBuilderDisabled}
                            testID="line-builder-button"
                            theme={{
                                colors: { onSurfaceDisabled: colors.gray },
                            }}
                        />
                    )}
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
                            onPress={() => {
                                try {
                                    actionButton.onAction()
                                } catch {}
                            }}
                            loading={actionButton.loading}
                            style={styles.actionButton}
                            contentStyle={styles.actionButtonContent}
                            labelStyle={{ fontSize: size.fontFifteen }}
                            theme={{
                                colors: { onSurfaceDisabled: colors.gray },
                            }}
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
