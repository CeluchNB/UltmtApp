import * as React from 'react'
import * as RequestServices from '../services/network/request'
import { DetailedRequest } from '../types/request'
import { DisplayTeam } from '../types/team'
import MapSection from '../components/molecules/MapSection'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import TeamListItem from '../components/atoms/TeamListItem'
import { useColors } from '../hooks/index'
import { FlatList, StyleSheet, View } from 'react-native'
import {
    fetchProfile,
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
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    let isMounted = React.useRef(false)

    const getRequests = React.useCallback(async () => {
        const values = await Promise.all(
            requestIds.map(req => {
                return RequestServices.getRequest(token, req)
            }),
        )
        const reqs = values.map(
            (v: { data?: { request: DetailedRequest } }) => {
                return v.data?.request
            },
        )

        if (isMounted.current) {
            setRequests(
                reqs.filter(req => req !== undefined) as DetailedRequest[],
            )
        }
    }, [requestIds, token, isMounted])

    React.useEffect(() => {
        isMounted.current = true
        getRequests()
        return () => {
            isMounted.current = false
        }
    }, [getRequests, token])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            alignSelf: 'center',
        },
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
            flex: 1,
        },
    })

    const openTeamDetails = async (item: DisplayTeam) => {
        navigation.navigate('TeamDetails', {
            id: item._id,
            place: item.place,
            name: item.name,
        })
    }

    const respondToRequest = async (requestId: string, accept: boolean) => {
        const response = await RequestServices.respondToTeamRequest(
            token,
            requestId,
            accept,
        )

        if (response.data) {
            if (accept) {
                dispatch(fetchProfile(token))
            } else {
                setRequests(requests.filter(req => req._id !== requestId))
            }
        } else {
            // HANDLE ERROR
        }
    }

    const deleteRequest = async (requestId: string) => {
        const response = await RequestServices.deleteUserRequest(
            token,
            requestId,
        )

        if (response.data) {
            setRequests(requests.filter(req => req._id !== requestId))
        } else {
            // HANDLE ERROR
        }
    }

    return (
        <View style={styles.screen}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                ListHeaderComponent={
                    <ScreenTitle style={styles.title} title="Manage Teams" />
                }
                ListFooterComponent={
                    <View style={styles.sectionContainer}>
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
                            renderItem={item => {
                                return (
                                    <TeamListItem key={item._id} team={item} />
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
                            renderItem={item => {
                                return (
                                    <TeamListItem
                                        key={item._id}
                                        team={item}
                                        onPress={() => openTeamDetails(item)}
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
                                            await respondToRequest(
                                                item._id,
                                                true,
                                            )
                                        }}
                                        onDelete={async () => {
                                            await respondToRequest(
                                                item._id,
                                                false,
                                            )
                                        }}
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
                                    />
                                )
                            }}
                        />
                    </View>
                }
            />
        </View>
    )
}

export default ManageTeams
