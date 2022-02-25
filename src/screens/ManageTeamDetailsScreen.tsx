import * as React from 'react'
import * as RequestData from '../services/data/request'
import * as TeamData from '../services/data/team'
import { DetailedRequest } from '../types/request'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import { Team } from '../types/team'
import { TeamDetailsProps } from '../types/navigation'
import UserListItem from '../components/atoms/UserListItem'
import { selectToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
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

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    navigation,
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const dispatch = useDispatch()
    const [requestsLoading, setRequestsLoading] = React.useState(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [error, setError] = React.useState(undefined)
    const token = useSelector(selectToken)
    const team = useSelector(selectTeam)
    const teamLoading = useSelector(selectTeamLoading)
    const openLoading = useSelector(selectOpenLoading)

    const fetchRequests = React.useCallback(
        async (teamResponse: Team): Promise<DetailedRequest[]> => {
            return Promise.all(
                teamResponse.requests.map((req: string) => {
                    return RequestData.getRequest(token, req)
                }),
            )
        },
        [token],
    )

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            dispatch(setTeamLoading(true))
            TeamData.getManagedTeam(token, id)
                .then(teamResponse => {
                    setRequestsLoading(true)
                    dispatch(setTeam(teamResponse))
                    dispatch(setTeamLoading(false))
                    return fetchRequests(teamResponse)
                })
                .then(reqs => {
                    setRequests(reqs)
                })
                .catch(e => {
                    dispatch(setTeam(undefined))
                    setError(e.message)
                })
                .finally(() => {
                    setRequestsLoading(false)
                    dispatch(setTeamLoading(false))
                })
        })
        return unsubscribe
    })

    const onToggleRosterStatus = async (open: boolean) => {
        try {
            dispatch(toggleRosterStatus({ token, id, open }))
        } catch (e) {
            // HANDLE ERROR
        }
    }

    const rolloverSeason = async () => {
        // navigate to rollover screen
        navigation.navigate('RolloverTeam', { id })
    }

    const respondToRequest = async (requestId: string, accept: boolean) => {
        try {
            await RequestData.respondToPlayerRequest(token, requestId, accept)
            setRequests(requests.filter(r => r._id !== requestId))

            if (accept) {
                dispatch(getManagedTeam({ token, id }))
            }
        } catch (e) {
            // HANDLE ERROR
        }
    }

    const onRemovePlayer = async (userId: string) => {
        dispatch(removePlayer({ token, id, userId }))
    }

    const deleteRequest = async (requestId: string) => {
        try {
            const request = await RequestData.deleteTeamRequest(
                token,
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
        error: {
            color: colors.error,
            fontSize: size.fontLarge,
        },
    })

    if (error) {
        return (
            <View style={styles.screen}>
                <View style={styles.headerContainer}>
                    <ScreenTitle
                        title={`${place} ${name}`}
                        style={styles.title}
                    />
                    <Text style={styles.error}>{error}</Text>
                </View>
            </View>
        )
    }

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
