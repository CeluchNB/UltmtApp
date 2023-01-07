import * as React from 'react'
import { Game } from '../../types/game'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface GameListItemProps {
    game: Game
    teamId?: string
}

const GameListItem: React.FC<GameListItemProps> = ({ game, teamId }) => {
    const { colors } = useColors()

    const opponent = React.useMemo(() => {
        if (game.teamTwo._id === teamId) {
            return game.teamOne
        } else {
            return game.teamTwo
        }
    }, [game, teamId])

    const scores = React.useMemo(() => {
        if (game.teamOne._id === teamId) {
            return { mine: game.teamOneScore, opponent: game.teamTwoScore }
        } else {
            return { mine: game.teamTwoScore, opponent: game.teamOneScore }
        }
    }, [game, teamId])

    const styles = StyleSheet.create({
        teamName: {
            color: colors.gray,
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
        },
        score: {
            color: colors.textPrimary,
            fontSize: size.fontSmall,
            fontWeight: weight.bold,
        },
    })

    return (
        <View>
            <Text style={styles.teamName}>{`vs.${
                opponent.place ? ` ${opponent.place}` : ''
            } ${opponent.name}`}</Text>
            <Text
                style={
                    styles.score
                }>{`${scores.mine} - ${scores.opponent}`}</Text>
        </View>
    )
}

export default GameListItem
