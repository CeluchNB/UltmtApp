import React from 'react'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface TeamScoreProps {
    name: string
    teamname?: string
    score: number
}

const TeamScore: React.FC<TeamScoreProps> = ({ name, teamname, score }) => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        primaryText: {
            color: colors.textPrimary,
            fontSize: size.fontMedium,
            textAlign: 'center',
            fontWeight: weight.full,
        },
        secondaryText: {
            color: colors.textPrimary,
            fontSize: size.fontFifteen,
            textAlign: 'center',
        },
    })
    return (
        <View>
            <Text style={styles.primaryText}>{name}</Text>
            <Text style={styles.secondaryText}>
                {teamname ? `@${teamname}` : 'guest team'}
            </Text>
            <Text style={styles.primaryText}>{score}</Text>
        </View>
    )
}

export default TeamScore
