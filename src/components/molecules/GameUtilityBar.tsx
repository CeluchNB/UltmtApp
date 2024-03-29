import ConfirmModal from './ConfirmModal'
import { IconButton } from 'react-native-paper'
import { pluralize } from '../../utils/stats'
import { useTheme } from '../../hooks'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

interface GameUtilityBarProps {
    loading: boolean
    totalViews?: number
    onReactivateGame?: () => void
    onDeleteGame?: () => void
    onExportStats?: () => void
}

const GameUtilityBar: React.FC<GameUtilityBarProps> = ({
    loading,
    totalViews = 0,
    onReactivateGame,
    onDeleteGame,
    onExportStats,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const [exportModalVisible, setExportModalVisible] = useState(false)

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
        },
        viewContainer: {
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            alignSelf: 'center',
        },
        viewsText: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
        },
        utiltityActionsContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.viewContainer}>
                {totalViews > 0 && (
                    <Text style={styles.viewsText}>
                        {totalViews} {pluralize('view', totalViews)}
                    </Text>
                )}
            </View>
            <View style={styles.utiltityActionsContainer}>
                {loading && (
                    <ActivityIndicator
                        size="small"
                        color={colors.textPrimary}
                    />
                )}
                {onExportStats && (
                    <IconButton
                        size={20}
                        iconColor={colors.textPrimary}
                        icon="export"
                        onPress={() => {
                            setExportModalVisible(true)
                        }}
                        testID="export-button"
                    />
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
            <ConfirmModal
                displayText="This will send a spreadsheet to your email. Export stats?"
                loading={false}
                visible={exportModalVisible}
                confirmColor={colors.textPrimary}
                onClose={async () => {
                    setExportModalVisible(false)
                }}
                onCancel={async () => {
                    setExportModalVisible(false)
                }}
                onConfirm={async () => {
                    onExportStats?.()
                }}
            />
        </View>
    )
}

export default GameUtilityBar
