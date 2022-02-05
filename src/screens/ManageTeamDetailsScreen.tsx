import * as React from 'react'
import * as RequestServices from '../store/services/request'
import * as TeamServices from '../store/services/team'
import { DetailedRequest } from '../types/request'
import { DisplayUser } from '../types/user'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import Section from '../components/molecules/Section'
import { Team } from '../types/team'
import { TeamDetailsProps } from '../types/navigation'
import UserListItem from '../components/atoms/UserListItem'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { size } from '../theme/fonts'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { FlatList, StyleSheet, Text, View } from 'react-native'

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    navigation,
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const [team, setTeam] = React.useState({} as Team)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
    const [openLoading, setOpenLoading] = React.useState(false)
    const account = useSelector(selectAccount)

    const getRequestDetails = React.useCallback(
        async (teamDetails: Team) => {
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
            }
        },
        [account],
    )

    React.useEffect(() => {
        const teamResponse = TeamServices.getManagedTeam(account.token, id)
        teamResponse.then(response => {
            const { team: managedTeam } = response.data
            if (managedTeam) {
                setTeam(managedTeam)
                getRequestDetails(managedTeam)
            } else {
                // HANDLE ERROR
            }
        })
    }, [id, account, getRequestDetails])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            alignItems: 'center',
            flex: 1,
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
        list: {
            width: '75%',
        },
        playerList: {
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

    return (
        <View style={styles.screen}>
            <FlatList
                style={styles.list}
                showsVerticalScrollIndicator={false}
                data={[]}
                renderItem={() => {
                    return <View />
                }}
                ListHeaderComponent={
                    <View>
                        <ScreenTitle
                            title={`${place} ${name}`}
                            style={styles.title}
                        />
                        <Text style={styles.teamname}>@{team.teamname}</Text>
                        <PrimaryButton
                            text={`${
                                team.rosterOpen ? 'Close' : 'Open'
                            } Roster`}
                            loading={openLoading}
                            onPress={() => toggleRosterStatus(!team.rosterOpen)}
                        />
                        <SecondaryButton
                            text="Start New Season"
                            onPress={rolloverSeason}
                        />
                    </View>
                }
                ListFooterComponent={
                    <View>
                        <Section
                            title="Players"
                            listData={team.players}
                            renderItem={({ item }: { item: DisplayUser }) => (
                                <UserListItem
                                    user={item}
                                    showDelete={true}
                                    showAccept={false}
                                />
                            )}
                            showButton={true}
                            buttonText="Add Players"
                            onButtonPress={() => {
                                navigation.navigate('RequestUser', { id })
                            }}
                        />
                        <Section
                            title="Player Requests"
                            listData={requests.filter(
                                item => item.requestSource !== 'team',
                            )}
                            renderItem={({
                                item,
                            }: {
                                item: DetailedRequest
                            }) => {
                                return (
                                    <UserListItem
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
                            showButton={false}
                            buttonText=""
                            onButtonPress={() => {}}
                        />
                        <Section
                            title="Team Requests"
                            listData={requests.filter(
                                item => item.requestSource !== 'player',
                            )}
                            renderItem={({
                                item,
                            }: {
                                item: DetailedRequest
                            }) => {
                                return (
                                    <UserListItem
                                        user={item.userDetails}
                                        showDelete={true}
                                        showAccept={false}
                                    />
                                )
                            }}
                            showButton={false}
                            buttonText=""
                            onButtonPress={() => {}}
                        />
                    </View>
                }
            />
        </View>
    )
}

export default ManageTeamDetailsScreen
