import { IconButton } from 'react-native-paper'
import React from 'react'
import { useColors } from '../../hooks'
import { DisplayTeam, GuestTeam } from '../../types/team'
import { Pressable, StyleSheet, Text, View } from 'react-native'

interface GameCardProps {
    teamOne: DisplayTeam
    teamTwo: GuestTeam
    teamOneScore: number
    teamTwoScore: number
    scoreLimit: number
}

const GameCard: React.FC<GameCardProps> = props => {
    const { colors } = useColors()

    const { teamOne, teamTwo, teamOneScore, teamTwoScore, scoreLimit } = props

    const styles = StyleSheet.create({
        container: {
            backgroundColor: colors.primary,
            marginTop: 10,
            marginRight: 5,
            marginLeft: 5,
            color: colors.textPrimary,
            borderColor: colors.textPrimary,
            borderWidth: 1,
            borderRadius: 8,
            elevation: 10,
            shadowColor: colors.textPrimary,
        },
        teamContainer: {
            display: 'flex',
            flexDirection: 'row',
            paddingLeft: 5,
            paddingRight: 5,
            paddingTop: 5,
            color: colors.textPrimary,
        },
        teamNameContainer: {
            flex: 1,
        },
        teamNameText: {
            color: colors.textPrimary,
        },
        teamText: {
            color: colors.textSecondary,
            fontWeight: 'bold',
            fontSize: 20,
        },
        scoreLimit: {
            alignSelf: 'center',
            fontSize: 16,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        footer: {
            display: 'flex',
            flexDirection: 'row',
            alignSelf: 'flex-end',
        },
    })

    return (
        <View style={styles.container}>
            <Pressable android_ripple={{ color: colors.textPrimary }}>
                <View style={styles.teamContainer}>
                    <View style={styles.teamNameContainer}>
                        <Text style={styles.teamText}>{teamOne.name}</Text>
                        {teamOne.teamname && (
                            <Text style={styles.teamNameText}>
                                @{teamOne.teamname}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.teamText}>{teamOneScore}</Text>
                </View>
                <View style={styles.teamContainer}>
                    <View style={styles.teamNameContainer}>
                        <Text style={styles.teamText}>{teamTwo.name}</Text>
                        {teamTwo.teamname && <Text>@{teamTwo.teamname}</Text>}
                    </View>
                    <Text style={styles.teamText}>{teamTwoScore}</Text>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.scoreLimit}>Game to {scoreLimit}</Text>
                    <IconButton
                        color={colors.textPrimary}
                        icon="chevron-right"
                        testID="go-button"
                    />
                </View>
            </Pressable>
        </View>
    )
}

export default GameCard
