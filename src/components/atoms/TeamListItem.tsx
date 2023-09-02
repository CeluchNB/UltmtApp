import * as React from 'react'
import BaseListItem from './BaseListItem'
import { DisplayTeam } from '../../types/team'
import { useTheme } from '../../hooks'
import { StyleSheet, Text } from 'react-native'

interface TeamListItemProps {
    team: DisplayTeam
    managing?: boolean
    showDelete?: boolean
    showAccept?: boolean
    requestStatus?: string
    error?: string
    onPress?: () => {}
    onDelete?: () => {}
    onAccept?: () => {}
}

const TeamListItem: React.FC<TeamListItemProps> = props => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const { team, managing } = props

    const styles = StyleSheet.create({
        name: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        teamname: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
            fontWeight: weight.bold,
        },
        season: {
            color: colors.textPrimary,
            fontSize: size.fontTen,
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
            {managing && <Text style={styles.season}>Managing</Text>}
        </BaseListItem>
    )
}

export default TeamListItem
