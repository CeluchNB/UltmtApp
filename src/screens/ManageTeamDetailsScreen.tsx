import * as React from 'react'
import * as RequestData from '../services/data/request'
import { DetailedRequest } from '../types/request'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import { TeamDetailsProps } from '../types/navigation'
import UserListItem from '../components/atoms/UserListItem'
import store from '../store/store'
import { useColors } from '../hooks'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
    getManagedTeam,
    removePlayer,
    selectTeam,
    selectTeamLoading,
    toggleRosterStatus,
} from '../store/reducers/features/team/managedTeamReducer'
import {
    selectAccount,
    selectToken,
} from '../store/reducers/features/account/accountReducer'
import { size, weight } from '../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    navigation,
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    // const [team, setTeam] = React.useState({} as Team)
    // const [teamLoading, setTeamLoading] = React.useState(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [requestsLoading, setRequestsLoading] = React.useState(false)
    const [openLoading, setOpenLoading] = React.useState(false)
    const dispatch = useDispatch()
    const account = useSelector(selectAccount)
    const token = useSelector(selectToken)
    const team = useSelector(selectTeam)
    const teamLoading = useSelector(selectTeamLoading)

    const unsubscribe = store.subscribe(async () => {
        try {
            console.log('trying to init requests')
            setRequestsLoading(true)
            if (!team) {
                console.log('no team')
                throw new Error()
            }
            const reqs = await Promise.all(
                team.requests.map((req: string) => {
                    return RequestData.getRequest(account.token, req)
                }),
            )
            console.log('team', team)
            console.log('reqs', reqs)
            setRequests(reqs)
        } catch (error) {
            // HANDLE ERROR
            // Use Error Boundaries
        } finally {
            setRequestsLoading(false)
        }
    })

    React.useEffect(() => {
        console.log('dispatching get managed team')
        dispatch(getManagedTeam({ token, id }))
        return () => {
            console.log('calling unsubscribe')
            unsubscribe()
        }
    }, [dispatch, unsubscribe, token, id])

    const onToggleRosterStatus = async (open: boolean) => {
        try {
            setOpenLoading(true)
            dispatch(toggleRosterStatus({ token, id, open }))
        } catch (error) {
            // HANDLE ERROR
        } finally {
            setOpenLoading(false)
        }
    }

    const rolloverSeason = async () => {
        // navigate to rollover screen
        navigation.navigate('RolloverTeam', { id })
    }

    const respondToRequest = async (requestId: string, accept: boolean) => {
        try {
            await RequestData.respondToPlayerRequest(
                account.token,
                requestId,
                accept,
            )
            setRequests(requests.filter(r => r._id !== requestId))

            if (accept) {
                dispatch(getManagedTeam({ token, id }))
            }
        } catch (error) {
            // HANDLE ERROR
        }
    }

    const onRemovePlayer = async (userId: string) => {
        dispatch(removePlayer({ token, id, userId }))
    }

    const deleteRequest = async (requestId: string) => {
        try {
            const request = await RequestData.deleteTeamRequest(
                account.token,
                requestId,
            )
            // ONLY FILTERING LOCALLY, SHOULD I RE-CALL 'getTeam'?
            setRequests(requests.filter(r => r._id !== request._id))
        } catch (e) {
            // HANDLE ERROR
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
    })

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.headerContainer}>
                <ScreenTitle title={`${place} ${name}`} style={styles.title} />
                {team?.seasonStart === team?.seasonEnd ? (
                    <Text style={styles.date}>
                        {new Date(team?.seasonStart || '').getUTCFullYear()}
                    </Text>
                ) : (
                    <Text style={styles.date}>
                        {new Date(team?.seasonStart || '').getUTCFullYear() +
                            ' - ' +
                            new Date(team?.seasonEnd || '').getUTCFullYear()}
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
                    title="Players"
                    listData={team?.players || []}
                    renderItem={item => (
                        <UserListItem
                            key={item._id}
                            user={item}
                            showDelete={true}
                            showAccept={false}
                            onDelete={() => onRemovePlayer(item._id)}
                        />
                    )}
                    loading={teamLoading}
                    showButton={true}
                    showCreateButton={false}
                    buttonText="Add Players"
                    onButtonPress={() => {
                        navigation.navigate('RequestUser', { id })
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
                            />
                        )
                    }}
                    loading={requestsLoading}
                    showButton={false}
                    showCreateButton={false}
                    buttonText=""
                    onButtonPress={() => {}}
                    error={
                        requests.filter(item => item.requestSource !== 'team')
                            .length <= 0
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
                            />
                        )
                    }}
                    loading={requestsLoading}
                    showButton={false}
                    showCreateButton={false}
                    buttonText=""
                    onButtonPress={() => {}}
                    error={
                        requests.filter(item => item.requestSource !== 'player')
                            .length <= 0
                            ? 'No open requests to players'
                            : undefined
                    }
                />
            </View>
        </ScrollView>
    )
}

export default ManageTeamDetailsScreen
