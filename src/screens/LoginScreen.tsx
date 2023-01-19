import * as AuthData from '../services/data/auth'
import * as React from 'react'
import { LoginData } from '../types/reducers'
import { LoginProps } from '../types/navigation'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { useColors } from '../hooks'
import { useDispatch } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

const LoginScreen: React.FC<LoginProps> = ({ navigation }) => {
    // const hasCheckedLocalToken = React.useRef(false)
    const dispatch = useDispatch()
    const { colors } = useColors()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(undefined)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: '',
            password: '',
        } as LoginData,
    })

    const onSubmit = async (data: LoginData) => {
        try {
            setError(undefined)
            setLoading(true)
            reset({
                username: '',
                password: '',
            })
            const { username, password } = data
            await AuthData.login(username, password)
            setLoading(false)
            navigation.reset({
                index: 0,
                routes: [{ name: 'Profile' }],
            })
        } catch (e: any) {
            setLoading(false)
            setError(e.message ?? 'Unable to login')
        }
    }

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            AuthData.isLoggedIn()
                .then(loggedIn => {
                    if (loggedIn) {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Profile' }],
                        })
                    }
                })
                .catch(_e => {
                    // No error handling here, user just needs
                    // to sign in
                })
        })
        return unsubscribe
    }, [dispatch, navigation])

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
        },
        title: {
            alignSelf: 'center',
            marginTop: 50,
        },
        input: {
            marginTop: 20,
            width: '75%',
            alignSelf: 'center',
        },
        loginButton: {
            alignSelf: 'center',
            marginTop: 20,
        },
        createButton: {
            alignSelf: 'center',
            marginTop: 5,
        },
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
            marginTop: 2,
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Login" style={styles.title} />
            <Controller
                control={control}
                rules={{
                    required: true,
                }}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Username or Email"
                        onChangeText={onChange}
                        value={value}
                        style={styles.input}
                    />
                )}
                name="username"
            />
            {errors.username && (
                <Text style={styles.error}>Must enter a username or email</Text>
            )}
            <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Password"
                        onChangeText={onChange}
                        value={value}
                        isPassword={true}
                        style={styles.input}
                    />
                )}
                name="password"
            />
            {errors.password && (
                <Text style={styles.error}>Must enter a password</Text>
            )}
            {error && <Text style={styles.error}>{error}</Text>}

            <PrimaryButton
                text="Login"
                loading={loading}
                disabled={loading}
                onPress={handleSubmit(onSubmit)}
                style={styles.loginButton}
            />
            <SecondaryButton
                text="Create Account"
                onPress={async () => navigation.navigate('CreateAccount')}
                style={styles.createButton}
            />
            <SecondaryButton
                text="Forgot Password?"
                onPress={async () => {
                    navigation.navigate('ForgotPasswordScreen')
                }}
                style={styles.createButton}
            />
        </View>
    )
}

export default LoginScreen
