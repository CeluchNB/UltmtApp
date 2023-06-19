import * as UserData from './../services/data/user'
import { ApiError } from '../types/services'
import { Game } from '../types/game'
import { PublicUserDetailsProps } from '../types/navigation'
import React from 'react'
import { User } from '../types/user'
import { getGamesByTeam } from '../services/data/game'
import { useSelector } from 'react-redux'
import PublicUserGamesScene, {
    PublicUserGamesSceneProps,
} from '../components/organisms/PublicUserGamesScene'
import PublicUserStatsScene, {
    PublicUserStatsSceneProps,
} from '../components/organisms/PublicUserStatsScene'
import PublicUserTeamScene, {
    PublicUserTeamSceneProps,
} from '../components/organisms/PublicUserTeamScene'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import {
    selectManagerTeams,
    selectPlayerTeams,
    setError,
} from '../store/reducers/features/account/accountReducer'
import { useData, useTheme } from './../hooks'

const renderScene = (
    teamProps: PublicUserTeamSceneProps,
    gameProps: PublicUserGamesSceneProps,
    statsProps: PublicUserStatsSceneProps,
) => {
    return ({ route }: { route: { key: string } }) => {
        const sceneStyle = { marginTop: 10 }
        switch (route.key) {
            case 'teams':
                return (
                    <View style={sceneStyle}>
                        <PublicUserTeamScene {...teamProps} />
                    </View>
                )
            case 'games':
                return (
                    <View style={sceneStyle}>
                        <PublicUserGamesScene {...gameProps} />
                    </View>
                )
            case 'stats':
                return (
                    <View style={sceneStyle}>
                        <PublicUserStatsScene {...statsProps} />
                    </View>
                )
            default:
                return null
        }
    }
}

const PublicUserScreen: React.FC<PublicUserDetailsProps> = ({
    route,
    navigation,
}) => {
    const layout = useWindowDimensions()

    const { userId, tab = 'teams' } = route.params
    const {
        theme: { colors, size },
    } = useTheme()

    const mapTabNameToIndex = (name: 'teams' | 'games' | 'stats'): number => {
        switch (name) {
            case 'teams':
                return 0
            case 'games':
                return 1
            case 'stats':
                return 2
        }
    }

    const [index, setIndex] = React.useState(mapTabNameToIndex(tab))
    const [routes] = React.useState([
        { key: 'teams', title: 'Teams' },
        { key: 'games', title: 'Games' },
        { key: 'stats', title: 'Stats' },
    ])

    const {
        data: user,
        loading,
        error,
        refetch,
    } = useData<User>(UserData.getPublicUser, userId)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!loading && !user) {
                refetch()
            }
        })

        return unsubscribe
    }, [navigation, loading, user, refetch])

    React.useEffect(() => {
        navigation.setOptions({
            title: `${user?.firstName} ${user?.lastName}`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const managerTeams = useSelector(selectManagerTeams)
    const playerTeams = useSelector(selectPlayerTeams)
    const [games, setGames] = React.useState<Game[][]>([])
    const [gameLoading, setGameLoading] = React.useState(false)
    const [gameError, setGameError] = React.useState<ApiError | undefined>(
        undefined,
    )

    const allTeams = React.useMemo(() => {
        const map = new Map()
        managerTeams.forEach(team => {
            map.set(team._id, team)
        })
        playerTeams.forEach(team => {
            map.set(team._id, team)
        })
        return [...map.values()]
    }, [managerTeams, playerTeams])

    const gameLists = React.useMemo(() => {
        const tempGames: { title: string; data: Game[]; index: number }[] = []
        games.forEach((g, i) => {
            if (g.length === 0) {
                return
            }
            const sortedGames = g.sort(
                (a, b) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime(),
            )
            tempGames.push({
                title: `${allTeams[i].place} ${allTeams[i].name}`,
                data: sortedGames,
                index: i,
            })
        })
        return tempGames
    }, [games, allTeams])

    const filterableGames = React.useMemo(() => {
        const tempGames: { game: Game; teamId: string }[] = []

        for (let i = 0; i < games.length; i++) {
            // only include games player played in
            if (!playerTeams.some(team => team._id === allTeams[i]._id)) {
                continue
            }
            tempGames.push(
                ...games[i].map(value => ({
                    game: value,
                    teamId: allTeams[i]._id,
                })),
            )
        }
        return tempGames
    }, [games, allTeams, playerTeams])

    const fetchGames = React.useCallback(() => {
        setError(undefined)
        setGameLoading(true)
        const promises = allTeams.map(team => getGamesByTeam(team._id))

        Promise.all(promises)
            .then(g => {
                setGames(g)
            })
            .catch(e => {
                setGameError(e)
            })
            .finally(() => {
                setGameLoading(false)
            })
    }, [allTeams])

    React.useEffect(() => {
        fetchGames()
    }, [fetchGames])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        titleText: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            alignSelf: 'center',
        },
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontThirty,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <Text style={styles.titleText}>@{user?.username}</Text>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene(
                    {
                        loading,
                        refetch,
                        user,
                        error,
                    },
                    {
                        gameLists,
                        teams: allTeams,
                        loading: gameLoading,
                        error: gameError,
                        refetch: fetchGames,
                    },
                    {
                        userId,
                        teams: [
                            ...(user?.playerTeams || []),
                            ...(user?.archiveTeams || []),
                        ],
                        games: filterableGames,
                    },
                )}
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
        </SafeAreaView>
    )
}

export default PublicUserScreen
