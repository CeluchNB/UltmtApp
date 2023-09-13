import { ApiError } from '../../types/services'
import LeaderListItem from '../atoms/LeaderListItem'
import { LineChart } from 'react-native-charts-wrapper'
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
    processColor,
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
                    ListHeaderComponent={
                        <View style={{ width: '100%', height: 200 }}>
                            <LineChart
                                style={{ flex: 1 }}
                                dragEnabled={false}
                                chartBackgroundColor={processColor(
                                    colors.darkGray,
                                )}
                                drawGridBackground={false}
                                xAxis={{
                                    drawAxisLine: true,
                                    drawGridLines: false,
                                    position: 'BOTTOM',
                                }}
                                yAxis={{
                                    left: {
                                        drawAxisLine: false,
                                        drawGridLines: false,
                                    },
                                    right: {
                                        drawAxisLine: false,
                                        drawGridLines: false,
                                    },
                                }}
                                data={{
                                    dataSets: [
                                        {
                                            label: 'momentum',
                                            values: [
                                                { y: 1 },
                                                { y: 2 },
                                                { y: 1, marker: undefined },
                                            ],
                                            config: {
                                                color: processColor(
                                                    colors.textSecondary,
                                                ),
                                            },
                                        },
                                    ],
                                }}
                            />
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefetching}
                            colors={[colors.textSecondary]}
                            tintColor={colors.textSecondary}
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
