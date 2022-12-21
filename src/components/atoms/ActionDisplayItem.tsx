import { GuestTeam } from '../../types/team'
import { GuestUser } from '../../types/user'
import React from 'react'
import { ServerAction } from '../../types/action'
import { mapActionToDescription } from '../../utils/action'
import { useColors } from '../../hooks'
import { Chip, IconButton } from 'react-native-paper'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface ActionDisplayItemProps {
    action: ServerAction
    teamOne: GuestTeam
    teamTwo: GuestTeam
    onPress?: (action: ServerAction) => void
}

const ActionDisplayItem: React.FC<ActionDisplayItemProps> = ({
    action,
    teamOne,
    teamTwo,
    onPress,
}) => {
    const { colors } = useColors()
    const { actionType, playerOne, playerTwo, tags } = action

    const getName = (player?: GuestUser): string => {
        return `${player?.firstName} ${player?.lastName}`
    }

    const getTeamName = (): string => {
        if ((action as any).teamNumber) {
            return (action as any).teamNumber === 'one'
                ? teamOne.name
                : teamTwo.name
        } else if ((action as any).team) {
            return (action as any).team.name
        }
        return teamOne.name
    }

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.darkPrimary,
            shadowColor: colors.darkGray,
            shadowRadius: 8,
            borderRadius: 8,
            width: '100%',
            padding: 10,
        },
        dataContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        textContainer: {
            flex: 1,
        },
        lineContainer: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
        },
        player: {
            color: colors.textPrimary,
            fontWeight: weight.bold,
            fontSize: size.fontFifteen,
        },
        action: {
            color: colors.textPrimary,
            fontWeight: weight.full,
            fontSize: size.fontFifteen,
        },
        chipContainer: {
            flex: 1,
            flexDirection: 'row',
        },
        chip: {
            borderRadius: 4,
            margin: 2,
            backgroundColor: colors.primary,
            borderWidth: 1,
        },
        commentCount: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
        },
    })

    return (
        <Pressable
            style={styles.container}
            android_ripple={{ color: colors.textPrimary }}
            onPress={() => {
                if (onPress) {
                    onPress(action)
                }
            }}>
            <Text style={styles.action}>{getTeamName()}</Text>
            <View style={styles.dataContainer}>
                <View style={styles.textContainer}>
                    <View style={styles.lineContainer}>
                        {playerOne && (
                            <View>
                                <Text style={styles.player}>
                                    {getName(playerOne)}
                                </Text>
                            </View>
                        )}
                        <View>
                            <Text style={styles.action}>
                                {mapActionToDescription(actionType)}
                            </Text>
                        </View>
                        {playerTwo && (
                            <View>
                                <Text style={styles.player}>
                                    {getName(playerTwo)}
                                </Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.lineContainer}>
                        {tags.map(tag => (
                            <Chip
                                key={tag}
                                style={styles.chip}
                                mode="outlined"
                                selectedColor={colors.textPrimary}
                                ellipsizeMode="tail">
                                {tag}
                            </Chip>
                        ))}
                        <IconButton
                            size={15}
                            icon="comment-text-outline"
                            color={colors.textPrimary}
                        />
                        {action.comments.length > 0 && (
                            <Text style={styles.commentCount}>
                                ({action.comments.length})
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default ActionDisplayItem
