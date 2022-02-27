import * as React from 'react'
import { DisplayTeam } from '../../types/team'
import { IconButton } from 'react-native-paper'
import { useColors } from '../../hooks'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface TeamListItemProps {
    team: DisplayTeam
    onPress?: () => {}
    showDelete?: boolean
    showAccept?: boolean
    onDelete?: () => {}
    onAccept?: () => {}
    requestStatus?: string
}

const TeamListItem: React.FC<TeamListItemProps> = ({
    team,
    onPress,
    showDelete,
    showAccept,
    onDelete,
    onAccept,
    requestStatus,
}) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        container: {
            display: 'flex',
            flexDirection: 'row',
        },
        touchableContainer: {
            flex: 1,
        },
        name: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
        },
        teamname: {
            color: colors.textPrimary,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
            marginBottom: 10,
        },
        season: {
            color: colors.textPrimary,
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
        },
        buttonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        acceptedText: {
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
            color: colors.success,
        },
        deniedText: {
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
            color: colors.error,
        },
        pendingText: {
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
            color: colors.gray,
        },
    })

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.touchableContainer}
                onPress={onPress}>
                <Text style={styles.name}>{`${team.place} ${team.name}`}</Text>
                <Text style={styles.teamname}>@{team.teamname}</Text>
                <Text style={styles.season}>
                    {team.seasonStart === team.seasonEnd
                        ? new Date(team.seasonStart).getUTCFullYear()
                        : `${new Date(
                              team.seasonStart,
                          ).getUTCFullYear()} - ${new Date(
                              team.seasonEnd,
                          ).getUTCFullYear()}`}
                </Text>
                {requestStatus === 'approved' && (
                    <Text style={styles.acceptedText}>Accepted</Text>
                )}
                {requestStatus === 'denied' && (
                    <Text style={styles.deniedText}>Denied</Text>
                )}
                {requestStatus === 'pending' && (
                    <Text style={styles.pendingText}>Pending</Text>
                )}
            </TouchableOpacity>
            {showAccept && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.success}
                    icon="plus"
                    onPress={onAccept}
                />
            )}
            {showDelete && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.error}
                    icon="close"
                    onPress={onDelete}
                />
            )}
            {onPress && (
                <IconButton
                    style={styles.buttonStyle}
                    color={colors.textPrimary}
                    icon="chevron-right"
                    onPress={onPress}
                />
            )}
        </View>
    )
}

export default TeamListItem
