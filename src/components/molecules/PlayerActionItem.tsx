import { ActionType } from '../../types/action'
import { Button } from 'react-native-paper'
import { GuestUser } from '../../types/user'
import PlayerActionTagModal from './PlayerActionTagModal'
import React from 'react'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface PlayerActionItemProps {
    player: GuestUser
    actions: ('score' | ActionType)[]
    onAction: (action: ActionType | 'score', tags: string[]) => void
}

const PlayerActionItem: React.FC<PlayerActionItemProps> = ({
    player,
    actions,
    onAction,
}) => {
    const { colors } = useColors()
    const [modalVisible, setModalVisible] = React.useState(false)
    const [selectedAction, setSelectedAction] = React.useState<
        ActionType | 'score' | undefined
    >()

    const onModalClose = (tags: string[]) => {
        if (selectedAction) {
            onAction(selectedAction, tags)
        }
        setModalVisible(false)
        setSelectedAction(undefined)
    }

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
            textAlignVertical: true,
        },
        nameContainer: {
            width: '35%',
        },
        name: {
            fontSize: size.fontFifteen,
            color: colors.textPrimary,
        },
        username: {
            fontSize: size.fontSmall,
            color: colors.textPrimary,
        },
        buttonContainer: {
            width: '65%',
        },
        button: {
            borderColor: colors.textPrimary,
            color: colors.textPrimary,
            backgroundColor: colors.primary,
            flex: 1,
            marginRight: 5,
        },
        buttonText: {
            fontSize: size.fontSmall,
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
                <Button
                    key={action}
                    compact={true}
                    style={styles.button}
                    labelStyle={styles.buttonText}
                    color={colors.textPrimary}
                    collapsable={true}
                    mode="outlined"
                    onPress={() => {
                        onAction(action, [])
                    }}
                    onLongPress={() => {
                        setSelectedAction(action)
                        setModalVisible(true)
                    }}>
                    {action}
                </Button>
            ))}
            <PlayerActionTagModal
                visible={modalVisible}
                onClose={onModalClose}
            />
        </View>
    )
}

export default PlayerActionItem