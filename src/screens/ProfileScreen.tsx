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
import { size } from '../theme/fonts'
import { useColors } from '../hooks'
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import {
    fetchProfile,
    logout,
    selectAccount,
    selectFetchProfileLoading,
    selectPlayerTeams,
    selectToken,
    setError,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<AllScreenProps> = ({
    navigation,
}: AllScreenProps) => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const token = useSelector(selectToken)
    const playerTeams = useSelector(selectPlayerTeams)
    const fetchProfileLoading = useSelector(selectFetchProfileLoading)

    const [loading, setLoading] = React.useState(false)
    const [refreshing, setRefreshing] = React.useState(false)

    const dispatch = useDispatch()

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            dispatch(fetchProfile(token))
        })
        return unsubscribe
    })

    const onLogout = async () => {
        try {
            setLoading(true)
            dispatch(logout(token))
            setLoading(false)
            navigation.navigate('Login')
        } catch (error: any) {
            dispatch(setError(error.message ?? 'Unable to logout'))
        }
    }

    const onCreateTeam = () => {
        navigation.navigate('CreateTeam')
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
    })

    if (fetchProfileLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <View style={styles.titleContainer}>
                        <ScreenTitle
                            style={styles.title}
                            title={'My Profile'}
                        />
                        <ActivityIndicator
                            size="large"
                            color={colors.textPrimary}
                            animating={true}
                        />
                    </View>
                </View>
            </SafeAreaView>
        )
    }

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
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true)
                            dispatch(fetchProfile(token))
                            setRefreshing(false)
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
                            {`@${account.username}`}
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
                            showCreateButton={false}
                            onButtonPress={() => ({})}
                            buttonText="see all games"
                            listData={[]}
                            renderItem={item => {
                                return <GameListItem key={item} game={item} />
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
                }
            />
        </SafeAreaView>
    )
}

export default ProfileScreen
