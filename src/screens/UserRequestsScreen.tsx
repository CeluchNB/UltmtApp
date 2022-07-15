import * as React from 'react'
import * as RequestData from '../services/data/request'
import { DetailedRequest } from '../types/request'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import TeamListItem from '../components/atoms/TeamListItem'
import { size } from '../theme/fonts'
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
    removeRequest,
    selectError,
    selectOpenToRequests,
    selectToggleLoading,
    selectToken,
    setOpenToRequests,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const UserRequestsScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const token = useSelector(selectToken)
    const toggleLoading = useSelector(selectToggleLoading)
    const openToRequests = useSelector(selectOpenToRequests)
    const error = useSelector(selectError)

    const isMounted = React.useRef(false)
    const [refreshing, setRefreshing] = React.useState(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [fetchError, setFetchError] = React.useState('')
    const [respondRequestError, setRespondRequestError] = React.useState('')
    const [respondRequestId, setRespondRequestId] = React.useState('')
    const [deleteRequestError, setDeleteRequestError] = React.useState('')
    const [deleteRequestId, setDeleteRequestId] = React.useState('')

    const getRequests = React.useCallback(async () => {
        try {
            setFetchError('')
            const reqResponses = await RequestData.getRequestsByUser(token)

            if (reqResponses && isMounted.current) {
                setRequests(
                    reqResponses.filter(
                        req => req !== undefined,
                    ) as DetailedRequest[],
                )
            }
        } catch (e: any) {
            setFetchError(e.message ?? 'Unable to get request details')
        }
    }, [token, isMounted])

    React.useEffect(() => {
        isMounted.current = true
        const unsubscribe = navigation.addListener('focus', () => {
            setFetchError('')
            setRespondRequestError('')
            setDeleteRequestError('')
            getRequests()
        })
        return () => {
            isMounted.current = false
            unsubscribe()
        }
    }, [getRequests, navigation])

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

    const toggleRosterOpen = () => {
        dispatch(setOpenToRequests({ token, open: !openToRequests }))
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
        toggleError: {
            alignSelf: 'center',
            fontSize: size.fontFifteen,
            color: colors.error,
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
                                await getRequests()
                                setRefreshing(false)
                            }}
                        />
                    }
                    testID="mt-scroll-view">
                    <ScreenTitle style={styles.title} title="My Requests" />
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
                        onRefresh={async () => {
                            setRefreshing(true)
                            await getRequests()
                            setRefreshing(false)
                        }}
                        refreshing={refreshing}
                    />
                }
                testID="mt-scroll-view">
                <ScreenTitle style={styles.title} title="My Requests" />
                <View style={styles.container}>
                    <PrimaryButton
                        text={`${
                            openToRequests ? 'prevent' : 'allow'
                        } requests`}
                        onPress={async () => {
                            toggleRosterOpen()
                        }}
                        loading={toggleLoading}
                        style={styles.title}
                    />
                    {error && error?.length > 0 && (
                        <Text style={styles.toggleError}>{error}</Text>
                    )}
                    <MapSection
                        title="Requests From Teams"
                        showButton={false}
                        showCreateButton={false}
                        listData={requests.filter(
                            req => req.requestSource === 'team',
                        )}
                        error={
                            requests.filter(req => req.requestSource === 'team')
                                .length === 0
                                ? 'You are all caught up on requests!'
                                : undefined
                        }
                        renderItem={item => {
                            return (
                                <TeamListItem
                                    key={item._id}
                                    team={
                                        item.teamDetails || {
                                            place: 'Team no',
                                            name: 'longer exists',
                                            teamname: 'deleteme',
                                        }
                                    }
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
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestTeam')
                        }}
                        listData={requests.filter(
                            req => req.requestSource === 'player',
                        )}
                        error={
                            requests.filter(
                                req => req.requestSource === 'player',
                            ).length === 0
                                ? 'You have no open requests!'
                                : undefined
                        }
                        renderItem={item => {
                            return (
                                <TeamListItem
                                    key={item._id}
                                    team={
                                        item.teamDetails || {
                                            place: 'Team no',
                                            name: 'longer exists',
                                            teamname: 'deleteme',
                                        }
                                    }
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

export default UserRequestsScreen
