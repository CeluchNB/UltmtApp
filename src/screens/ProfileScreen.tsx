import * as React from 'react'
import { Button } from 'react-native-paper'
import GameListItem from '../components/atoms/GameListItem'
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
    selectAccount,
    selectPlayerTeams,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const playerTeams = useSelector(selectPlayerTeams)

    const dispatch = useDispatch()

    React.useEffect(() => {
        if (store.getState().account.firstName.length < 1) {
            dispatch(fetchProfile(store.getState().account.token))
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
            marginStart: 50,
            marginEnd: 50,
        },
        signOutButton: {
            marginTop: 5,
        },
    })

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
                            onPress={() => ({})}
                            style={styles.signOutButton}>
                            Sign Out
                        </Button>
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.footerContainer}>
                        <Section
                            title="Stats"
                            onButtonPress={() => ({})}
                            error="No stats available"
                            listData={[]}
                            numColumns={2}
                            renderItem={({ item }) => {
                                return <StatListItem stat={item} />
                            }}
                            buttonText="see all stats"
                        />
                        <Section
                            title="Games"
                            onButtonPress={() => ({})}
                            listData={[]}
                            renderItem={({ item }) => {
                                return <GameListItem game={item} />
                            }}
                            buttonText="see all games"
                            error="No games available"
                        />
                        <Section
                            title="Teams"
                            onButtonPress={() => ({})}
                            listData={playerTeams}
                            renderItem={({ item }) => {
                                return <TeamListItem team={item} />
                            }}
                            buttonText="manage teams"
                            error={
                                playerTeams.length === 0
                                    ? 'No teams available'
                                    : undefined
                            }
                        />
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default ProfileScreen
