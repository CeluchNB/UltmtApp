import BaseListItem from '../atoms/BaseListItem'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Team } from '../../types/team'
import { getTeamsByContinutationId } from '../../services/data/team'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { FlatList, StyleSheet, Text } from 'react-native'
import React, { useMemo } from 'react'

const getDisplayYear = (team: Team): string => {
    const startYear = new Date(team.seasonStart).getUTCFullYear()
    const endYear = new Date(team.seasonEnd).getUTCFullYear()

    if (startYear !== endYear) {
        return `${startYear} - ${endYear}`
    }
    return startYear.toString()
}

export const PublicTeamAllYearsScene: React.FC<{ continuationId?: string }> = ({
    continuationId,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>()
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const { data } = useQuery(
        ['all', 'teams', continuationId],
        () => getTeamsByContinutationId(continuationId ?? ''),
        { enabled: !!continuationId },
    )

    const teams = useMemo(() => {
        if (!data) return []

        return data.sort((a, b) => {
            return a.seasonNumber - b.seasonNumber
        })
    }, [data])

    const isArchiveTeam = (team: Team): boolean => {
        return team.seasonNumber !== teams[teams.length - 1].seasonNumber
    }

    const styles = StyleSheet.create({
        containerStyle: {
            marginLeft: 20,
        },
        yearTextStyle: {
            color: colors.textPrimary,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
        },
    })

    return (
        <FlatList
            data={teams}
            contentContainerStyle={styles.containerStyle}
            renderItem={({ item }) => {
                const year = getDisplayYear(item)
                return (
                    <BaseListItem
                        key={year}
                        onPress={async () => {
                            navigation.push('PublicTeamDetails', {
                                id: item._id,
                                archive: isArchiveTeam(item),
                            })
                        }}>
                        <Text style={styles.yearTextStyle}>{year}</Text>
                    </BaseListItem>
                )
            }}
        />
    )
}
