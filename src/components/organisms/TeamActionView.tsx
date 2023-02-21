import { Button } from 'react-native-paper'
import { DisplayUser } from '../../types/user'
import PlayerActionTagModal from '../molecules/PlayerActionTagModal'
import React from 'react'
import SubstitutionModal from '../molecules/SubstitutionModal'
import { mapActionToDisplayName } from '../../utils/action'
import { useTheme } from '../../hooks'
import { ActionType, ClientActionType } from '../../types/action'
import { FlatList, StyleSheet, View } from 'react-native'

interface TeamActionViewProps {
    actions: ClientActionType[]
    onAction: (
        action: ClientActionType,
        tags: string[],
        playerOne?: DisplayUser,
        playerTwo?: DisplayUser,
    ) => void
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

    const handleSubstitution = (
        playerOne: DisplayUser,
        playerTwo: DisplayUser,
    ) => {
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
                renderItem={({ item }) => {
                    return (
                        <View key={item} style={styles.buttonContainer}>
                            <Button
                                key={item}
                                compact={true}
                                style={styles.button}
                                labelStyle={styles.buttonText}
                                textColor={colors.textPrimary}
                                uppercase={true}
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
