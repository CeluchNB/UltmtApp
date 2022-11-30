import { Button } from 'react-native-paper'
import { GuestUser } from '../../types/user'
import PlayerActionTagModal from '../molecules/PlayerActionTagModal'
import React from 'react'
import SubstitutionModal from '../molecules/SubstitutionModal'
import { mapActionToDisplayName } from '../../utils/actions'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { ActionType, ClientActionType } from '../../types/action'
import { FlatList, StyleSheet, View } from 'react-native'

interface TeamActionViewProps {
    actions: ClientActionType[]
    onAction: (
        action: ClientActionType,
        tags: string[],
        playerOne?: GuestUser,
        playerTwo?: GuestUser,
    ) => void
}

const TeamActionView: React.FC<TeamActionViewProps> = ({
    actions,
    onAction,
}) => {
    const { colors } = useColors()
    const [subModalVisible, setSubModalVisible] = React.useState(false)
    const [tagModalVisible, setTagModalVisible] = React.useState(false)
    const [selectedAction, setSelectedAction] = React.useState<
        ClientActionType | undefined
    >(undefined)

    const handleAction = (action: ClientActionType) => {
        if (action === ActionType.SUBSTITUTION) {
            setSubModalVisible(true)
        } else {
            onAction(action, [])
        }
    }

    const handleLongPress = (action: ClientActionType) => {
        if (action === ActionType.SUBSTITUTION) {
            setSubModalVisible(true)
        } else {
            setSelectedAction(action)
            setTagModalVisible(true)
        }
    }

    const onSubModalClose = () => {
        setSubModalVisible(false)
    }

    const handleSubstitution = (playerOne: GuestUser, playerTwo: GuestUser) => {
        onSubModalClose()
        onAction(ActionType.SUBSTITUTION, [], playerOne, playerTwo)
    }

    const onTagModalClose = (submit: boolean, tags: string[]) => {
        if (submit && selectedAction) {
            onAction(selectedAction, tags)
        }
        setTagModalVisible(false)
        setSelectedAction(undefined)
    }

    const styles = StyleSheet.create({
        container: {
            marginTop: 10,
            marginBottom: 10,
        },
        button: {
            borderColor: colors.textPrimary,
            color: colors.textPrimary,
            backgroundColor: colors.primary,
            flex: 1,
            marginRight: 5,
            marginTop: 5,
        },
        buttonText: {
            fontSize: size.fontFifteen,
        },
    })

    if (actions.length < 3) {
        return null
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={actions}
                numColumns={2}
                renderItem={({ item }) => {
                    return (
                        <Button
                            key={item}
                            compact={true}
                            style={styles.button}
                            labelStyle={styles.buttonText}
                            color={colors.textPrimary}
                            collapsable={true}
                            mode="outlined"
                            onPress={() => {
                                handleAction(item)
                            }}
                            onLongPress={() => {
                                handleLongPress(item)
                            }}>
                            {mapActionToDisplayName(item)}
                        </Button>
                    )
                }}
            />
            <SubstitutionModal
                visible={subModalVisible}
                onClose={onSubModalClose}
                onSubmit={handleSubstitution}
            />
            <PlayerActionTagModal
                visible={tagModalVisible}
                onClose={onTagModalClose}
            />
        </View>
    )
}

export default TeamActionView
