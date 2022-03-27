import * as React from 'react'
import * as RequestData from '../services/data/request'
import { DetailedRequest } from '../types/request'
import { DisplayTeam } from '../types/team'
import MapSection from '../components/molecules/MapSection'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import TeamListItem from '../components/atoms/TeamListItem'
import { size } from '../theme/fonts'
import { useColors } from '../hooks/index'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    leaveTeam,
    removeRequest,
    selectManagerTeams,
    selectPlayerTeams,
    selectRequests,
    selectToken,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ManageTeams: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const playerTeams = useSelector(selectPlayerTeams)
    const managerTeams = useSelector(selectManagerTeams)
    const requestIds = useSelector(selectRequests)
    const token = useSelector(selectToken)

    const isMounted = React.useRef(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [refreshing, setRefreshing] = React.useState(false)
    const [fetchError, setFetchError] = React.useState('')
    const [respondRequestError, setRespondRequestError] = React.useState('')
    const [respondRequestId, setRespondRequestId] = React.useState('')
    const [deleteRequestError, setDeleteRequestError] = React.useState('')
    const [deleteRequestId, setDeleteRequestId] = React.useState('')

    const getRequests = React.useCallback(
        async (reqIds: string[]) => {
            const reqResponses = await Promise.all(
                reqIds.map(req => {
                    return RequestData.getRequest(token, req)
                }),
            ).catch((e: any) => {
                setFetchError(e.message ?? 'Unable to get team details')
            })
            if (reqResponses && isMounted.current) {
                setRequests(
                    reqResponses.filter(
                        req => req !== undefined,
                    ) as DetailedRequest[],
                )
            }
        },
        [token, isMounted],
    )

    React.useEffect(() => {
        isMounted.current = true
        const unsubscribe = navigation.addListener('focus', () => {
            setFetchError('')
            setRespondRequestError('')
            setDeleteRequestError('')
            getRequests(requestIds)
        })
        return () => {
            isMounted.current = false
            unsubscribe()
        }
    }, [getRequests, navigation, requestIds])

    const openTeamDetails = async (item: DisplayTeam) => {
        navigation.navigate('ManagedTeamDetails', {
            id: item._id,
            place: item.place,
            name: item.name,
        })
    }

    // Strictly through redux?
    const respondToRequest = async (requestId: string, accept: boolean) => {
        try {
            setRespondRequestId(requestId)
            setRespondRequestError('')
            await RequestData.respondToTeamRequest(token, requestId, accept)
            dispatch(removeRequest(requestId))
            setRequests(requests.filter(req => req._id !== requestId))
        } catch (e: any) {
            setRespondRequestError(e.message ?? 'Unable to respond to request')
        }
    }

    // Strictly through redux?
    const deleteRequest = async (requestId: string) => {
        try {
            setDeleteRequestId(requestId)
            setDeleteRequestError('')
            await RequestData.deleteUserRequest(token, requestId)
            dispatch(removeRequest(requestId))
            setRequests(requests.filter(req => req._id !== requestId))
        } catch (e: any) {
            setDeleteRequestError(e.message ?? 'Unable to delete request')
        }
    }

    // Do it outside of redux?
    // 'eventError' in redux vs. 'pageError'?
    const onLeaveTeam = (teamId: string) => {
        dispatch(leaveTeam({ token, teamId }))
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            alignSelf: 'center',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontLarge,
            color: colors.gray,
        },
        container: {
            width: '75%',
            alignSelf: 'center',
        },
    })

    if (fetchError.length > 0) {
        return (
            <SafeAreaView style={styles.screen}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            colors={[colors.textSecondary]}
                            refreshing={refreshing}
                            onRefresh={async () => {
                                setRefreshing(true)
                                await getRequests(requestIds)
                                setRefreshing(false)
                            }}
                        />
                    }
                    testID="mt-scroll-view">
                    <ScreenTitle style={styles.title} title="Manage Teams" />
                    <Text style={styles.error}>{fetchError}</Text>
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
                            setRefreshing(true)
                            await getRequests(requestIds)
                            setRefreshing(false)
                        }}
                    />
                }
                testID="mt-scroll-view">
                <ScreenTitle style={styles.title} title="Manage Teams" />
                <View style={styles.container}>
                    <MapSection
                        title="Teams I Play For"
                        showButton={true}
                        showCreateButton={false}
                        onButtonPress={() => {
                            navigation.navigate('RequestTeam')
                        }}
                        buttonText="request team"
                        error={
                            playerTeams.length === 0
                                ? 'You have not played for any teams yet'
                                : undefined
                        }
                        listData={playerTeams}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    showDelete={true}
                                    onDelete={async () => {
                                        onLeaveTeam(team._id)
                                    }}
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
                    />
                    <MapSection
                        title="Teams I Manage"
                        showButton={true}
                        showCreateButton={false}
                        onButtonPress={() => {
                            navigation.navigate('CreateTeam')
                        }}
                        buttonText="create team"
                        error={
                            managerTeams.length === 0
                                ? 'You have not managed any teams yet'
                                : undefined
                        }
                        listData={managerTeams}
                        renderItem={team => {
                            return (
                                <TeamListItem
                                    key={team._id}
                                    team={team}
                                    onPress={() => openTeamDetails(team)}
                                />
                            )
                        }}
                    />
                    <MapSection
                        title="Requests From Teams"
                        showButton={false}
                        showCreateButton={false}
                        listData={requests.filter(
                            req => req.requestSource !== 'player',
                        )}
                        renderItem={item => {
                            return (
                                <TeamListItem
                                    key={item._id}
                                    team={item.teamDetails}
                                    showAccept={true}
                                    showDelete={true}
                                    onAccept={async () => {
                                        await respondToRequest(item._id, true)
                                    }}
                                    onDelete={async () => {
                                        await respondToRequest(item._id, false)
                                    }}
                                    error={
                                        respondRequestError.length > 0 &&
                                        respondRequestId === item._id
                                            ? respondRequestError
                                            : undefined
                                    }
                                />
                            )
                        }}
                    />
                    <MapSection
                        title="Requests To Teams"
                        showButton={false}
                        showCreateButton={false}
                        listData={requests.filter(
                            req => req.requestSource !== 'team',
                        )}
                        renderItem={item => {
                            return (
                                <TeamListItem
                                    key={item._id}
                                    team={item.teamDetails}
                                    showAccept={false}
                                    showDelete={true}
                                    onDelete={async () => {
                                        await deleteRequest(item._id)
                                    }}
                                    requestStatus={item.status}
                                    error={
                                        deleteRequestError.length > 0 &&
                                        deleteRequestId === item._id
                                            ? deleteRequestError
                                            : undefined
                                    }
                                />
                            )
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default ManageTeams
