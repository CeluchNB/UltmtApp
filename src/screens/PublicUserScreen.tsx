import * as React from 'react'
import * as StatsData from './../services/data/stats'
import * as UserData from './../services/data/user'
import { PlayerStats } from '../types/stats'
import { PublicUserDetailsProps } from '../types/navigation'
import { User } from '../types/user'
import PublicUserStatsScene, {
    PublicUserStatsSceneProps,
} from '../components/organisms/PublicUserStatsScene'
import PublicUserTeamScene, {
    PublicUserTeamSceneProps,
} from '../components/organisms/PublicUserTeamScene'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { TabBar, TabView } from 'react-native-tab-view'
import { useData, useTheme } from './../hooks'

const renderScene = (
    teamProps: PublicUserTeamSceneProps,
    statsProps: PublicUserStatsSceneProps,
) => {
    return ({ route }: { route: { key: string } }) => {
        switch (route.key) {
            case 'teams':
                return (
                    <View style={{ marginTop: 10 }}>
                        <PublicUserTeamScene {...teamProps} />
                    </View>
                )
            case 'stats':
                return (
                    <View style={{ marginTop: 10 }}>
                        <PublicUserStatsScene {...statsProps} />
                    </View>
                )
            default:
                return null
        }
    }
}

const PublicUserScreen: React.FC<PublicUserDetailsProps> = ({
    route,
    navigation,
}) => {
    const layout = useWindowDimensions()

    const { userId, tab = 'games' } = route.params
    const {
        theme: { colors, size },
    } = useTheme()

    const [index, setIndex] = React.useState(tab === 'games' ? 0 : 1)
    const [routes] = React.useState([
        { key: 'teams', title: 'Teams' },
        { key: 'stats', title: 'Stats' },
    ])

    const {
        data: user,
        loading,
        error,
        refetch,
    } = useData<User>(UserData.getPublicUser, userId)

    const {
        data: stats,
        loading: statsLoading,
        error: statsError,
        refetch: statsRefetch,
    } = useData<PlayerStats>(StatsData.getPlayerStats, userId)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (!loading && !user) {
                refetch()
            }
        })

        return unsubscribe
    }, [navigation, loading, user, refetch])

    React.useEffect(() => {
        navigation.setOptions({
            title: `${user?.firstName} ${user?.lastName}`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        titleText: {
            color: colors.textPrimary,
            fontSize: size.fontTwenty,
            alignSelf: 'center',
        },
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontThirty,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <Text style={styles.titleText}>@{user?.username}</Text>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene(
                    { loading, refetch, user, error },
                    {
                        loading: statsLoading,
                        refetch: statsRefetch,
                        stats,
                        error: statsError,
                    },
                )}
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
    )
}

export default PublicUserScreen
