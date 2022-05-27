import * as Preferences from '../services/data/preferences'
import * as React from 'react'
import * as UserData from '../services/data/user'
import { Button } from 'react-native-paper'
import EditField from '../components/molecules/EditField'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { useColors } from '../hooks'
import { AllScreenProps, SecureEditField } from '../types/navigation'
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native'
import {
    logout,
    selectAccount,
    selectToken,
    setPrivate,
    setProfile,
} from '../store/reducers/features/account/accountReducer'
import { size, weight } from '../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const SettingsScreen: React.FC<AllScreenProps> = ({ navigation }) => {
    const { colors, isDarkMode } = useColors()

    const dispatch = useDispatch()
    const account = useSelector(selectAccount)
    const token = useSelector(selectToken)

    const [firstError, setFirstError] = React.useState('')
    const [lastError, setLastError] = React.useState('')

    const [, updateState] = React.useState<any>()
    const forceUpdate = React.useCallback(() => updateState({}), [])

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
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
            marginTop: 2,
        },
    })

    const onLogout = async () => {
        dispatch(logout(token))
        navigation.navigate('Login')
    }

    const onChangeName = async (firstName: string, lastName: string) => {
        const user = await UserData.changeName(token, firstName, lastName)
        dispatch(setProfile(user))
    }

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView>
                <ScreenTitle title="Settings" />
                <View style={styles.container}>
                    <Button
                        mode="text"
                        color={colors.error}
                        onPress={onLogout}
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
                            value={!account.privateProfile}
                            onValueChange={() => {
                                dispatch(
                                    setPrivate({
                                        token,
                                        privateAccount: !account.privateProfile,
                                    }),
                                )
                            }}
                        />
                    </View>
                    <View style={styles.publicContainer}>
                        <Text style={styles.publicText}>Dark Mode</Text>
                        <Switch
                            thumbColor={colors.textPrimary}
                            trackColor={{
                                false: colors.gray,
                                true: colors.textSecondary,
                            }}
                            value={isDarkMode}
                            onValueChange={async () => {
                                await Preferences.setDarkMode(!isDarkMode)
                                // force re-render in new color scheme
                                forceUpdate()
                            }}
                        />
                    </View>
                    <EditField
                        label="First Name"
                        initialValue={account.firstName}
                        onSubmit={async (data: { value: string }) => {
                            try {
                                const { value } = data
                                await onChangeName(value, account.lastName)
                            } catch (error: any) {
                                setFirstError(error.message)
                            }
                        }}
                    />
                    {firstError.length > 0 && (
                        <Text style={styles.error}>{firstError}</Text>
                    )}
                    <EditField
                        label="Last Name"
                        initialValue={account.lastName}
                        onSubmit={async (data: { value: string }) => {
                            try {
                                const { value } = data
                                await onChangeName(account.firstName, value)
                            } catch (error: any) {
                                setLastError(error.message)
                            }
                        }}
                    />
                    {lastError.length > 0 && (
                        <Text style={styles.error}>{lastError}</Text>
                    )}
                    <EditField
                        label="Email"
                        initialValue={account.email}
                        onEdit={() => {
                            navigation.navigate('SecureEditScreen', {
                                title: 'email',
                                value: account.email,
                                field: SecureEditField.EMAIL,
                            })
                        }}
                        onSubmit={async () => {}}
                    />
                    <EditField
                        label="Password"
                        initialValue="*****"
                        onEdit={() => {
                            navigation.navigate('SecureEditScreen', {
                                title: 'password',
                                value: 'New password',
                                field: SecureEditField.PASSWORD,
                            })
                        }}
                        onSubmit={async () => {}}
                    />
                    <Button
                        mode="text"
                        color={colors.error}
                        onPress={() => {}}
                        loading={false}>
                        Sign Out All Devices
                    </Button>
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
