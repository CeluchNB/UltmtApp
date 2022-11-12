import React from 'react'
import TeamScore from '../atoms/TeamScore'
import { useColors } from '../../hooks'
import { DisplayTeam, GuestTeam } from '../../types/team'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

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
    const { colors } = useColors()

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
            {(game.teamOneActive || game.teamTwoActive) && (
                <Text style={styles.descriptionText}>
                    Game to {game.scoreLimit}
                </Text>
            )}
            <TeamScore
                name={game.teamTwo.name}
                teamname={game.teamTwo.teamname}
                score={game.teamTwoScore}
            />
        </View>
    )
}

export default GameHeader
