import * as React from 'react'
import { Button } from 'react-native-paper'
import ScreenTitle from '../components/atoms/ScreenTitle'
import Section from '../components/molecules/Section'
import { size } from '../theme/fonts'
import store from '../store/store'
import { useColors } from '../hooks'
import { StyleSheet, Text, View } from 'react-native'
import {
    fetchProfile,
    selectAccount,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const ProfileScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const account = useSelector(selectAccount)

    React.useEffect(() => {
        dispatch(fetchProfile(store.getState().account.token))
    }, [dispatch])

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
            alignItems: 'center',
        },
        signOutButton: {
            marginTop: 10,
        },
    })

    store.subscribe(() => {
        console.log('in subscribe', store.getState().account)
    })

    return (
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
                listData={['one', 'two', 'three']}
                renderItem={({ item }: { item: string }) => {
                    return <Text key={item}>{item}</Text>
                }}
                buttonText="see all stats"
                error={undefined}
            />
            <Section
                title="Games"
                onButtonPress={() => ({})}
                listData={['game 1', 'game 2', 'game 3']}
                renderItem={({ item }) => {
                    return <Text>{item}</Text>
                }}
                buttonText="see all games"
                error={undefined}
            />
            <Section
                title="Teams"
                onButtonPress={() => ({})}
                listData={['team 1', 'team 2', 'team 3']}
                renderItem={({ item }) => {
                    return <Text>{item}</Text>
                }}
                buttonText="manage teams"
            />
        </View>
    )
}

export default ProfileScreen
