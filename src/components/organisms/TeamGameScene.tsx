import GameListItem from '../atoms/GameListItem'
import React from 'react'
import { getGamesByTeam } from '../../services/data/game'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import { FlatList, RefreshControl } from 'react-native'

interface TeamGamesSceneProps {
    teamId: string
}

const TeamGamesScene: React.FC<TeamGamesSceneProps> = ({ teamId }) => {
    const {
        theme: { colors },
    } = useTheme()
    const navigation = useNavigation()

    const { data, isLoading, isRefetching, refetch } = useQuery(
        ['getGamesByTeam', { teamId }],
        () => getGamesByTeam(teamId),
    )
    return (
        <FlatList
            refreshControl={
                <RefreshControl
                    refreshing={isLoading || isRefetching}
                    onRefresh={refetch}
                    colors={[colors.textSecondary]}
                />
            }
            data={data}
            renderItem={({ item }) => {
                return (
                    <GameListItem
                        game={item}
                        teamId={teamId}
                        onPress={() => {
                            navigation.navigate('Tabs', {
                                screen: 'Games',
                                params: {
                                    screen: 'ViewGame',
                                    params: {
                                        gameId: item._id,
                                    },
                                },
                            })
                        }}
                    />
                )
            }}
        />
    )
}

export default TeamGamesScene
