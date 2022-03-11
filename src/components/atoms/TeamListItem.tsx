import * as React from 'react'
import BaseListItem from './BaseListItem'
import { DisplayTeam } from '../../types/team'
import { useColors } from '../../hooks'
import { StyleSheet, Text } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface TeamListItemProps {
    team: DisplayTeam
    onPress?: () => {}
    showDelete?: boolean
    showAccept?: boolean
    onDelete?: () => {}
    onAccept?: () => {}
    requestStatus?: string
    error?: string
}

const TeamListItem: React.FC<TeamListItemProps> = props => {
    const { colors } = useColors()
    const { team } = props

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
        },
        season: {
            color: colors.textPrimary,
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
        },
    })

    return (
        <BaseListItem {...props}>
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
        </BaseListItem>
    )
}

export default TeamListItem
