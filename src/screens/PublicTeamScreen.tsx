import * as TeamData from '../services/data/team'
import BaseScreen from '../components/atoms/BaseScreen'
import { Game } from '../types/game'
import { PublicTeamAllYearsScene } from '../components/organisms/PublicTeamAllYearsScene'
import { PublicTeamDetailsProps } from '../types/navigation'
import PublicTeamPlayersScene from '../components/organisms/PublicTeamPlayersScene'
import PublicTeamStatsScene from '../components/organisms/PublicTeamStatsScene'
import React from 'react'
import { Team } from '../types/team'
import TeamGameScene from '../components/organisms/TeamGameScene'
import { getGamesByTeam } from '../services/data/game'
import { useTheme } from '../hooks'
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import { UseQueryResult, useQuery } from 'react-query'

const renderScene = (
    team: Team,
    error: string,
    loading: boolean,
    teamId: string,
    gamesQuery: UseQueryResult<Game[]>,
    onRefresh: () => Promise<void>,
) => {
    return ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'players':
                return (
                    <PublicTeamPlayersScene
                        team={team}
                        error={error}
                        refreshing={loading}
                        onRefresh={onRefresh}
                    />
                )
            case 'games':
                return (
                    <TeamGameScene teamId={teamId} queryResult={gamesQuery} />
                )
            case 'stats':
                return (
                    <PublicTeamStatsScene
                        teamId={teamId}
                        games={gamesQuery.data || []}
                        managers={team.managers}
                    />
                )
            case 'years':
                return (
                    <PublicTeamAllYearsScene
                        continuationId={team.continuationId}
                    />
                )
        }
    }
}

const PublicTeamScreen: React.FC<PublicTeamDetailsProps> = ({
    route,
    navigation,
}) => {
    const { id, archive } = route.params
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const layout = useWindowDimensions()

    const gamesQuery = useQuery(['getGamesByTeam', { teamId: id }], () =>
        getGamesByTeam(id),
    )

    const mapTabNameToIndex = (
        name: 'players' | 'stats' | 'games' | 'years',
    ): number => {
        switch (name) {
            case 'players':
                return 0
            case 'games':
                return 1
            case 'stats':
                return 2
            case 'years':
                return 3
        }
    }

    const [team, setTeam] = React.useState({} as Team)
    const [error, setError] = React.useState<string>('')
    const [index, setIndex] = React.useState(mapTabNameToIndex('players'))
    const [loading, setLoading] = React.useState(false)
    const [routes] = React.useState([
        { key: 'players', title: 'Players' },
        { key: 'games', title: 'Games' },
        { key: 'stats', title: 'Stats' },
        { key: 'years', title: 'Years' },
    ])

    const initializeScreen = React.useCallback(async () => {
        const getTeam = async (): Promise<Team> => {
            if (archive) {
                return TeamData.getArchivedTeam(id)
            }
            return TeamData.getTeam(id)
        }

        setError('')
        setLoading(true)
        try {
            const teamResponse = await getTeam()
            setTeam(teamResponse)
        } catch (e: any) {
            setError(
                e?.message ??
                    'An error occurred looking for this team. Please try again',
            )
        } finally {
            setLoading(false)
        }
    }, [archive, id])

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            await initializeScreen()
        })

        return unsubscribe
    }, [initializeScreen, navigation])

    React.useEffect(() => {
        navigation.setOptions({
            title: team.name ? `${team.place} ${team.name}` : 'Team',
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [team])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
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
        <BaseScreen containerWidth={95}>
            <View style={styles.screen}>
                <View style={styles.headerContainer}>
                    <Text style={styles.teamname}>
                        @{team?.teamname ?? 'team'}
                    </Text>
                    {team?.seasonStart === team?.seasonEnd ? (
                        <Text style={styles.date}>
                            {new Date(
                                team?.seasonStart || new Date(),
                            ).getUTCFullYear()}
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
                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene(
                        team,
                        error,
                        loading,
                        id,
                        gamesQuery,
                        initializeScreen,
                    )}
                    swipeEnabled={false}
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
            </View>
        </BaseScreen>
    )
}

export default PublicTeamScreen
