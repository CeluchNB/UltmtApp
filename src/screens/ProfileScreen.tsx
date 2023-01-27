import ActiveGameWarning from '../components/atoms/ActiveGameWarning'
import { Button } from 'react-native-paper'
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
import { User } from '../types/user'
import { fetchProfile } from '../services/data/user'
import { logout } from '../services/data/auth'
import { size } from '../theme/fonts'
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
import { useColors, useData } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<ProfileProps> = ({ navigation }) => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const playerTeams = useSelector(selectPlayerTeams)
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState(false)

    const { data: activeGames, refetch: activeGameRefetch } = useData<Game[]>(
        getActiveGames,
        account._id,
    )
    const {
        data: profile,
        loading: profileLoading,
        error: profileError,
        refetch: profileRefetch,
    } = useData<User>(fetchProfile)

    const teamToGet = React.useMemo(() => {
        if (!profile) {
            return undefined
        }
        if (profile.managerTeams.length > 0) {
            return profile.managerTeams[0]._id
        }
        if (profile.playerTeams.length > 0) {
            return profile.playerTeams[0]._id
        }
        return undefined
    }, [profile])

    const {
        data: games,
        loading: gameLoading,
        refetch: gameRefetch,
    } = useData<Game[]>(getGamesByTeam, teamToGet)

    const sortedGames = React.useMemo(() => {
        return games?.reverse().slice(0, 3)
    }, [games])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (!profileLoading) {
                profileRefetch()
                gameRefetch()
                activeGameRefetch()
            }
        })
        return unsubscribe
    })

    React.useEffect(() => {
        if (!profileLoading && profile) {
            dispatch(setProfile(profile))
        }
    }, [profileLoading, profile, dispatch])

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
        navigation.navigate('Tabs', {
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
            textAlign: 'right',
            marginLeft: 10,
            marginBottom: 0,
        },
        title: {
            flex: 1,
            textAlignVertical: 'center',
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
            fontSize: size.fontLarge,
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
                        refreshing={profileLoading}
                        onRefresh={async () => {
                            profileRefetch()
                            gameRefetch()
                            activeGameRefetch()
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
                                    navigation.navigate('UserRequestsScreen')
                                }}
                            />
                            <IconButtonText
                                style={styles.settingsButton}
                                icon="cog-outline"
                                text="Settings"
                                onPress={() => {
                                    navigation.navigate('SettingsScreen')
                                }}
                            />
                        </View>
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: size.fontMedium,
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
                                {profileError.message}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.footerContainer}>
                            <Section
                                title="Stats"
                                showButton={false}
                                onButtonPress={() => ({})}
                                buttonText="see all stats"
                                error="No stats available"
                                listData={[]}
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
                                        navigation.navigate('TeamGames')
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
                                        games?.length === 0
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
                                                        place: team.place,
                                                        name: team.name,
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
