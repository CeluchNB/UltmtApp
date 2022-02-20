import * as React from 'react'
import { LoginData } from '../types/reducers'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import store from './../store/store'
import { useColors } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import {
    getLocalToken,
    login,
    selectAccount,
    selectLoading,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const LoginScreen: React.FC<Props> = ({ navigation }: Props) => {
    const hasCheckedLocalToken = React.useRef(false)
    const dispatch = useDispatch()
    const { colors } = useColors()
    const account = useSelector(selectAccount)
    const loading = useSelector(selectLoading)

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

    const onSubmit = (data: LoginData) => {
        dispatch(login(data))
    }

    const unsubscribe = store.subscribe(() => {
        const state = store.getState()

        if (state.account.token.length > 0) {
            reset({
                username: '',
                password: '',
            })
            navigation.navigate('Profile')
        }
    })

    React.useEffect(() => {
        if (!hasCheckedLocalToken.current) {
            dispatch(getLocalToken())
            hasCheckedLocalToken.current = true
        }
        return () => {
            unsubscribe()
        }
    })

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
