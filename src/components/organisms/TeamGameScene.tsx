import { Game } from '../../types/game'
import GameListItem from '../atoms/GameListItem'
import React from 'react'
import { UseQueryResult } from 'react-query'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../hooks'
import { FlatList, RefreshControl } from 'react-native'

interface TeamGamesSceneProps {
    teamId: string
    queryResult: UseQueryResult<Game[]>
}

const TeamGamesScene: React.FC<TeamGamesSceneProps> = ({
    teamId,
    queryResult,
}) => {
    const {
        theme: { colors },
    } = useTheme()
    const navigation = useNavigation()

    const { data, isLoading, isRefetching, refetch } = queryResult

    return (
        <FlatList
            refreshControl={
                <RefreshControl
                    refreshing={isLoading || isRefetching}
                    onRefresh={refetch}
                    colors={[colors.textSecondary]}
                    tintColor={colors.textSecondary}
                />
            }
            data={data}
            renderItem={({ item }) => {
                return (
                    <GameListItem
                        game={item}
                        teamId={teamId}
                        onPress={() => {
                            navigation.navigate('ViewGame', {
                                gameId: item._id,
                            })
                        }}
                    />
                )
            }}
            testID="team-game-scene-list"
        />
    )
}

export default TeamGamesScene
