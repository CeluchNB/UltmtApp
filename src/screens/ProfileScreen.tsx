import * as React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import Section from '../components/molecules/Section'
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
            <Text>{account.username}</Text>
            <Section title="Stats" />
        </View>
    )
}

export default ProfileScreen
