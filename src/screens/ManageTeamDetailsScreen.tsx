import * as React from 'react'
import * as TeamServices from '../store/services/team'
import { DisplayUser } from '../types/user'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import Section from '../components/molecules/Section'
import { Team } from '../types/team'
import { TeamDetailsProps } from '../types/navigation'
import UserListItem from '../components/atoms/UserListItem'
import { useColors } from '../hooks'
import { StyleSheet, View } from 'react-native'

const ManageTeamDetailsScreen: React.FC<TeamDetailsProps> = ({
    route,
}: TeamDetailsProps) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const [team, setTeam] = React.useState({} as Team)

    React.useEffect(() => {
        const teamResponse = TeamServices.getTeam(id)
        teamResponse.then(response => {
            setTeam(response.data?.team)
        })
    }, [id])

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
                        <UserListItem user={item} />
                    )}
                    showButton={true}
                    buttonText="Add Players"
                    onButtonPress={() => {}}
                />
            </View>
        </View>
    )
}

export default ManageTeamDetailsScreen
