import { ActionType } from '../../types/action'
import React from 'react'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

const ActionDisplayItem: React.FC<{}> = () => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
        },
        player: {},
    })

    const descriptionMap = (action: ActionType): string => {
        switch (action) {
            case ActionType.BLOCK:
                return 'block'
            case ActionType.CALL_ON_FIELD:
                return 'There is a call on the field'
            case ActionType.CATCH:
                return 'from'
            case ActionType.DROP:
                return 'drops pass from'
            case ActionType.PICKUP:
                return 'picks up the disc'
            case ActionType.PULL:
                return 'pulls'
            case ActionType.SUBSTITUTION:
                return 'subs in for'
            case ActionType.TEAM_ONE_SCORE:
                return 'scores from'
            case ActionType.TEAM_TWO_SCORE:
                return 'scores from'
            case ActionType.THROWAWAY:
                return 'throws it away'
            case ActionType.TIMEOUT:
                return 'timeout'
        }

        return ''
    }

    return (
        <View style={styles.container}>
            <View>
                <Text>Player One</Text>
            </View>
            <View>
                <Text>Action</Text>
            </View>
            <View>
                <Text>Player Two</Text>
            </View>
        </View>
    )
}

export default ActionDisplayItem
