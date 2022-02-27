import * as React from 'react'
import * as TeamData from '../services/data/team'
import MapSection from '../components/molecules/MapSection'
import { PublicTeamDetailsProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { Team } from '../types/team'
import UserListItem from '../components/atoms/UserListItem'
import { useColors } from '../hooks'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'
import { size, weight } from '../theme/fonts'

const PublicTeamScreen: React.FC<PublicTeamDetailsProps> = ({ route }) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const [team, setTeam] = React.useState({} as Team)

    React.useEffect(() => {
        TeamData.getTeam(id)
            .then(teamResponse => setTeam(teamResponse))
            .catch(e => {
                console.log('error', e)
            })
    }, [id])

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
    })

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView>
                <View style={styles.headerContainer}>
                    <ScreenTitle
                        title={`${place} ${name}`}
                        style={styles.title}
                    />
                    {team?.seasonStart === team?.seasonEnd ? (
                        <Text style={styles.date}>
                            {new Date(team?.seasonStart || '').getUTCFullYear()}
                        </Text>
                    ) : (
                        <Text style={styles.date}>
                            {new Date(
                                team?.seasonStart || '',
                            ).getUTCFullYear() +
                                ' - ' +
                                new Date(
                                    team?.seasonEnd || '',
                                ).getUTCFullYear()}
                        </Text>
                    )}
                    <Text style={styles.teamname}>@{team?.teamname}</Text>
                </View>
                <MapSection
                    title="Players"
                    listData={team.players}
                    showButton={false}
                    showCreateButton={false}
                    renderItem={user => {
                        return (
                            <UserListItem
                                key={user._id}
                                user={user}
                                showDelete={false}
                                showAccept={false}
                            />
                        )
                    }}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default PublicTeamScreen
