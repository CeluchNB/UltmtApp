import { GuestTeam } from '../../types/team'
import React from 'react'
import { useTheme } from '../../hooks'
import {
    Action,
    LiveServerActionData,
    SavedServerActionData,
    ServerActionData,
} from '../../types/action'
import { Chip, IconButton } from 'react-native-paper'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface ActionDisplayItemProps {
    action: Action
    teamOne: GuestTeam
    teamTwo: GuestTeam
    onPress?: (action: ServerActionData) => void
}

const ActionDisplayItem: React.FC<ActionDisplayItemProps> = ({
    action,
    teamOne,
    teamTwo,
    onPress,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const { action: actionData, viewerDisplay } = action
    const { tags, comments } = actionData

    const getTeamName = (): string => {
        if ((actionData as any).teamNumber) {
            return (actionData as LiveServerActionData).teamNumber === 'one'
                ? teamOne.name
                : teamTwo.name
        } else if ((actionData as any).team) {
            return (actionData as SavedServerActionData).team.name
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
        team: {
            color: colors.textSecondary,
            fontWeight: weight.full,
            fontSize: size.fontFifteen,
        },
        action: {
            color: colors.textPrimary,
            fontWeight: weight.bold,
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
            disabled={!onPress}
            android_ripple={{ color: colors.textPrimary }}
            onPress={() => {
                if (onPress) {
                    onPress(actionData)
                }
            }}>
            <Text style={styles.team}>{getTeamName()}</Text>
            <View style={styles.dataContainer}>
                <View style={styles.textContainer}>
                    <View style={styles.lineContainer}>
                        <View>
                            <Text style={styles.action}>{viewerDisplay}</Text>
                        </View>
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
                            iconColor={colors.textPrimary}
                        />
                        {comments.length > 0 && (
                            <Text style={styles.commentCount}>
                                ({comments.length})
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default ActionDisplayItem
