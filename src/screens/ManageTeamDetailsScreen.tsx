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
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { StyleSheet, View } from 'react-native'

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const [team, setTeam] = React.useState({} as Team)
    const [requests, setRequests] = React.useState([] as DetailedRequest[])
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
            setTeam(response.data?.team)
            getRequestDetails(response.data?.team)
        })
    }, [id, account, getRequestDetails])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            alignItems: 'center',
        },
        title: {
            textAlign: 'center',
        },
        playerList: {
            width: '75%',
            alignSelf: 'center',
        },
    })

    const toggleRosterStatus = async () => {
        console.log('toggle roster status of team:', id)
    }

    const rolloverSeason = async () => {
        console.log('rolling over season')
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle title={`${place} ${name}`} style={styles.title} />
            <PrimaryButton
                text="Open Roster"
                loading={false}
                onPress={toggleRosterStatus}
            />
            <SecondaryButton text="Start New Season" onPress={rolloverSeason} />
            <View style={styles.playerList}>
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
                    onButtonPress={() => {}}
                />
                <Section
                    title="Requests from Players"
                    listData={requests}
                    renderItem={({ item }: { item: DetailedRequest }) => {
                        return (
                            <UserListItem
                                user={item.userDetails}
                                showDelete={true}
                                showAccept={true}
                            />
                        )
                    }}
                    showButton={false}
                    buttonText=""
                    onButtonPress={() => {}}
                />
            </View>
        </View>
    )
}

export default ManageTeamDetailsScreen
