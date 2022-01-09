import * as React from 'react'
import { Button } from 'react-native-paper'
import { DisplayGame } from '../types/game'
import { DisplayStat } from '../types/stats'
import { DisplayTeam } from '../types/team'
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
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const account = useSelector(selectAccount)

    const dispatch = useDispatch()

    const dispatchCallback = React.useCallback(
        args => {
            return dispatch(args)
        },
        [dispatch],
    )

    React.useEffect(() => {
        dispatchCallback(fetchProfile(store.getState().account.token))
    }, [dispatchCallback])

    const styles = StyleSheet.create({
        screen: {
            minHeight: '100%',
            backgroundColor: colors.primary,
            alignItems: 'center',
        },
        signOutButton: {
            marginTop: 5,
        },
    })

    const teamList: DisplayTeam[] = [
        { place: 'Pittsburgh', name: 'Temper', season: '2019' },
        { place: 'Seattle', name: 'Sockeye', season: '2018' },
        { place: 'San Francisco', name: 'Revolver', season: '2017' },
    ]

    const gameList: DisplayGame[] = [
        {
            opponent: { place: 'Chicago', name: 'Machine', season: '2019' },
            teamScore: 11,
            opponentScore: 15,
        },
        {
            opponent: { place: 'Pittsburgh', name: 'Hazard', season: '2019' },
            teamScore: 15,
            opponentScore: 0,
        },
        {
            opponent: { place: 'Portland', name: 'Rhino!', season: '2019' },
            teamScore: 14,
            opponentScore: 12,
        },
    ]

    const statList: DisplayStat[] = [
        { name: 'Goals', value: 27, points: 172 },
        { name: 'Assists', value: 35, points: 172 },
        { name: 'Ds', value: 11, points: 172 },
        { name: 'Points', value: 172, points: 172 },
    ]

    return (
        <SafeAreaView style={styles.screen}>
            <FlatList
                data={[]}
                renderItem={() => <View />}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={
                    <View style={styles.screen}>
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
                        <Section
                            title="Stats"
                            onButtonPress={() => ({})}
                            listData={statList}
                            numColumns={2}
                            renderItem={({ item }) => {
                                return <StatListItem stat={item} />
                            }}
                            buttonText="see all stats"
                        />
                        <Section
                            title="Games"
                            onButtonPress={() => ({})}
                            listData={gameList}
                            renderItem={({ item }) => {
                                return <GameListItem game={item} />
                            }}
                            buttonText="see all games"
                        />
                        <Section
                            title="Teams"
                            onButtonPress={() => ({})}
                            listData={teamList}
                            renderItem={({ item }) => {
                                return <TeamListItem team={item} />
                            }}
                            buttonText="manage teams"
                        />
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default ProfileScreen
