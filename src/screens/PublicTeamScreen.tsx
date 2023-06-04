import * as React from 'react'
import * as TeamData from '../services/data/team'
import BaseScreen from '../components/atoms/BaseScreen'
import { PublicTeamDetailsProps } from '../types/navigation'
import PublicTeamPlayersScene from '../components/organisms/PublicTeamPlayersScene'
import { Team } from '../types/team'
import { useTheme } from '../hooks'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'

const renderScene = (
    team: Team,
    error: string,
    onRefresh: () => Promise<void>,
) => {
    return ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'players':
                return (
                    <PublicTeamPlayersScene
                        team={team}
                        error={error}
                        onRefresh={onRefresh}
                    />
                )
            case 'stats':
                return <View />
        }
    }
}

const PublicTeamScreen: React.FC<PublicTeamDetailsProps> = ({
    route,
    navigation,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const layout = useWindowDimensions()

    const mapTabNameToIndex = (name: 'players' | 'stats'): number => {
        switch (name) {
            case 'players':
                return 0
            case 'stats':
                return 1
        }
    }

    const { id, archive } = route.params
    const [team, setTeam] = React.useState({} as Team)
    const [error, setError] = React.useState<string>('')
    const [index, setIndex] = React.useState(mapTabNameToIndex('players'))
    const [routes] = React.useState([
        { key: 'players', title: 'Players' },
        { key: 'stats', title: 'Stats' },
    ])

    const initializeScreen = React.useCallback(async () => {
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
    }, [archive, id])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await initializeScreen()
        })

        return unsubscribe
    }, [initializeScreen, navigation])

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
            <View style={styles.headerContainer}>
                <Text style={styles.teamname}>@{team?.teamname}</Text>
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
            </View>
            <SafeAreaView
                style={{
                    // TODO: check this height on multiple devices
                    height: layout.height - 225,
                }}>
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene(team, error, initializeScreen)}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    renderTabBar={props => {
                        return (
                            <TabBar
                                {...props}
                                style={{ backgroundColor: colors.primary }}
                                indicatorStyle={{
                                    backgroundColor: colors.textPrimary,
                                }}
                                activeColor={colors.textPrimary}
                                inactiveColor={colors.darkGray}
                            />
                        )
                    }}
                />
            </SafeAreaView>
        </BaseScreen>
    )
}

export default PublicTeamScreen
