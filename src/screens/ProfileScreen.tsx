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
import { logout } from '../services/data/auth'
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
    selectPlayerTeams,
    setProfile,
} from '../store/reducers/features/account/accountReducer'
import { setLogger, useQuery } from 'react-query'
import { useData, useTheme } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<ProfileProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const dispatch = useDispatch()
    const account = useSelector(selectAccount)
    const playerTeams = useSelector(selectPlayerTeams)
    const [loading, setLoading] = React.useState(false)

    const teamToGet = React.useMemo(() => {
        if (!account) {
            return undefined
        }
        if (account.managerTeams.length > 0) {
            return account.managerTeams[0]._id
        }
        if (account.playerTeams.length > 0) {
            return account.playerTeams[0]._id
        }
        return undefined
    }, [account])

    const { data: activeGames, refetch: activeGameRefetch } = useData<Game[]>(
        getActiveGames,
        account._id,
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
    } = useQuery(
        ['getGamesByTeam', { teamId: teamToGet }],
        () => getGamesByTeam(teamToGet || ''),
        { enabled: !!teamToGet },
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
        return games?.reverse().slice(0, 3)
    }, [games])

    const statsList: DisplayStat[] = React.useMemo(() => {
        return convertProfileScreenStatsToStatListItem(stats)
    }, [stats])

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
        navigation.navigate('GameCreationFlow', { screen: 'SelectMyTeam' })
    }

    const onViewGame = (gameId: string) => {
        navigation.push('Tabs', {
            screen: 'Games',
            params: {
                screen: 'ViewGame',
                params: {
                    gameId,
                },
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
                                                teamId={teamToGet}
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
                                listData={playerTeams}
                                renderItem={team => {
                                    return (
                                        <TeamListItem
                                            key={team._id}
                                            team={team}
                                            onPress={async () => {
                                                navigation.navigate(
                                                    'PublicTeamDetails',
                                                    {
                                                        id: team._id,
                                                    },
                                                )
                                            }}
                                        />
                                    )
                                }}
                                error={
                                    playerTeams.length === 0
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
