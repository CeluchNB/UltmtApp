import * as React from 'react'
import * as TeamData from '../services/data/team'
import { ManagedTeamDetailsProps } from '../types/navigation'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { RequestType } from '../types/request'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserListItem from '../components/atoms/UserListItem'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    removePlayer,
    selectTeam,
    selectTeamLoading,
    setTeam,
    setTeamLoading,
} from '../store/reducers/features/team/managedTeamReducer'
import { size, weight } from '../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const ManageTeamDetailsScreen: React.FC<ManagedTeamDetailsProps> = ({
    navigation,
    route,
}: ManagedTeamDetailsProps) => {
    const { id, place, name } = route.params
    const dispatch = useDispatch()
    const token = useSelector(selectToken)
    const team = useSelector(selectTeam)
    const teamLoading = useSelector(selectTeamLoading)

    const { colors } = useColors()
    const isMounted = React.useRef(false)
    const [error, setError] = React.useState(undefined)
    const [refreshing, setRefreshing] = React.useState(false)

    const initializeScreen = React.useCallback(async () => {
        try {
            dispatch(setTeamLoading(true))
            const teamResponse = await TeamData.getManagedTeam(token, id)
            if (!isMounted.current) {
                return
            }
            dispatch(setTeam(teamResponse))
        } catch (e: any) {
            if (isMounted.current) {
                dispatch(setTeam(undefined))
                setError(e.message)
            }
        } finally {
            if (isMounted.current) {
                dispatch(setTeamLoading(false))
            }
        }
    }, [dispatch, token, id])

    React.useEffect(() => {
        isMounted.current = true
        const unsubscribe = navigation.addListener('focus', () => {
            initializeScreen()
        })
        return () => {
            unsubscribe()
            isMounted.current = false
        }
    })

    const rolloverSeason = async () => {
        // navigate to rollover screen
        navigation.navigate('RolloverTeam')
    }

    const onRemovePlayer = async (userId: string) => {
        dispatch(removePlayer({ token, id, userId }))
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            flex: 1,
        },
        headerContainer: {
            alignItems: 'center',
        },
        title: {
            textAlign: 'center',
        },
        date: {
            textAlign: 'center',
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        teamname: {
            textAlign: 'center',
            fontSize: size.fontFifteen,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        listContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            color: colors.error,
            fontSize: size.fontLarge,
            width: '75%',
        },
        newSeasonButton: {
            marginTop: 10,
        },
    })

    if (error) {
        return (
            <SafeAreaView style={styles.screen}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            colors={[colors.textSecondary]}
                            refreshing={refreshing}
                            onRefresh={async () => {
                                if (isMounted.current) {
                                    setRefreshing(true)
                                    await initializeScreen()
                                    setRefreshing(false)
                                }
                            }}
                        />
                    }
                    testID="mtd-flat-list">
                    <View style={styles.headerContainer}>
                        <ScreenTitle
                            title={`${place} ${name}`}
                            style={styles.title}
                        />
                        <Text style={styles.error}>{error}</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        colors={[colors.textSecondary]}
                        refreshing={refreshing}
                        onRefresh={async () => {
                            if (isMounted.current) {
                                setRefreshing(true)
                                await initializeScreen()
                                setRefreshing(false)
                            }
                        }}
                    />
                }
                testID="mtd-flat-list">
                <View style={styles.headerContainer}>
                    <ScreenTitle
                        title={`${place} ${name}`}
                        style={styles.title}
                    />
                    {team?.seasonStart === team?.seasonEnd ? (
                        <Text style={styles.date}>
                            {new Date(team?.seasonStart || '').getUTCFullYear()}
                        </Text>
                    ) : (
                        <Text style={styles.date}>
                            {new Date(
                                team?.seasonStart || '',
                            ).getUTCFullYear() +
                                ' - ' +
                                new Date(
                                    team?.seasonEnd || '',
                                ).getUTCFullYear()}
                        </Text>
                    )}
                    <Text style={styles.teamname}>@{team?.teamname}</Text>
                    <PrimaryButton
                        text="manage requests"
                        loading={false}
                        onPress={async () => {
                            navigation.navigate('TeamRequestsScreen')
                        }}
                    />
                    <SecondaryButton
                        style={styles.newSeasonButton}
                        text="Start New Season"
                        onPress={rolloverSeason}
                    />
                </View>
                <View style={styles.listContainer}>
                    <MapSection
                        title="Managers"
                        listData={team?.managers || []}
                        renderItem={manager => (
                            <UserListItem
                                key={manager._id}
                                user={manager}
                                onPress={async () => {
                                    navigation.navigate('PublicUserDetails', {
                                        user: manager,
                                    })
                                }}
                            />
                        )}
                        loading={teamLoading}
                        showButton={false}
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestUser', {
                                type: RequestType.MANAGER,
                            })
                        }}
                    />
                    <MapSection
                        title="Players"
                        listData={team?.players || []}
                        renderItem={user => (
                            <UserListItem
                                key={user._id}
                                user={user}
                                showDelete={true}
                                showAccept={false}
                                onPress={async () => {
                                    navigation.navigate('PublicUserDetails', {
                                        user,
                                    })
                                }}
                                onDelete={() => onRemovePlayer(user._id)}
                            />
                        )}
                        loading={teamLoading}
                        showButton={false}
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestUser', {
                                type: RequestType.PLAYER,
                            })
                        }}
                        error={
                            team?.players && team.players.length <= 0
                                ? 'No players on this team'
                                : undefined
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ManageTeamDetailsScreen
