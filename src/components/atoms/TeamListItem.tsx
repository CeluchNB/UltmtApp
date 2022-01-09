import * as React from 'react'
import { DisplayTeam } from '../../types/team'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface TeamListItemProps {
    team: DisplayTeam
}

const TeamListItem: React.FC<TeamListItemProps> = ({ team }) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        teamName: {
            color: colors.gray,
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
        <View>
            <Text style={styles.teamName}>{`${team.place} ${team.name}`}</Text>
            <Text style={styles.season}>{team.season}</Text>
        </View>
    )
}

export default TeamListItem
