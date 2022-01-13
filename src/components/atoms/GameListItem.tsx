import * as React from 'react'
import { DisplayGame } from '../../types/game'
import { useColors } from '../../hooks'
import { StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../../theme/fonts'

interface GameListItemProps {
    game: DisplayGame
}

const GameListItem: React.FC<GameListItemProps> = ({ game }) => {
    const { colors } = useColors()

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
            <Text
                style={
                    styles.teamName
                }>{`vs. ${game.opponent.place} ${game.opponent.name}`}</Text>
            <Text
                style={
                    styles.score
                }>{`${game.teamScore} - ${game.opponentScore}`}</Text>
        </View>
    )
}

export default GameListItem
