import React from 'react'
import TeamScore from '../atoms/TeamScore'
import { useTheme } from '../../hooks'
import { DisplayTeam, GuestTeam } from '../../types/team'
import { StyleSheet, Text, View } from 'react-native'

interface GameHeaderProps {
    game: {
        teamOne: DisplayTeam
        teamTwo: GuestTeam
        teamOneScore: number
        teamTwoScore: number
        teamOneActive: boolean
        teamTwoActive: boolean
        scoreLimit: number
    }
}

const GameHeader: React.FC<GameHeaderProps> = ({ game }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        container: {
            flexDirection: 'row',
        },
        descriptionText: {
            flex: 1,
            color: colors.gray,
            textAlign: 'center',
            marginTop: 20,
            fontSize: size.fontFifteen,
            fontWeight: weight.full,
        },
    })

    return (
        <View style={styles.container}>
            <TeamScore
                name={game.teamOne.name}
                teamname={game.teamOne.teamname}
                score={game.teamOneScore}
            />
            <Text style={styles.descriptionText}>
                {game.teamOneActive || game.teamTwoActive
                    ? `Game to ${game.scoreLimit}`
                    : ''}
            </Text>
            <TeamScore
                name={game.teamTwo.name}
                teamname={game.teamTwo.teamname}
                score={game.teamTwoScore}
            />
        </View>
    )
}

export default GameHeader
