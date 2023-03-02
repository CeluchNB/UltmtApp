import { Action } from '../../types/action'
import { Button } from 'react-native-paper'
import { DisplayUser } from '../../types/user'
import PlayerActionTagModal from './PlayerActionTagModal'
import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface PlayerActionItemProps {
    player: DisplayUser
    actions: Action[]
    loading: boolean
    onAction: (action: Action) => Promise<void>
}

const PlayerActionItem: React.FC<PlayerActionItemProps> = ({
    player,
    actions,
    loading,
    onAction,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const [modalVisible, setModalVisible] = React.useState(false)
    const [selectedAction, setSelectedAction] = React.useState<
        Action | undefined
    >()

    const onModalClose = (submit: boolean, tags: string[]) => {
        if (submit && selectedAction) {
            selectedAction.setTags(tags)
            onAction(selectedAction)
        }
        setModalVisible(false)
        setSelectedAction(undefined)
    }

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
        },
        nameContainer: {
            width: '35%',
        },
        name: {
            fontSize: size.fontFifteen,
            color: colors.textPrimary,
        },
        username: {
            fontSize: size.fontTen,
            color: colors.textPrimary,
        },
        buttonContainer: {
            flex: 1,
        },
        button: {
            borderColor: colors.textPrimary,
            color: colors.textPrimary,
            backgroundColor: colors.primary,
            flex: 1,
            width: '100%',
            marginRight: 5,
        },
        buttonText: {
            fontSize: size.fontTen,
        },
    })

    return (
        <View style={styles.container}>
            <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={1}>
                    {player.firstName} {player.lastName}
                </Text>
                {player.username && (
                    <Text style={styles.username}>@{player.username}</Text>
                )}
            </View>
            {actions.map(action => (
                <View
                    style={styles.buttonContainer}
                    key={action.action.actionType}>
                    <Button
                        compact={true}
                        style={styles.button}
                        labelStyle={styles.buttonText}
                        textColor={colors.textPrimary}
                        uppercase={true}
                        collapsable={true}
                        disabled={loading}
                        mode="outlined"
                        onPress={async () => {
                            await onAction(action)
                        }}
                        onLongPress={() => {
                            setSelectedAction(action)
                            setModalVisible(true)
                        }}>
                        {action.reporterDisplay}
                    </Button>
                </View>
            ))}
            <PlayerActionTagModal
                visible={modalVisible}
                onClose={onModalClose}
            />
        </View>
    )
}

export default PlayerActionItem
