import { ActionType } from '../../types/action'
import { Button } from 'react-native-paper'
import React from 'react'
import { size } from '../../theme/fonts'
import { useColors } from '../../hooks'
import { StyleSheet, View } from 'react-native'

interface TeamActionViewProps {
    actions: (ActionType | 'score')[]
    onAction: (action: ActionType | 'score', tags: string[]) => void
}

const TeamActionView: React.FC<TeamActionViewProps> = ({
    actions,
    onAction,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            marginTop: 10,
            flexDirection: 'row',
        },
        button: {
            borderColor: colors.textPrimary,
            color: colors.textPrimary,
            backgroundColor: colors.primary,
            flex: 1,
            marginRight: 5,
        },
        buttonText: {
            fontSize: size.fontFifteen,
        },
    })

    if (actions.length < 3) {
        return null
    }

    return (
        <View>
            <View style={styles.container}>
                <Button
                    key={actions[0]}
                    compact={true}
                    style={styles.button}
                    labelStyle={styles.buttonText}
                    color={colors.textPrimary}
                    collapsable={true}
                    mode="outlined"
                    onPress={() => {
                        onAction(actions[0], [])
                    }}
                    // onLongPress={() => {
                    //     setSelectedAction(action)
                    //     setModalVisible(true)
                    // }}
                >
                    {actions[0]}
                </Button>
                <Button
                    key={actions[1]}
                    compact={true}
                    style={styles.button}
                    labelStyle={styles.buttonText}
                    color={colors.textPrimary}
                    collapsable={true}
                    mode="outlined"
                    onPress={() => {
                        onAction(actions[1], [])
                    }}
                    // onLongPress={() => {
                    //     setSelectedAction(action)
                    //     setModalVisible(true)
                    // }}
                >
                    {actions[1] === ActionType.CALL_ON_FIELD
                        ? 'call on field'
                        : actions[1]}
                </Button>
            </View>
            <View style={styles.container}>
                <Button
                    key={actions[2]}
                    compact={true}
                    style={styles.button}
                    labelStyle={styles.buttonText}
                    color={colors.textPrimary}
                    collapsable={true}
                    mode="outlined"
                    onPress={() => {
                        onAction(actions[1], [])
                    }}
                    // onLongPress={() => {
                    //     setSelectedAction(action)
                    //     setModalVisible(true)
                    // }}
                >
                    {actions[2]}
                </Button>
            </View>
        </View>
    )
}

export default TeamActionView
