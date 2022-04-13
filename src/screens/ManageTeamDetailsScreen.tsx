import * as React from 'react'
import * as RequestData from '../services/data/request'
import * as TeamData from '../services/data/team'
import { ManagedTeamDetailsProps } from '../types/navigation'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserListItem from '../components/atoms/UserListItem'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { DetailedRequest, RequestType } from '../types/request'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    getManagedTeam,
    removePlayer,
    selectOpenLoading,
    selectTeam,
    selectTeamLoading,
    setTeam,
    setTeamLoading,
    toggleRosterStatus,
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
    const openLoading = useSelector(selectOpenLoading)

    const { colors } = useColors()
    const isMounted = React.useRef(false)
    const [requestsLoading, setRequestsLoading] = React.useState(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [error, setError] = React.useState(undefined)
    const [refreshing, setRefreshing] = React.useState(false)
    const [deleteRequestError, setDeleteRequestError] = React.useState('')
    const [deleteRequestId, setDeleteRequestId] = React.useState('')
    const [respondRequestError, setRespondRequestError] = React.useState('')
    const [respondRequestId, setResponseRequestId] = React.useState('')

    const initializeScreen = React.useCallback(async () => {
        try {
            dispatch(setTeamLoading(true))
            const teamResponse = await TeamData.getManagedTeam(token, id)
            if (!isMounted.current) {
                return
            }
            setRequestsLoading(true)
            dispatch(setTeam(teamResponse))
            dispatch(setTeamLoading(false))
            const reqs = await Promise.all(
                teamResponse.requests.map((req: string) => {
                    return RequestData.getRequest(token, req)
                }),
            )
            if (isMounted.current) {
                setRequests(reqs)
            }
        } catch (e: any) {
            if (isMounted.current) {
                dispatch(setTeam(undefined))
                setError(e.message)
            }
        } finally {
            if (isMounted.current) {
                setRequestsLoading(false)
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

    const onToggleRosterStatus = async (open: boolean) => {
        dispatch(toggleRosterStatus({ token, id, open }))
    }

    const rolloverSeason = async () => {
        // navigate to rollover screen
        navigation.navigate('RolloverTeam', {
            hasPendingRequests:
                requests.filter(req => req.status === 'pending').length > 0,
        })
    }

    const respondToRequest = async (requestId: string, accept: boolean) => {
        try {
            setRespondRequestError('')
            setResponseRequestId(requestId)
            await RequestData.respondToPlayerRequest(token, requestId, accept)
            setRequests(requests.filter(r => r._id !== requestId))

            if (accept) {
                dispatch(getManagedTeam({ token, id }))
            }
        } catch (e: any) {
            setRespondRequestError(
                e.message ?? 'Unable to respond to this request',
            )
        }
    }

    const onRemovePlayer = async (userId: string) => {
        dispatch(removePlayer({ token, id, userId }))
    }

    const deleteRequest = async (requestId: string) => {
        try {
            setDeleteRequestError('')
            setDeleteRequestId(requestId)
            const request = await RequestData.deleteTeamRequest(
                token,
                requestId,
            )
            // ONLY FILTERING LOCALLY, SHOULD I RE-CALL 'getTeam'?
            setRequests(requests.filter(r => r._id !== request._id))
        } catch (e: any) {
            setDeleteRequestError(e.message ?? 'Unable to delete this request.')
        }
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
                        text={`${team?.rosterOpen ? 'Close' : 'Open'} Roster`}
                        loading={openLoading}
                        onPress={() => onToggleRosterStatus(!team?.rosterOpen)}
                    />
                    <SecondaryButton
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
                        showButton={true}
                        showCreateButton={false}
                        buttonText="Add Managers"
                        onButtonPress={() => {
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
                        showButton={true}
                        showCreateButton={false}
                        buttonText="Add Players"
                        onButtonPress={() => {
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
                    <MapSection
                        title="Request From Players"
                        listData={requests.filter(
                            item => item.requestSource !== 'team',
                        )}
                        renderItem={item => {
                            return (
                                <UserListItem
                                    key={item._id}
                                    user={item.userDetails}
                                    showDelete={true}
                                    showAccept={true}
                                    onDelete={() =>
                                        respondToRequest(item._id, false)
                                    }
                                    onAccept={() =>
                                        respondToRequest(item._id, true)
                                    }
                                    error={
                                        respondRequestError.length > 0 &&
                                        item._id === respondRequestId
                                            ? respondRequestError
                                            : undefined
                                    }
                                />
                            )
                        }}
                        loading={requestsLoading}
                        showButton={false}
                        showCreateButton={false}
                        buttonText=""
                        onButtonPress={() => {}}
                        error={
                            requests.filter(
                                item => item.requestSource !== 'team',
                            ).length <= 0
                                ? 'No open requests from players'
                                : undefined
                        }
                    />
                    <MapSection
                        title="Requests To Players"
                        listData={requests.filter(
                            item => item.requestSource !== 'player',
                        )}
                        renderItem={item => {
                            return (
                                <UserListItem
                                    key={item._id}
                                    user={item.userDetails}
                                    showDelete={true}
                                    showAccept={false}
                                    requestStatus={item.status}
                                    onDelete={() => deleteRequest(item._id)}
                                    error={
                                        item._id === deleteRequestId &&
                                        deleteRequestError.length > 0
                                            ? deleteRequestError
                                            : undefined
                                    }
                                />
                            )
                        }}
                        loading={requestsLoading}
                        showButton={false}
                        showCreateButton={false}
                        buttonText=""
                        onButtonPress={() => {}}
                        error={
                            requests.filter(
                                item => item.requestSource !== 'player',
                            ).length <= 0
                                ? 'No open requests to players'
                                : undefined
                        }
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ManageTeamDetailsScreen
