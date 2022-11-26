import { Button } from 'react-native-paper'
import { GuestUser } from '../../types/user'
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

    const handleAction = (action: ClientActionType) => {
        if (action === ActionType.SUBSTITUTION) {
            setSubModalVisible(true)
        } else {
            onAction(action, [])
        }
    }

    const closeModal = () => {
        setSubModalVisible(false)
    }

    const handleSubstitution = (playerOne: GuestUser, playerTwo: GuestUser) => {
        closeModal()
        onAction(ActionType.SUBSTITUTION, [], playerOne, playerTwo)
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
                            // onLongPress={() => {
                            //     setSelectedAction(action)
                            //     setModalVisible(true)
                            // }}
                        >
                            {mapActionToDisplayName(item)}
                        </Button>
                    )
                }}
            />
            <SubstitutionModal
                visible={subModalVisible}
                onClose={closeModal}
                onSubmit={handleSubstitution}
            />
        </View>
    )
}

export default TeamActionView
