import * as React from 'react'
import BaseListItem from './BaseListItem'
import { Game } from '../../types/game'
import { useTheme } from '../../hooks'
import { StyleSheet, Text } from 'react-native'

interface GameListItemProps {
    game: Game
    teamId?: string
    showDelete?: boolean
    onPress?: () => void
    onDelete?: () => void
}

const GameListItem: React.FC<GameListItemProps> = ({
    game,
    teamId,
    showDelete,
    onPress,
    onDelete,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

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

    const handleDelete = async () => {
        if (onDelete) onDelete()
    }

    const styles = StyleSheet.create({
        teamName: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        score: {
            color: colors.textPrimary,
            fontSize: size.fontTen,
            fontWeight: weight.bold,
        },
    })

    if (teamId) {
        return (
            <BaseListItem
                onPress={handlePress}
                onDelete={handleDelete}
                showDelete={showDelete}>
                <Text style={styles.teamName}>{`vs.${
                    opponent.place ? ` ${opponent.place}` : ''
                } ${opponent.name}`}</Text>
                <Text
                    style={
                        styles.score
                    }>{`${scores.mine} - ${scores.opponent}`}</Text>
            </BaseListItem>
        )
    } else {
        return (
            <BaseListItem
                onPress={handlePress}
                onDelete={handleDelete}
                showDelete={showDelete}>
                <Text style={styles.teamName}>
                    {game.teamOne.name} vs. {game.teamTwo.name}
                </Text>
                <Text
                    style={
                        styles.score
                    }>{`${game.teamOneScore} - ${game.teamTwoScore}`}</Text>
            </BaseListItem>
        )
    }
}

export default GameListItem
