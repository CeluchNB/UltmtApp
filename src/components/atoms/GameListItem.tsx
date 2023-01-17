import * as React from 'react'
import BaseListItem from './BaseListItem'
import { Game } from '../../types/game'
import { useColors } from '../../hooks'
import { StyleSheet, Text } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface GameListItemProps {
    game: Game
    teamId?: string
    onPress?: () => void
}

const GameListItem: React.FC<GameListItemProps> = ({
    game,
    teamId,
    onPress,
}) => {
    const { colors } = useColors()

    const opponent = React.useMemo(() => {
        if (game.teamOne._id === teamId) {
            return game.teamTwo
        } else {
            return game.teamOne
        }
    }, [game, teamId])

    const scores = React.useMemo(() => {
        if (game.teamOne._id === teamId) {
            return { mine: game.teamOneScore, opponent: game.teamTwoScore }
        } else {
            return { mine: game.teamTwoScore, opponent: game.teamOneScore }
        }
    }, [game, teamId])

    const handlePress = React.useMemo(() => {
        if (onPress) {
            return async () => {
                onPress()
            }
        }
        return undefined
    }, [onPress])

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
        <BaseListItem onPress={handlePress}>
            <Text style={styles.teamName}>{`vs.${
                opponent.place ? ` ${opponent.place}` : ''
            } ${opponent.name}`}</Text>
            <Text
                style={
                    styles.score
                }>{`${scores.mine} - ${scores.opponent}`}</Text>
        </BaseListItem>
    )
}

export default GameListItem
