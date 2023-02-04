import * as React from 'react'
import * as UserData from './../services/data/user'
import MapSection from '../components/molecules/MapSection'
import { PublicUserDetailsProps } from '../types/navigation'
import TeamListItem from '../components/atoms/TeamListItem'
import { User } from '../types/user'
import { size } from '../theme/fonts'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import { useColors, useData } from './../hooks'

const PublicUserScreen: React.FC<PublicUserDetailsProps> = ({
    route,
    navigation,
}) => {
    const { user: initialUser } = route.params
    const { colors } = useColors()

    const {
        data: user,
        loading,
        error,
        refetch,
    } = useData<User>(UserData.getPublicUser, initialUser._id)

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
            title: `${initialUser.firstName} ${initialUser.lastName}`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUser])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        titleText: {
            color: colors.textPrimary,
            fontSize: size.fontMedium,
            alignSelf: 'center',
        },
        sectionContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            fontSize: size.fontLarge,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
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
                <Text style={styles.titleText}>@{initialUser.username}</Text>
                {error ? (
                    <Text style={styles.error}>{error.message}</Text>
                ) : (
                    <View style={styles.sectionContainer}>
                        <MapSection
                            title="Teams"
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
                                                    place: team.place,
                                                    name: team.name,
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
        </SafeAreaView>
    )
}

export default PublicUserScreen
