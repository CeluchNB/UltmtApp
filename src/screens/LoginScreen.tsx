import * as React from 'react'
import PrimaryButton from '../components/PrimaryButton'
import ScreenTitle from '../components/ScreenTitle'
import SecondaryButton from '../components/SecondaryButton'
import UserInput from '../components/UserInput'
import { login } from '../store/reducers/features/account/accountReducer'
import store from './../store/store'
import { useColors } from '../hooks'
import { useDispatch } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'

const LoginScreen: React.FC<{}> = () => {
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

    store.subscribe(() => {
        setLoading(store.getState().account.loading)
    })

    const styles = StyleSheet.create({
        screen: {
            backgroundColor: colors.primary,
            height: '100%',
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Login" />
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
                    />
                )}
                name="password"
            />

            <PrimaryButton
                text="Login"
                loading={loading}
                onPress={handleSubmit(onSubmit)}
            />
            <SecondaryButton text="Create Account" />
        </View>
    )
}

export default LoginScreen
