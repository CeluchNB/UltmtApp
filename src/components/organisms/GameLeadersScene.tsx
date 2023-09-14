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
import {
    Chart,
    HorizontalAxis,
    Line,
    VerticalAxis,
} from 'react-native-responsive-linechart'

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

    const chartData = React.useMemo(() => {
        return [{ x: 0, y: 0 }] // TODO: get from backend
    }, [])

    const chartHeight = React.useMemo(() => {
        return Math.max(100, ...chartData.map(value => value.y * 2))
    }, [chartData])

    console.log('chart data', chartData, chartHeight)
    const styles = StyleSheet.create({
        button: {
            alignSelf: 'flex-end',
            margin: 5,
        },
        error: {
            color: colors.gray,
            fontSize: size.fontTwenty,
        },
        listStyle: {
            // TODO: check this margin on many devices
            marginBottom: '60%',
        },
        teamLabel: {
            color: colors.gray,
            fontSize: size.fontFifteen,
            marginLeft: 10,
        },
        title: {
            color: colors.textSecondary,
            fontSize: size.fontThirty,
        },
        leaderTitle: {
            marginTop: 10,
        },
        chartStyle: {
            width: '90%',
            height: chartHeight,
            marginLeft: 5,
            backgroundColor: colors.darkPrimary,
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
                    style={styles.listStyle}
                    ListHeaderComponent={
                        <View>
                            <Text style={styles.title}>Game Momentum</Text>
                            <Text style={styles.teamLabel}>Team One</Text>
                            {/* @ts-ignore - chart is using react 17 which does not explicity declare children prop */}
                            <Chart
                                style={styles.chartStyle}
                                data={chartData}
                                yDomain={{ min: -100, max: 100 }}
                                xDomain={{ min: 0, max: 15 }}
                                disableTouch={true}
                                disableGestures={true}>
                                <VerticalAxis
                                    theme={{
                                        axis: {
                                            stroke: {
                                                color: colors.textSecondary,
                                            },
                                        },
                                    }}
                                />
                                <HorizontalAxis
                                    theme={{ axis: { dy: chartHeight / 2 } }}
                                />
                                <Line
                                    theme={{
                                        stroke: {
                                            color: colors.textPrimary,
                                            width: 4,
                                        },
                                    }}
                                    smoothing="bezier"
                                />
                            </Chart>
                            <Text style={styles.teamLabel}>Team Two</Text>
                            <Text style={[styles.title, styles.leaderTitle]}>
                                Leaders
                            </Text>
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
