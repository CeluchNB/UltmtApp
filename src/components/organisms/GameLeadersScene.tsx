import { ApiError } from '../../types/services'
import LeaderListItem from '../atoms/LeaderListItem'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import { convertGameStatsToLeaderItems } from '../../utils/stats'
import { getGameStats } from '../../services/data/stats'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from 'react-native'

interface GameLeadersSceneProps {
    gameId: string
}
const GameLeadersScene: React.FC<GameLeadersSceneProps> = ({ gameId }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const navigation = useNavigation()

    const { data, isLoading, isRefetching, error, refetch } = useQuery(
        ['gameStats', { gameId }],
        () => getGameStats(gameId),
    )

    const leaderList = React.useMemo(() => {
        return convertGameStatsToLeaderItems(data)
    }, [data])

    const styles = StyleSheet.create({
        button: {
            width: '50%',
            alignSelf: 'flex-end',
            margin: 5,
        },
        error: {
            color: colors.gray,
            fontSize: size.fontTwenty,
        },
    })

    return (
        <View>
            <SecondaryButton
                style={styles.button}
                text="more stats"
                onPress={async () => {
                    navigation.navigate('Tabs', {
                        screen: 'Games',
                        params: { screen: 'GameStats', params: { gameId } },
                    })
                }}
            />
            {isLoading && (
                <ActivityIndicator size="large" color={colors.textPrimary} />
            )}
            {error ? (
                <Text style={styles.error}>{(error as ApiError).message}</Text>
            ) : null}
            {!isLoading && (
                <FlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            onRefresh={() => {
                                refetch()
                            }}
                        />
                    }
                    data={leaderList}
                    renderItem={({ item }) => {
                        return <LeaderListItem leader={item} />
                    }}
                    testID="leaderboard-list"
                />
            )}
        </View>
    )
}

export default GameLeadersScene
