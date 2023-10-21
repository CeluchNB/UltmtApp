import ActiveGameWarning from '../components/atoms/ActiveGameWarning'
import { ApiError } from '../types/services'
import { Button } from 'react-native-paper'
import { DisplayStat } from '../types/stats'
import { Game } from '../types/game'
import GameListItem from '../components/atoms/GameListItem'
import IconButtonText from '../components/atoms/IconButtonText'
import MapSection from '../components/molecules/MapSection'
import { ProfileProps } from '../types/navigation'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import Section from '../components/molecules/Section'
import StatListItem from '../components/atoms/StatListItem'
import TeamListItem from '../components/atoms/TeamListItem'
import { convertProfileScreenStatsToStatListItem } from '../utils/stats'
import { fetchProfile } from '../services/data/user'
import { getPlayerStats } from '../services/data/stats'
import { getUniqueTeamIds } from '../utils/player'
import { logout } from '../services/data/auth'
import { useTheme } from '../hooks'
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { getActiveGames, getGamesByTeam } from '../services/data/game'
import {
    resetState,
    selectAccount,
    selectManagerTeams,
    selectPlayerTeams,
    setProfile,
} from '../store/reducers/features/account/accountReducer'
import { setLogger, useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<ProfileProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const dispatch = useDispatch()
    const account = useSelector(selectAccount)
    const playerTeams = useSelector(selectPlayerTeams)
    const managerTeams = useSelector(selectManagerTeams)
    const [loading, setLoading] = React.useState(false)

    const allTeams = React.useMemo(() => {
        return getUniqueTeamIds(account)
    }, [account])

    const getAllGames = React.useCallback(async () => {
        const games = await Promise.all(allTeams.map(id => getGamesByTeam(id)))
        return games.flat()
    }, [allTeams])

    const { data: activeGames, refetch: activeGameRefetch } = useQuery<Game[]>(
        ['activeGames'],
        () => getActiveGames(),
    )

    const {
        isLoading: profileLoading,
        error: profileError,
        refetch: profileRefetch,
    } = useQuery(['fetchProfile'], () => fetchProfile(), {
        retry: 3,
        onSuccess: data => {
            dispatch(setProfile(data))
        },
    })

    const {
        data: games,
        isLoading: gameLoading,
        refetch: gameRefetch,
    } = useQuery(['getAllGamesByUser', { userId: account._id }], () =>
        getAllGames(),
    )

    const {
        data: stats,
        isLoading: statsLoading,
        refetch: statsRefetch,
    } = useQuery(
        ['getPlayersStats', { id: account._id }],
        () => getPlayerStats(account._id),
        {
            enabled: !!account?._id,
            retry: false,
        },
    )

    const sortedGames = React.useMemo(() => {
        return games
            ?.sort(
                (a, b) =>
                    new Date(b.startTime).getTime() -
                    new Date(a.startTime).getTime(),
            )
            .slice(0, 3)
    }, [games])

    const statsList: DisplayStat[] = React.useMemo(() => {
        return convertProfileScreenStatsToStatListItem(stats)
    }, [stats])

    const teams = React.useMemo(() => {
        return [
            ...managerTeams.map(team => ({ ...team, managing: true })),
            ...playerTeams.map(team => ({ ...team, managing: false })),
        ]
    }, [managerTeams, playerTeams])

    React.useEffect(() => {
        // Disable react-query warning logs b/c players stats result is often an error
        setLogger({ warn: () => {}, error: () => {}, log: console.log })
        return () => {
            setLogger(console)
        }
    }, [])

    const onLogout = async () => {
        try {
            setLoading(true)
            await logout()
            dispatch(resetState())
            setLoading(false)
        } catch (e: any) {
        } finally {
            navigation.navigate('Login')
        }
    }

    const onCreateTeam = () => {
        navigation.navigate('CreateTeam')
    }

    const onCreateGame = () => {
        navigation.navigate('SelectMyTeam')
    }

    const onViewGame = (gameId: string) => {
        navigation.navigate('Tabs', {
            screen: 'Games',
            params: {
                screen: 'ViewGame',
                params: {
                    gameId,
                },
                initial: false,
            },
        })
    }

    const styles = StyleSheet.create({
        container: {
            minHeight: '100%',
            backgroundColor: colors.primary,
        },
        titleContainer: {
            flexDirection: 'row',
            marginLeft: 10,
            marginBottom: 0,
        },
        title: {
            flex: 1,
            alignSelf: 'center',
        },
        headerContainer: {
            alignItems: 'center',
        },
        footerContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        signOutButton: {
            marginTop: 5,
        },
        requestsButton: {
            margin: 10,
        },
        settingsButton: {
            marginTop: 10,
            marginRight: 10,
        },
        indicatorStyle: {
            width: '80%',
            height: '50%',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            textAlign: 'center',
            fontSize: size.fontThirty,
            color: colors.gray,
        },
    })

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                showsVerticalScrollIndicator={false}
                testID="profile-flat-list"
                refreshControl={
                    <RefreshControl
                        colors={[colors.textSecondary]}
                        tintColor={colors.textSecondary}
                        refreshing={profileLoading}
                        onRefresh={async () => {
                            profileRefetch()
                            gameRefetch()
                            activeGameRefetch()
                            statsRefetch()
                        }}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <View style={styles.titleContainer}>
                            <ScreenTitle
                                style={styles.title}
                                title={
                                    account.firstName.length > 0
                                        ? `${account.firstName} ${account.lastName}`
                                        : 'My Profile'
                                }
                            />
                            <IconButtonText
                                style={styles.requestsButton}
                                icon="email-outline"
                                text="Requests"
                                onPress={() => {
                                    navigation.navigate('UserRequests')
                                }}
                            />
                            <IconButtonText
                                style={styles.settingsButton}
                                icon="cog-outline"
                                text="Settings"
                                onPress={() => {
                                    navigation.navigate('Settings')
                                }}
                            />
                        </View>
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: size.fontTwenty,
                            }}>
                            {`@${
                                account.username
                                    ? account.username
                                    : 'myaccount'
                            }`}
                        </Text>
                        <Button
                            mode="text"
                            textColor={colors.error}
                            uppercase={true}
                            onPress={onLogout}
                            loading={loading}
                            style={styles.signOutButton}>
                            Sign Out
                        </Button>
                        <ActiveGameWarning
                            count={activeGames?.length}
                            onPress={() => {
                                navigation.navigate('ActiveGames')
                            }}
                        />
                    </View>
                }
                ListFooterComponent={
                    profileError ? (
                        <View style={styles.footerContainer}>
                            <Text style={styles.error}>
                                {(profileError as ApiError).message}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.footerContainer}>
                            <Section
                                title="Stats"
                                showButton={true}
                                onButtonPress={() => {
                                    navigation.navigate('PublicUserDetails', {
                                        userId: account._id,
                                        tab: 'stats',
                                    })
                                }}
                                buttonText="see all stats"
                                error={
                                    !statsList || statsList.length === 0
                                        ? 'No stats available'
                                        : ''
                                }
                                listData={statsList}
                                loading={statsLoading}
                                numColumns={2}
                                renderItem={({ item }) => {
                                    return <StatListItem stat={item} />
                                }}
                            />
                            <View>
                                <MapSection
                                    title="Games"
                                    showButton={true}
                                    showCreateButton={true}
                                    onCreatePress={onCreateGame}
                                    onButtonPress={async () => {
                                        navigation.navigate(
                                            'PublicUserDetails',
                                            {
                                                userId: account._id,
                                                tab: 'games',
                                            },
                                        )
                                    }}
                                    buttonText="see all games"
                                    listData={sortedGames}
                                    loading={gameLoading}
                                    renderItem={item => {
                                        return (
                                            <GameListItem
                                                key={item._id}
                                                game={item}
                                                onPress={() => {
                                                    onViewGame(item._id)
                                                }}
                                            />
                                        )
                                    }}
                                    error={
                                        !sortedGames ||
                                        sortedGames?.length === 0
                                            ? 'No games available'
                                            : undefined
                                    }
                                />
                            </View>
                            <MapSection
                                title="Teams"
                                showButton={true}
                                onButtonPress={() => {
                                    navigation.navigate('ManageTeams')
                                }}
                                buttonText="manage teams"
                                listData={teams.slice(0, 3)}
                                renderItem={team => {
                                    return (
                                        <TeamListItem
                                            key={`${team._id}-${
                                                team.managing
                                                    ? 'manage'
                                                    : 'player'
                                            }`}
                                            team={team}
                                            managing={team.managing}
                                            onPress={async () => {
                                                if (team.managing) {
                                                    navigation.navigate(
                                                        'ManagedTeamDetails',
                                                        {
                                                            id: team._id,
                                                        },
                                                    )
                                                } else {
                                                    navigation.navigate(
                                                        'PublicTeamDetails',
                                                        {
                                                            id: team._id,
                                                        },
                                                    )
                                                }
                                            }}
                                        />
                                    )
                                }}
                                error={
                                    teams.length === 0
                                        ? 'No teams available'
                                        : undefined
                                }
                                showCreateButton={true}
                                onCreatePress={onCreateTeam}
                            />
                        </View>
                    )
                }
            />
        </SafeAreaView>
    )
}

export default ProfileScreen
