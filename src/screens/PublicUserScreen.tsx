import * as React from 'react'
import * as UserData from './../services/data/user'
import MapSection from '../components/molecules/MapSection'
import { PublicUserDetailsProps } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import TeamListItem from '../components/atoms/TeamListItem'
import { User } from '../types/user'
import { size } from '../theme/fonts'
import { useColors } from './../hooks'
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native'

const PublicUserScreen: React.FC<PublicUserDetailsProps> = ({
    route,
    navigation,
}) => {
    const { user: initialUser } = route.params
    const { colors } = useColors()
    const [user, setUser] = React.useState<User>()
    const [refreshing, setRefreshing] = React.useState<boolean>(false)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string>('')
    const isMounted = React.useRef(false)

    const initializeScreen = React.useCallback(async () => {
        try {
            setLoading(true)
            const responseUser = await UserData.getPublicUser(initialUser._id)
            if (isMounted.current) {
                setLoading(false)
                setUser(responseUser)
            }
        } catch (e: any) {
            setError(e.message ?? 'Unable to get this user.')
        }
    }, [initialUser])

    React.useEffect(() => {
        isMounted.current = true
        const unsubscribe = navigation.addListener('focus', () => {
            setError('')
            initializeScreen()
        })

        return () => {
            unsubscribe()
            isMounted.current = false
        }
    }, [initializeScreen, navigation])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        titleText: {
            color: colors.textPrimary,
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
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true)
                            await initializeScreen()
                            setRefreshing(false)
                        }}
                    />
                }
                testID="public-user-scroll-view">
                <ScreenTitle
                    style={styles.titleText}
                    title={`${initialUser.firstName} ${initialUser.lastName}`}
                />
                <Text style={styles.titleText}>@{initialUser.username}</Text>
                {error.length > 0 ? (
                    <Text style={styles.error}>{error}</Text>
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
