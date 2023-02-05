import React from 'react'
import { useTheme } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'

interface TeamScoreProps {
    name: string
    teamname?: string
    score: number
}

const TeamScore: React.FC<TeamScoreProps> = ({ name, teamname, score }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        primaryText: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
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
                {teamname ? `@${teamname}` : ''}
            </Text>
            <Text style={styles.primaryText}>{score}</Text>
        </View>
    )
}

export default TeamScore
