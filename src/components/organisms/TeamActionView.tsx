import { Button } from 'react-native-paper'
import { DisplayUser } from '../../types/user'
import PlayerActionTagModal from '../molecules/PlayerActionTagModal'
import React from 'react'
import SubstitutionModal from '../molecules/SubstitutionModal'
import { useTheme } from '../../hooks'
import { Action, ActionType } from '../../types/action'
import { FlatList, StyleSheet, View } from 'react-native'

interface TeamActionViewProps {
    actions: Action[]
    onAction: (action: Action) => Promise<void>
}

const TeamActionView: React.FC<TeamActionViewProps> = ({
    actions,
    onAction,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const [subModalVisible, setSubModalVisible] = React.useState(false)
    const [tagModalVisible, setTagModalVisible] = React.useState(false)
    const [selectedAction, setSelectedAction] = React.useState<
        Action | undefined
    >(undefined)

    const handleAction = (action: Action) => {
        if (action.action.actionType === ActionType.SUBSTITUTION) {
            setSelectedAction(action)
            setSubModalVisible(true)
        } else {
            onAction(action)
        }
    }

    const handleLongPress = (action: Action) => {
        if (action.action.actionType === ActionType.SUBSTITUTION) {
            setSubModalVisible(true)
        } else {
            setTagModalVisible(true)
        }
        setSelectedAction(action)
    }

    const onSubModalClose = () => {
        setSubModalVisible(false)
    }

    const handleSubstitution = (
        playerOne: DisplayUser,
        playerTwo: DisplayUser,
    ) => {
        onSubModalClose()
        if (selectedAction) {
            selectedAction.setPlayers(playerOne, playerTwo)
            onAction(selectedAction)
        }
    }

    const onTagModalClose = (submit: boolean, tags: string[]) => {
        if (submit && selectedAction) {
            selectedAction.setTags(tags)
            onAction(selectedAction)
        }
        setTagModalVisible(false)
        setSelectedAction(undefined)
    }

    const styles = StyleSheet.create({
        container: {
            marginTop: 10,
            marginBottom: 10,
        },
        buttonContainer: {
            flex: 1,
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

    return (
        <View style={styles.container}>
            <FlatList
                listKey="team-action-list"
                data={actions}
                numColumns={2}
                renderItem={({ item: action }) => {
                    return (
                        <View
                            key={action.action.actionType}
                            style={styles.buttonContainer}>
                            <Button
                                compact={true}
                                style={styles.button}
                                labelStyle={styles.buttonText}
                                textColor={colors.textPrimary}
                                uppercase={true}
                                collapsable={true}
                                mode="outlined"
                                onPress={() => {
                                    handleAction(action)
                                }}
                                onLongPress={() => {
                                    handleLongPress(action)
                                }}>
                                {action.reporterDisplay}
                            </Button>
                        </View>
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
