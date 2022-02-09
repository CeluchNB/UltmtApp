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
}

const TeamListItem: React.FC<TeamListItemProps> = ({
    team,
    onPress,
    showDelete,
    showAccept,
    onDelete,
    onAccept,
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
        </View>
    )
}

export default TeamListItem
