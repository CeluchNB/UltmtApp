import * as React from 'react'
import ScreenTitle from '../components/ScreenTitle'
import { useColors } from '../hooks'
import { StyleSheet, View } from 'react-native'

const ProfileScreen: React.FC<{}> = () => {
    const { colors } = useColors()

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
            alignContent: 'center',
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle title="My Profile" />
        </View>
    )
}

export default ProfileScreen
