import * as React from 'react'
import * as UserData from '../services/data/user'
import { LoginData } from '../types/reducers'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { useColors } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import {
    selectAccount,
    setError,
    setToken,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const LoginScreen: React.FC<Props> = ({ navigation }: Props) => {
    const hasCheckedLocalToken = React.useRef(false)
    const dispatch = useDispatch()
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const [loading, setLoading] = React.useState(false)

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
            setLoading(true)
            reset({
                username: '',
                password: '',
            })
            const { username, password } = data
            const token = await UserData.login(username, password)
            dispatch(setToken(token))
            setLoading(false)
            navigation.navigate('Profile')
        } catch (error: any) {
            setLoading(false)
            dispatch(setError(error.message ?? 'Unable to login'))
        }
    }

    React.useEffect(() => {
        if (!hasCheckedLocalToken.current) {
            UserData.getLocalToken()
                .then(token => {
                    dispatch(setToken(token))
                    navigation.navigate('Profile')
                })
                .catch(error => {
                    dispatch(setError(error.message ?? 'Error fetching token'))
                })
        }
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
                <Text style={styles.error}>This field is required</Text>
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
                <Text style={styles.error}>This field is required</Text>
            )}
            {account.error && <Text style={styles.error}>{account.error}</Text>}

            <PrimaryButton
                text="Login"
                loading={loading}
                onPress={handleSubmit(onSubmit)}
                style={styles.loginButton}
            />
            <SecondaryButton
                text="Create Account"
                onPress={async () => navigation.navigate('CreateAccount')}
                style={styles.createButton}
            />
        </View>
    )
}

export default LoginScreen
