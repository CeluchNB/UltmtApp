import * as React from 'react'
import * as RequestData from '../services/data/request'
import { AppDispatch } from '../store/store'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { TeamRequestProps } from '../types/navigation'
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
import { useData, useLazyData } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'

const TeamRequestsScreen: React.FC<TeamRequestProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>()
    const { colors } = useColors()

    const team = useSelector(selectTeam)
    const openLoading = useSelector(selectOpenLoading)

    const [deleteRequestId, setDeleteRequestId] = React.useState('')
    const [respondRequestId, setResponseRequestId] = React.useState('')

    const {
        data: requests,
        loading: requestsLoading,
        refetch,
        error,
    } = useData<DetailedRequest[]>(RequestData.getRequestsByTeam, team?._id)

    const { fetch: callDelete, error: deleteRequestError } =
        useLazyData<DetailedRequest>(RequestData.deleteTeamRequest)

    const { fetch: callRespond, error: respondRequestError } =
        useLazyData<DetailedRequest>(RequestData.respondToPlayerRequest)

    React.useEffect(() => {
        navigation.setOptions({
            title: `${team?.name} Requests`,
        })
        const unsubscribe = navigation.addListener('focus', () => {
            if (!requestsLoading) {
                refetch()
            }
        })
        return () => {
            unsubscribe()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const respondToRequest = async (requestId: string, accept: boolean) => {
        setResponseRequestId(requestId)
        await callRespond(requestId, accept)
        refetch()
        if (accept) {
            dispatch(getManagedTeam({ id: team?._id || '' }))
        }
    }

    const deleteRequest = async (requestId: string) => {
        setDeleteRequestId(requestId)
        await callDelete(requestId)
        refetch()
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
                        refreshing={requestsLoading}
                        onRefresh={() => {
                            refetch()
                        }}
                    />
                }
                testID="mtd-flat-list">
                {error && <Text style={styles.error}>{error.message}</Text>}
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
                        listData={requests?.filter(
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
                                        respondRequestError &&
                                        item._id === respondRequestId
                                            ? respondRequestError.message
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
                            requests &&
                            requests.filter(
                                item => item.requestSource !== 'team',
                            ).length <= 0
                                ? 'No open requests from players'
                                : undefined
                        }
                    />
                    <MapSection
                        title="Requests To Players"
                        listData={requests?.filter(
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
                                        deleteRequestError
                                            ? deleteRequestError.message
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
                            requests &&
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
