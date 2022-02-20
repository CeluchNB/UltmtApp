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
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../theme/fonts'

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    navigation,
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const [team, setTeam] = React.useState({} as Team)
    const [teamLoading, setTeamLoading] = React.useState(false)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [requestsLoading, setRequestsLoading] = React.useState(false)
    const [openLoading, setOpenLoading] = React.useState(false)
    const account = useSelector(selectAccount)

    const getRequestDetails = React.useCallback(
        async (teamDetails: Team) => {
            setRequestsLoading(true)
            try {
                const reqs = await Promise.all(
                    teamDetails.requests.map((req: string) => {
                        return RequestData.getRequest(account.token, req)
                    }),
                )
                setRequests(reqs)
            } catch (error) {
                // HANDLE ERROR
                // Use Error Boundaries
            } finally {
                setRequestsLoading(false)
            }
        },
        [account],
    )

    // REFACTOR TO USE REDUX
    React.useEffect(() => {
        setTeamLoading(true)
        const teamResponse = TeamData.getManagedTeam(account.token, id)
        teamResponse
            .then(managedTeam => {
                setTeam(managedTeam)
                getRequestDetails(managedTeam)
            })
            .catch(_error => {
                // HANDLE ERRORS BETTER
            })
            .finally(() => {
                setTeamLoading(false)
            })
    }, [id, account, getRequestDetails])

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

    const toggleRosterStatus = async (open: boolean) => {
        try {
            setOpenLoading(true)
            const teamResult = await TeamData.toggleRosterStatus(
                account.token,
                team._id,
                open,
            )

            setTeam(teamResult)
            setOpenLoading(false)
        } catch (error) {
            // HANDLE ERROR
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
                const managedTeam = await TeamData.getManagedTeam(
                    account.token,
                    id,
                )
                setTeam(managedTeam)
            }
        } catch (error) {
            // HANDLE ERROR
        }
    }

    const removePlayer = async (userId: string) => {
        try {
            const responseTeam = await TeamData.removePlayer(
                account.token,
                team._id,
                userId,
            )
            setTeam(responseTeam)
        } catch (e) {
            // HANDLE ERROR
        }
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

    return (
        <ScrollView style={styles.screen}>
            <View style={styles.headerContainer}>
                <ScreenTitle title={`${place} ${name}`} style={styles.title} />
                {team.seasonStart === team.seasonEnd ? (
                    <Text style={styles.date}>
                        {new Date(team.seasonStart).getUTCFullYear()}
                    </Text>
                ) : (
                    <Text style={styles.date}>
                        {new Date(team.seasonStart).getUTCFullYear() +
                            ' - ' +
                            new Date(team.seasonEnd).getUTCFullYear()}
                    </Text>
                )}
                <Text style={styles.teamname}>@{team.teamname}</Text>
                <PrimaryButton
                    text={`${team.rosterOpen ? 'Close' : 'Open'} Roster`}
                    loading={openLoading}
                    onPress={() => toggleRosterStatus(!team.rosterOpen)}
                />
                <SecondaryButton
                    text="Start New Season"
                    onPress={rolloverSeason}
                />
            </View>
            <View style={styles.listContainer}>
                <MapSection
                    title="Players"
                    listData={team.players}
                    renderItem={item => (
                        <UserListItem
                            key={item._id}
                            user={item}
                            showDelete={true}
                            showAccept={false}
                            onDelete={() => removePlayer(item._id)}
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
                        team.players && team.players.length <= 0
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
