import * as React from 'react'
import { Button } from 'react-native-paper'
import GameListItem from '../components/atoms/GameListItem'
import MapSection from '../components/molecules/MapSection'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import Section from '../components/molecules/Section'
import StatListItem from '../components/atoms/StatListItem'
import TeamListItem from '../components/atoms/TeamListItem'
import { size } from '../theme/fonts'
import store from '../store/store'
import { useColors } from '../hooks'
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import {
    fetchProfile,
    logout,
    selectAccount,
    selectLoading,
    selectPlayerTeams,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const loading = useSelector(selectLoading)
    const playerTeams = useSelector(selectPlayerTeams)
    const hasRequested = React.useRef(false)

    const dispatch = useDispatch()

    const unsubscribe = store.subscribe(() => {
        const state = store.getState()

        if (state.account.token.length === 0) {
            navigation.navigate('Login')
        }
    })

    React.useEffect(() => {
        console.log('in profile screen useeffect')
        if (!hasRequested.current) {
            dispatch(fetchProfile(store.getState().account.token))
            hasRequested.current = true
        }

        return () => {
            unsubscribe()
        }
    })

    const styles = StyleSheet.create({
        container: {
            minHeight: '100%',
            backgroundColor: colors.primary,
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
    })

    const onLogout = () => {
        dispatch(logout(account.token))
    }

    const onCreateTeam = () => {
        navigation.navigate('CreateTeam')
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.headerContainer}>
                        <ScreenTitle
                            title={
                                account.firstName.length > 0
                                    ? `${account.firstName} ${account.lastName}`
                                    : 'My Profile'
                            }
                        />
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
                            renderItem={item => {
                                return (
                                    <TeamListItem key={item._id} team={item} />
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
