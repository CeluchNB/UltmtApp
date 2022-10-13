import * as React from 'react'
import * as RequestData from '../services/data/request'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserListItem from '../components/atoms/UserListItem'
import { size } from '../theme/fonts'
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
    selectOpenLoading,
    selectTeam,
    toggleRosterStatus,
} from '../store/reducers/features/team/managedTeamReducer'
import { useDispatch, useSelector } from 'react-redux'

const TeamRequestsScreen: React.FC<Props> = ({ navigation }) => {
    const dispatch = useDispatch()
    const { colors } = useColors()

    const team = useSelector(selectTeam)
    const openLoading = useSelector(selectOpenLoading)

    const isMounted = React.useRef(false)
    const [refresh, setRefresh] = React.useState(false)
    const [error, setError] = React.useState<string>('')
    const [requestsLoading, setRequestsLoading] = React.useState(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [deleteRequestError, setDeleteRequestError] = React.useState('')
    const [deleteRequestId, setDeleteRequestId] = React.useState('')
    const [respondRequestError, setRespondRequestError] = React.useState('')
    const [respondRequestId, setResponseRequestId] = React.useState('')

    const initializeScreen = React.useCallback(async () => {
        try {
            setError('')
            if (!team) {
                setError('No team data. Please refresh or try again later.')
                return
            }
            setRequestsLoading(true)
            const reqs = await RequestData.getRequestsByTeam(team._id)
            if (isMounted.current) {
                setRequests(reqs)
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            if (isMounted.current) {
                setRequestsLoading(false)
            }
        }
    }, [team])

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

    const respondToRequest = async (requestId: string, accept: boolean) => {
        try {
            setRespondRequestError('')
            setResponseRequestId(requestId)
            await RequestData.respondToPlayerRequest(requestId, accept)
            setRequests(requests.filter(r => r._id !== requestId))

            if (accept) {
                dispatch(getManagedTeam({ id: team?._id || '' }))
            }
        } catch (e: any) {
            console.log('in screen', e)
            setRespondRequestError(
                e.message ?? 'Unable to respond to this request',
            )
        }
    }

    const deleteRequest = async (requestId: string) => {
        try {
            setDeleteRequestError('')
            setDeleteRequestId(requestId)
            const request = await RequestData.deleteTeamRequest(requestId)
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
        title: {
            textAlign: 'center',
        },
        error: {
            color: colors.error,
            fontSize: size.fontLarge,
        },
        toggleRosterButton: {
            alignSelf: 'center',
        },
        container: {
            alignSelf: 'center',
            width: '75%',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refresh}
                        onRefresh={async () => {
                            setRefresh(true)
                            await initializeScreen()
                            setRefresh(false)
                        }}
                    />
                }
                testID="mtd-flat-list">
                <ScreenTitle
                    title={`${team?.name} Requests`}
                    style={styles.title}
                />
                {error.length > 0 && <Text style={styles.error}>{error}</Text>}
                <PrimaryButton
                    style={styles.toggleRosterButton}
                    text={`${team?.rosterOpen ? 'Close' : 'Open'} Roster`}
                    loading={openLoading}
                    onPress={async () => {
                        dispatch(
                            toggleRosterStatus({
                                id: team?._id || '',
                                open: !team?.rosterOpen,
                            }),
                        )
                    }}
                />
                <View style={styles.container}>
                    <MapSection
                        title="Request From Players"
                        listData={requests.filter(
                            item => item.requestSource !== 'team',
                        )}
                        renderItem={item => {
                            return (
                                <UserListItem
                                    key={item._id}
                                    user={
                                        item.userDetails || {
                                            firstName: 'User no',
                                            lastName: 'longer exists',
                                            username: 'deleteme',
                                        }
                                    }
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
                                    user={
                                        item.userDetails || {
                                            firstName: 'User no',
                                            lastName: 'longer exists',
                                            username: 'deleteme',
                                        }
                                    }
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
                        showCreateButton={true}
                        onCreatePress={() => {
                            navigation.navigate('RequestUser', {
                                type: RequestType.PLAYER,
                            })
                        }}
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

export default TeamRequestsScreen
