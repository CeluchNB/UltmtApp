import * as React from 'react'
import { DisplayTeam } from '../../types/team'
import { useColors } from '../../hooks'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface TeamListItemProps {
    team: DisplayTeam
    onPress?: () => {}
}

const TeamListItem: React.FC<TeamListItemProps> = ({ team, onPress }) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
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
    })

    return (
        <View>
            <TouchableOpacity onPress={onPress}>
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
        </View>
    )
}

export default TeamListItem
