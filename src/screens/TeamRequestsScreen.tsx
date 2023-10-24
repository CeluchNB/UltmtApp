import { ApiError } from '../types/services'
import { AppDispatch } from '../store/store'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import React from 'react'
import { TeamRequestProps } from '../types/navigation'
import UserListItem from '../components/atoms/UserListItem'
import { useTheme } from '../hooks'
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
    deleteTeamRequest,
    getRequestsByTeam,
    respondToPlayerRequest,
} from '../services/data/request'
import {
    getManagedTeam,
    selectOpenLoading,
    selectTeam,
    toggleRosterStatus,
} from '../store/reducers/features/team/managedTeamReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery } from 'react-query'

const TeamRequestsScreen: React.FC<TeamRequestProps> = ({ navigation }) => {
    const dispatch = useDispatch<AppDispatch>()
    const {
        theme: { colors, size },
    } = useTheme()

    const team = useSelector(selectTeam)
    const openLoading = useSelector(selectOpenLoading)

    const [deleteRequestId, setDeleteRequestId] = React.useState('')
    const [respondRequestId, setResponseRequestId] = React.useState('')

    const {
        data: requests,
        isLoading: requestsLoading,
        refetch,
        error,
    } = useQuery<DetailedRequest[], ApiError>(
        ['getRequestsByTeam', { teamId: team?._id }],
        () => getRequestsByTeam(team?._id || ''),
        {
            enabled: !!team,
        },
    )

    const { mutate: callDelete, error: deleteRequestError } = useMutation(
        (requestId: string) => deleteTeamRequest(requestId),
    )

    const { mutate: callRespond, error: respondRequestError } = useMutation(
        ({ requestId, accept }: { requestId: string; accept: boolean }) =>
            respondToPlayerRequest(requestId, accept),
    )

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
        callRespond(
            { requestId, accept },
            {
                onSettled() {
                    refetch()
                    if (accept) {
                        dispatch(getManagedTeam({ id: team?._id || '' }))
                    }
                },
            },
        )
    }

    const deleteRequest = async (requestId: string) => {
        setDeleteRequestId(requestId)
        callDelete(requestId, {
            onSettled() {
                refetch()
            },
        })
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
            fontSize: size.fontThirty,
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
                        colors={[colors.textSecondary]}
                        tintColor={colors.textSecondary}
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
                                            ? (respondRequestError as ApiError)
                                                  .message
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
                                            ? (deleteRequestError as ApiError)
                                                  .message
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
