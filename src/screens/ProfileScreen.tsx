import * as React from 'react'
import { AllScreenProps } from '../types/navigation'
import { Button } from 'react-native-paper'
import GameListItem from '../components/atoms/GameListItem'
import IconButtonText from '../components/atoms/IconButtonText'
import MapSection from '../components/molecules/MapSection'
import ScreenTitle from '../components/atoms/ScreenTitle'
import Section from '../components/molecules/Section'
import StatListItem from '../components/atoms/StatListItem'
import TeamListItem from '../components/atoms/TeamListItem'
import { User } from '../types/user'
import { fetchProfile } from '../services/data/user'
import { logout } from '../services/data/auth'
import { size } from '../theme/fonts'
import {
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    resetState,
    selectAccount,
    selectPlayerTeams,
    setProfile,
} from '../store/reducers/features/account/accountReducer'
import { useColors, useData } from '../hooks'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<AllScreenProps> = ({
    navigation,
}: AllScreenProps) => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const playerTeams = useSelector(selectPlayerTeams)

    const [loading, setLoading] = React.useState(false)

    const dispatch = useDispatch()

    const {
        data: profile,
        loading: profileLoading,
        error,
        refetch,
    } = useData<User>(fetchProfile)

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (!profileLoading) {
                refetch()
            }
        })
        return unsubscribe
    })

    React.useEffect(() => {
        if (!profileLoading && profile) {
            dispatch(setProfile(profile))
        }
    }, [profileLoading, profile, dispatch])

    const onLogout = async () => {
        try {
            setLoading(true)
            await logout()
            dispatch(resetState())
            setLoading(false)
        } catch (e: any) {
        } finally {
            navigation.navigate('Login')
        }
    }

    const onCreateTeam = () => {
        navigation.navigate('CreateTeam')
    }

    const onCreateGame = () => {
        navigation.navigate('GameCreationFlow', { screen: 'SelectMyTeam' })
    }

    const styles = StyleSheet.create({
        container: {
            minHeight: '100%',
            backgroundColor: colors.primary,
        },
        titleContainer: {
            flexDirection: 'row',
            textAlign: 'right',
            marginLeft: 10,
            marginBottom: 0,
        },
        title: {
            flex: 1,
            textAlignVertical: 'center',
        },
        headerContainer: {
            alignItems: 'center',
        },
        footerContainer: {
            width: '75%',
            alignSelf: 'center',
        },
        signOutButton: {
            marginTop: 5,
        },
        requestsButton: {
            margin: 10,
        },
        settingsButton: {
            marginTop: 10,
            marginRight: 10,
        },
        indicatorStyle: {
            width: '80%',
            height: '50%',
        },
        error: {
            width: '75%',
            alignSelf: 'center',
            textAlign: 'center',
            fontSize: size.fontLarge,
            color: colors.gray,
        },
    })

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                showsVerticalScrollIndicator={false}
                testID="profile-flat-list"
                refreshControl={
                    <RefreshControl
                        colors={[colors.textSecondary]}
                        refreshing={profileLoading}
                        onRefresh={async () => {
                            refetch()
                        }}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <View style={styles.titleContainer}>
                            <ScreenTitle
                                style={styles.title}
                                title={
                                    account.firstName.length > 0
                                        ? `${account.firstName} ${account.lastName}`
                                        : 'My Profile'
                                }
                            />
                            <IconButtonText
                                style={styles.requestsButton}
                                icon="email-outline"
                                text="Requests"
                                onPress={() => {
                                    navigation.navigate('UserRequestsScreen')
                                }}
                            />
                            <IconButtonText
                                style={styles.settingsButton}
                                icon="cog-outline"
                                text="Settings"
                                onPress={() => {
                                    navigation.navigate('SettingsScreen')
                                }}
                            />
                        </View>
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: size.fontMedium,
                            }}>
                            {`@${
                                account.username
                                    ? account.username
                                    : 'myaccount'
                            }`}
                        </Text>
                        <Button
                            mode="text"
                            color={colors.error}
                            onPress={onLogout}
                            loading={loading}
                            style={styles.signOutButton}>
                            Sign Out
                        </Button>
                    </View>
                }
                ListFooterComponent={
                    error ? (
                        <View style={styles.footerContainer}>
                            <Text style={styles.error}>{error.message}</Text>
                        </View>
                    ) : (
                        <View style={styles.footerContainer}>
                            <Section
                                title="Stats"
                                showButton={false}
                                onButtonPress={() => ({})}
                                buttonText="see all stats"
                                error="No stats available"
                                listData={[]}
                                numColumns={2}
                                renderItem={({ item }) => {
                                    return <StatListItem stat={item} />
                                }}
                            />
                            <MapSection
                                title="Games"
                                showButton={false}
                                showCreateButton={true}
                                onCreatePress={onCreateGame}
                                onButtonPress={() => ({})}
                                buttonText="see all games"
                                listData={[]}
                                renderItem={item => {
                                    return (
                                        <GameListItem key={item} game={item} />
                                    )
                                }}
                                error="No games available"
                            />
                            <MapSection
                                title="Teams"
                                showButton={true}
                                onButtonPress={() => {
                                    navigation.navigate('ManageTeams')
                                }}
                                buttonText="manage teams"
                                listData={playerTeams}
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
                                error={
                                    playerTeams.length === 0
                                        ? 'No teams available'
                                        : undefined
                                }
                                showCreateButton={true}
                                onCreatePress={onCreateTeam}
                            />
                        </View>
                    )
                }
            />
        </SafeAreaView>
    )
}

export default ProfileScreen
