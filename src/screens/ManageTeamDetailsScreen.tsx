import * as React from 'react'
import * as RequestServices from '../store/services/request'
import * as TeamServices from '../store/services/team'
import { DetailedRequest } from '../types/request'
import MapSection from '../components/molecules/MapSection'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import { Team } from '../types/team'
import { TeamDetailsProps } from '../types/navigation'
import UserListItem from '../components/atoms/UserListItem'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { size } from '../theme/fonts'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

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
                const values = await Promise.all(
                    teamDetails.requests.map((req: string) => {
                        return RequestServices.getRequest(account.token, req)
                    }),
                )
                const reqs = values.map((v: { data?: { request: any } }) => {
                    return v.data?.request
                })
                setRequests(reqs)
            } catch (error) {
                // Use Error Boundaries
            } finally {
                setRequestsLoading(false)
            }
        },
        [account],
    )

    React.useEffect(() => {
        setTeamLoading(true)
        const teamResponse = TeamServices.getManagedTeam(account.token, id)
        teamResponse
            .then(response => {
                setRequestsLoading(false)
                const { team: managedTeam } = response.data
                if (managedTeam) {
                    setTeamLoading(false)
                    setTeam(managedTeam)
                    getRequestDetails(managedTeam)
                } else {
                    // HANDLE ERROR
                }
            })
            .catch(_error => {
                setRequestsLoading(false)
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
        setOpenLoading(true)
        const teamResult = await TeamServices.toggleRosterStatus(
            account.token,
            team._id,
            open,
        )

        if (teamResult.data) {
            setTeam(teamResult.data.team)
            setOpenLoading(false)
        } else {
            // HANDLE ERROR
            console.log('error', teamResult)
        }
    }

    const rolloverSeason = async () => {
        console.log('rolling over season')
    }

    const respondToRequest = async (requestId: string, accept: boolean) => {
        const requestResponse = await RequestServices.respondToPlayerRequest(
            account.token,
            requestId,
            accept,
        )

        if (requestResponse.data) {
            setRequests(requests.filter(r => r._id !== requestId))
        } else {
            // HANDLE ERROR
        }

        if (accept) {
            const teamResponse = await TeamServices.getManagedTeam(
                account.token,
                id,
            )

            const { team: managedTeam } = teamResponse.data
            if (managedTeam) {
                setTeam(managedTeam)
            } else {
                // HANDLE ERROR
            }
        }
    }

    const removePlayer = async (userId: string) => {
        try {
            const response = await TeamServices.removePlayer(
                account.token,
                team._id,
                userId,
            )
            if (response.data) {
                const { team: responseTeam } = response.data
                setTeam(responseTeam)
            } else {
                console.log(response.error)
                // HANDLE ERROR
            }
        } catch (e) {
            console.log(e)
            // HANLDE ERROR
        }
    }
    return (
        <ScrollView style={styles.screen}>
            <View style={styles.headerContainer}>
                <ScreenTitle title={`${place} ${name}`} style={styles.title} />
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
