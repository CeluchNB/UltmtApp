import BaseListItem from './BaseListItem'
import React from 'react'
import { Tournament } from '../../types/tournament'
import { useTheme } from '../../hooks'
import { StyleSheet, Text } from 'react-native'

interface TournamentListItemProps {
    tournament: Tournament
    onPress: () => {}
}

const TournamentListItem: React.FC<TournamentListItemProps> = ({
    tournament,
    onPress,
}) => {
    const { name, eventId } = tournament
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const styles = StyleSheet.create({
        tournamentName: {
            color: colors.gray,
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
        },
        tournamentId: {
            fontSize: size.fontFifteen,
            fontWeight: weight.normal,
            color: colors.textPrimary,
        },
    })
    return (
        <BaseListItem onPress={onPress}>
            <Text style={styles.tournamentName}>{name}</Text>
            <Text style={styles.tournamentId}>@{eventId}</Text>
        </BaseListItem>
    )
}

export default TournamentListItem
