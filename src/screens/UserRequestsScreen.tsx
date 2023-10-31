import * as React from 'react'
import * as RequestData from '../services/data/request'
import { ApiError } from '../types/services'
import { AppDispatch } from '../store/store'
import { DetailedRequest } from '../types/request'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import TeamListItem from '../components/atoms/TeamListItem'
import { UserRequestProps } from '../types/navigation'
import { useTheme } from '../hooks'
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
    setOpenToRequests,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQuery } from 'react-query'

const UserRequestsScreen: React.FC<UserRequestProps> = ({ navigation }) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch<AppDispatch>()
    const toggleLoading = useSelector(selectToggleLoading)
    const openToRequests = useSelector(selectOpenToRequests)
    const error = useSelector(selectError)

    const [respondRequestId, setRespondRequestId] = React.useState('')
    const [deleteRequestId, setDeleteRequestId] = React.useState('')

    const {
        data: requestData,
        isLoading,
        error: fetchError,
        refetch,
    } = useQuery<DetailedRequest[], ApiError>(['getRequestsByUser'], () =>
        RequestData.getRequestsByUser(),
    )

    const { error: deleteRequestError, mutate: callDelete } = useMutation(
        (requestId: string) => RequestData.deleteUserRequest(requestId),
    )

    const { error: respondRequestError, mutate: callRespond } = useMutation(
        ({ requestId, accept }: { requestId: string; accept: boolean }) =>
            RequestData.respondToTeamRequest(requestId, accept),
    )

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!isLoading) {
                refetch()
            }
        })
        return () => {
            unsubscribe()
        }
    }, [navigation, isLoading, refetch])

    // Strictly through redux?
    const respondToRequest = async (requestId: string, accept: boolean) => {
        setRespondRequestId(requestId)
        callRespond(
            { requestId, accept },
            {
                onSettled() {
                    dispatch(removeRequest(requestId))
                    refetch()
                },
            },
        )
    }

    // Strictly through redux?
    const deleteRequest = async (requestId: string) => {
        setDeleteRequestId(requestId)
        callDelete(requestId, {
            onSettled() {
                dispatch(removeRequest(requestId))
                refetch()
            },
        })
    }

    const toggleRosterOpen = () => {
        dispatch(setOpenToRequests({ open: !openToRequests }))
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
            fontSize: size.fontThirty,
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

    if (fetchError) {
        return (
            <SafeAreaView style={styles.screen}>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            colors={[colors.textSecondary]}
                            tintColor={colors.textSecondary}
                            refreshing={isLoading}
                            onRefresh={async () => {
                                refetch()
                            }}
                        />
                    }
                    testID="mt-scroll-view">
                    <Text style={styles.error}>{fetchError.message}</Text>
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
                        tintColor={colors.textSecondary}
                        onRefresh={async () => {
                            refetch()
                        }}
                        refreshing={isLoading}
                    />
                }
                testID="mt-scroll-view">
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
                        listData={
                            requestData?.filter(
                                req => req.requestSource === 'team',
                            ) || []
                        }
                        error={
                            requestData?.filter(
                                req => req.requestSource === 'team',
                            ).length === 0
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
                                        respondRequestError &&
                                        respondRequestId === item._id
                                            ? (respondRequestError as ApiError)
                                                  .message
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
                        listData={
                            requestData?.filter(
                                req => req.requestSource === 'player',
                            ) || []
                        }
                        error={
                            requestData?.filter(
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
                                        deleteRequestError &&
                                        deleteRequestId === item._id
                                            ? (deleteRequestError as ApiError)
                                                  .message
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
