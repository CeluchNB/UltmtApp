import * as React from 'react'
import PrimaryButton from '../components/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/ScreenTitle'
import SecondaryButton from '../components/SecondaryButton'
import UserInput from '../components/UserInput'
import { login } from '../store/reducers/features/account/accountReducer'
import store from './../store/store'
import { useColors } from '../hooks'
import { useDispatch } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'

const LoginScreen: React.FC<Props> = ({ navigation }: Props) => {
    const dispatch = useDispatch()
    const { colors } = useColors()
    const { control, handleSubmit } = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const [loading, setLoading] = React.useState(false)

    const onSubmit = (data: any) => {
        dispatch(login({ data }))
    }

    const unsubscribe = store.subscribe(() => {
        const state = store.getState()
        setLoading(state.account.loading)

        if (state.account.token.length > 0) {
            navigation.navigate('Profile')
        }
    })

    React.useEffect(() => {
        return () => {
            unsubscribe()
        }
    })

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
            alignContent: 'center',
        },
        title: {
            alignSelf: 'center',
            marginTop: 50,
        },
        input: {
            marginTop: 20,
            marginStart: 50,
            marginEnd: 50,
        },
        loginButton: {
            alignSelf: 'center',
            marginTop: 20,
        },
        createButton: {
            alignSelf: 'center',
            marginTop: 5,
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
                        placeholder="Username"
                        onChangeText={onChange}
                        value={value}
                        style={styles.input}
                    />
                )}
                name="username"
            />
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

            <PrimaryButton
                text="Login"
                loading={loading}
                onPress={handleSubmit(onSubmit)}
                style={styles.loginButton}
            />
            <SecondaryButton
                text="Create Account"
                onPress={() => ({})}
                style={styles.createButton}
            />
        </View>
    )
}

export default LoginScreen
