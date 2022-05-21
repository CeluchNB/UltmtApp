import * as React from 'react'
import { Button } from 'react-native-paper'
import EditField from '../components/molecules/EditField'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { useColors } from '../hooks'
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native'
import {
    selectAccount,
    selectToken,
    setPrivate,
} from '../store/reducers/features/account/accountReducer'
import { size, weight } from '../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const SettingsScreen: React.FC<{}> = () => {
    const { colors } = useColors()

    const dispatch = useDispatch()
    const account = useSelector(selectAccount)
    // const token = useSelector(selectToken)

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        container: {
            width: '75%',
            alignSelf: 'center',
        },
        publicContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
        publicText: {
            fontSize: size.fontMedium,
            color: colors.textPrimary,
            fontWeight: weight.bold,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView>
                <ScreenTitle title="Settings" />
                <View style={styles.container}>
                    <Button
                        mode="text"
                        color={colors.error}
                        onPress={() => {}}
                        loading={false}>
                        Sign Out
                    </Button>
                    <View style={styles.publicContainer}>
                        <Text style={styles.publicText}>Public</Text>
                        <Switch
                            thumbColor={colors.textPrimary}
                            trackColor={{
                                false: colors.gray,
                                true: colors.textSecondary,
                            }}
                            value={account.privateProfile}
                            onValueChange={() => {
                                dispatch(setPrivate(!account.privateProfile))
                            }}
                        />
                    </View>
                    <EditField
                        label="First Name"
                        value={account.firstName}
                        onSubmit={async () => {}}
                    />
                    <EditField
                        label="Last Name"
                        value={account.lastName}
                        onSubmit={async () => {}}
                    />
                    <EditField
                        label="Email"
                        value={account.email}
                        onSubmit={async () => {}}
                    />
                    <EditField
                        label="Password"
                        value="*****"
                        onSubmit={async () => {}}
                    />
                    <Button
                        mode="contained"
                        color={colors.error}
                        onPress={() => {}}
                        loading={false}>
                        Delete Account
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SettingsScreen
