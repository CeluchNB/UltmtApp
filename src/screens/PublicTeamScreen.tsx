import * as React from 'react'
import * as TeamData from '../services/data/team'
import MapSection from '../components/molecules/MapSection'
import { PublicTeamDetailsProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { Team } from '../types/team'
import UserListItem from '../components/atoms/UserListItem'
import { useColors } from '../hooks'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { size, weight } from '../theme/fonts'

const PublicTeamScreen: React.FC<PublicTeamDetailsProps> = ({
    route,
    navigation,
}) => {
    const { colors } = useColors()
    const { id, place, name } = route.params
    const [team, setTeam] = React.useState({} as Team)
    const [refreshing, setRefreshing] = React.useState(false)
    const [error, setError] = React.useState<string>('')

    const initializeScreen = React.useCallback(async () => {
        setError('')
        TeamData.getTeam(id)
            .then(teamResponse => {
                setTeam(teamResponse)
            })
            .catch(e => {
                setError(
                    e.message ??
                        'An error occurred looking for this team. Please try again',
                )
            })
    }, [id])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await initializeScreen()
        })
        return unsubscribe
    }, [navigation, initializeScreen])

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
        bodyContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            color: colors.gray,
            fontSize: size.fontLarge,
            fontWeight: weight.bold,
            textAlign: 'center',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
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
                                                { user },
                                            )
                                        }}
                                    />
                                )
                            }}
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default PublicTeamScreen
