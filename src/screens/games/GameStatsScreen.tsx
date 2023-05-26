import BaseScreen from '../../components/atoms/BaseScreen'
import GameHeader from '../../components/molecules/GameHeader'
import { GameStatsProps } from '../../types/navigation'
import React from 'react'
import TeamGameStatsScene from '../../components/organisms/TeamGameStatsScene'
import { getGameById } from '../../services/data/game'
import { useQuery } from 'react-query'
import { useTheme } from '../../hooks'
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'

const renderScene = (gameId: string, teamOneId: string, teamTwoId?: string) => {
    return ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'teamOne':
                return <TeamGameStatsScene gameId={gameId} teamId={teamOneId} />
            case 'teamTwo':
                return <TeamGameStatsScene gameId={gameId} teamId={teamTwoId} />
            default:
                return null
        }
    }
}

const GameStatsScreen: React.FC<GameStatsProps> = ({ route }) => {
    const { gameId } = route.params
    const layout = useWindowDimensions()
    const {
        theme: { colors, size },
    } = useTheme()

    const {
        data: game,
        isLoading,
        error,
    } = useQuery(['gameById', { gameId }], () => getGameById(gameId))

    const mapTabNameToIndex = (name: 'teamOne' | 'teamTwo'): number => {
        switch (name) {
            case 'teamOne':
                return 0
            case 'teamTwo':
                return 1
        }
    }

    const [index, setIndex] = React.useState(mapTabNameToIndex('teamOne'))
    const routes = React.useMemo(() => {
        return [
            { key: 'teamOne', title: game?.teamOne.name },
            { key: 'teamTwo', title: game?.teamTwo?.name },
        ]
    }, [game])

    const styles = StyleSheet.create({
        tabContainer: {
            height: '100%',
        },
        error: {
            color: colors.gray,
            fontSize: size.fontTwenty,
        },
    })

    return (
        <BaseScreen containerWidth="90%">
            {isLoading && (
                <ActivityIndicator size="large" color={colors.textPrimary} />
            )}
            {error && (error as any).message && (
                <Text style={styles.error}>{(error as any).message}</Text>
            )}
            {game && (
                <View style={styles.tabContainer}>
                    <GameHeader game={game} />
                    <TabView
                        navigationState={{ index, routes }}
                        renderScene={renderScene(
                            gameId,
                            game.teamOne._id,
                            game.teamTwo._id,
                        )}
                        swipeEnabled={false}
                        onIndexChange={setIndex}
                        initialLayout={{ width: layout.width }}
                        renderTabBar={props => {
                            return (
                                <TabBar
                                    {...props}
                                    style={{ backgroundColor: colors.primary }}
                                    indicatorStyle={{
                                        backgroundColor: colors.textPrimary,
                                    }}
                                    activeColor={colors.textPrimary}
                                    inactiveColor={colors.darkGray}
                                />
                            )
                        }}
                    />
                </View>
            )}
        </BaseScreen>
    )
}

export default GameStatsScreen
