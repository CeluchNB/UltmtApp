import * as Constants from '../utils/constants'
import * as Preferences from '../services/data/preferences'
import * as React from 'react'
import * as UserData from '../services/data/user'
import { AppDispatch } from '../store/store'
import { Button } from 'react-native-paper'
import EditField from '../components/molecules/EditField'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { logout } from '../services/data/auth'
import { useColors } from '../hooks'
import {
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native'
import { SettingsScreenProps, SecureEditField } from '../types/navigation'
import {
    selectAccount,
    setPrivate,
    setProfile,
} from '../store/reducers/features/account/accountReducer'
import { size, weight } from '../theme/fonts'
import { useDispatch, useSelector } from 'react-redux'

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
    const { colors, isDarkMode } = useColors()

    const dispatch = useDispatch<AppDispatch>()
    const account = useSelector(selectAccount)

    const [firstError, setFirstError] = React.useState('')
    const [lastError, setLastError] = React.useState('')
    const [deleteError, setDeleteError] = React.useState('')
    const [modalVisible, setModalVisible] = React.useState(false)

    const [, updateState] = React.useState<any>()
    const forceUpdate = React.useCallback(() => updateState({}), [])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
            opacity: modalVisible ? 0.85 : 1.0,
        },
        screenTitle: {
            flex: 1,
            alignSelf: 'center',
            margin: 10,
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
        deleteButton: {
            marginTop: 10,
        },
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
        },
        modalView: {
            margin: 20,
            backgroundColor: colors.darkGray,
            borderRadius: 10,
            padding: 25,
            alignItems: 'center',
            shadowColor: colors.darkPrimary,
            shadowOffset: {
                width: 5,
                height: 5,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        modalText: {
            fontSize: size.fontMedium,
            color: colors.error,
        },
        modalButtonContainer: {
            flexDirection: 'row',
        },
        modalButton: {
            margin: 10,
        },
        title: {
            flex: 1,
            fontSize: size.fontLarge,
            color: colors.textPrimary,
            fontWeight: weight.bold,
            marginTop: 10,
            marginBottom: 10,
        },
    })

    const onLogout = async () => {
        await logout()
        navigation.navigate('Tabs', { screen: 'Account', params: { screen: 'Login' } })
    }

    const onChangeName = async (firstName: string, lastName: string) => {
        const user = await UserData.changeName(firstName, lastName)
        dispatch(setProfile(user))
    }

    return (
        <SafeAreaView style={styles.screen} testID="screen">
            <ScrollView>
                <ScreenTitle style={styles.screenTitle} title="Settings" />
                <View style={styles.container}>
                    <Button
                        mode="text"
                        color={colors.error}
                        onPress={onLogout}
                        loading={false}>
                        Sign Out
                    </Button>
                    <Text style={styles.title}>Device</Text>
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
                            testID="dark-mode-switch"
                        />
                    </View>
                    <Text style={styles.title}>Account</Text>
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
                                        privateAccount: !account.privateProfile,
                                    }),
                                )
                            }}
                            testID="private-switch"
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
                        mode="contained"
                        color={colors.error}
                        style={styles.deleteButton}
                        onPress={async () => {
                            setModalVisible(true)
                        }}
                        loading={false}>
                        Delete Account
                    </Button>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(false)
                        }}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalView}>
                                <Text style={styles.modalText}>
                                    Are you sure you want to delete your
                                    account? This is irreversible.
                                </Text>
                                <View style={styles.modalButtonContainer}>
                                    <Button
                                        mode="contained"
                                        color={colors.success}
                                        style={styles.modalButton}
                                        onPress={() => {
                                            setModalVisible(false)
                                        }}>
                                        No
                                    </Button>
                                    <Button
                                        mode="contained"
                                        color={colors.error}
                                        style={styles.modalButton}
                                        onPress={async () => {
                                            try {
                                                await UserData.deleteAccount()
                                                setModalVisible(false)
                                                navigation.navigate('Tabs', { screen: 'Account', params: { screen: 'Login' } })
                                            } catch (e: any) {
                                                setDeleteError(
                                                    e.message ??
                                                        Constants.DELETE_USER_ERROR,
                                                )
                                            }
                                        }}>
                                        Yes
                                    </Button>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    {deleteError.length > 0 && (
                        <Text style={styles.error}>{deleteError}</Text>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SettingsScreen
