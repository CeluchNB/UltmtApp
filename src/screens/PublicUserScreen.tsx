import * as React from 'react'
import * as UserData from './../services/data/user'
import MapSection from '../components/molecules/MapSection'
import { PublicUserDetailsProps } from '../types/navigation'
import TeamListItem from '../components/atoms/TeamListItem'
import { User } from '../types/user'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import { useData, useTheme } from './../hooks'

const PublicUserScreen: React.FC<PublicUserDetailsProps> = ({
    route,
    navigation,
}) => {
    const layout = useWindowDimensions()

    const { userId } = route.params
    const {
        theme: { colors, size },
    } = useTheme()

    const [index, setIndex] = React.useState(0)
    const [routes] = React.useState([
        { key: 'teams', title: 'Teams' },
        { key: 'games', title: 'Games' },
    ])

    const {
        data: user,
        loading,
        error,
        refetch,
    } = useData<User>(UserData.getPublicUser, userId)

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

    const renderScene = SceneMap({
        // eslint-disable-next-line react/no-unstable-nested-components
        teams: () => (
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={() => {
                            refetch()
                        }}
                    />
                }
                testID="public-user-scroll-view">
                {error ? (
                    <Text style={styles.error}>{error.message}</Text>
                ) : (
                    <View style={styles.sectionContainer}>
                        <MapSection
                            listData={user?.playerTeams ?? []}
                            renderItem={team => {
                                return (
                                    <TeamListItem
                                        key={team._id}
                                        team={team}
                                        onPress={async () => {
                                            navigation.navigate(
                                                'PublicTeamDetails',
                                                {
                                                    id: team._id,
                                                },
                                            )
                                        }}
                                    />
                                )
                            }}
                            loading={loading}
                            showButton={false}
                            showCreateButton={false}
                        />
                    </View>
                )}
            </ScrollView>
        ),
        // eslint-disable-next-line react/no-unstable-nested-components
        games: () => <Text>Stats</Text>,
    })

    return (
        <SafeAreaView style={styles.screen}>
            <Text style={styles.titleText}>@{user?.username}</Text>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
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
                        />
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default PublicUserScreen
