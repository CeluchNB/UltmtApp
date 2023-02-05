import * as React from 'react'
import * as TeamData from '../services/data/team'
import BaseScreen from '../components/atoms/BaseScreen'
import MapSection from '../components/molecules/MapSection'
import { PublicTeamDetailsProps } from '../types/navigation'
import { Team } from '../types/team'
import UserListItem from '../components/atoms/UserListItem'
import { useTheme } from '../hooks'
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

const PublicTeamScreen: React.FC<PublicTeamDetailsProps> = ({
    route,
    navigation,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const { id, archive } = route.params
    const [team, setTeam] = React.useState({} as Team)
    const [refreshing, setRefreshing] = React.useState(false)
    const [error, setError] = React.useState<string>('')

    const initializeScreen = async () => {
        const getTeam = async (): Promise<Team> => {
            if (archive) {
                return TeamData.getArchivedTeam(id)
            }
            return TeamData.getTeam(id)
        }

        setError('')
        getTeam()
            .then(teamResponse => {
                setTeam(teamResponse)
            })
            .catch(e => {
                setError(
                    e.message ??
                        'An error occurred looking for this team. Please try again',
                )
            })
    }

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await initializeScreen()
        })

        return unsubscribe
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    React.useEffect(() => {
        navigation.setOptions({ title: `${team.place} ${team.name}` })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [team])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            flex: 1,
        },
        headerContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignSelf: 'center',
            alignItems: 'center',
        },
        date: {
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
            color: colors.textPrimary,
        },
        teamname: {
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
        },
        bodyContainer: {
            width: '100%',
            alignSelf: 'center',
        },
        error: {
            color: colors.gray,
            fontSize: size.fontThirty,
            fontWeight: weight.bold,
            textAlign: 'center',
        },
    })

    return (
        <BaseScreen containerWidth="90%">
            <ScrollView
                testID="public-team-scroll-view"
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        colors={[colors.textSecondary]}
                        onRefresh={async () => {
                            setRefreshing(true)
                            await initializeScreen()
                            setRefreshing(false)
                        }}
                    />
                }>
                <View style={styles.headerContainer}>
                    <Text style={styles.teamname}>@{team?.teamname}</Text>
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
                </View>
                <View style={styles.bodyContainer}>
                    {error.length > 0 ? (
                        <Text style={styles.error}>{error}</Text>
                    ) : (
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
                                        onPress={async () => {
                                            navigation.navigate(
                                                'PublicUserDetails',
                                                { userId: user._id },
                                            )
                                        }}
                                    />
                                )
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </BaseScreen>
    )
}

export default PublicTeamScreen
