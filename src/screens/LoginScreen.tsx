import * as React from 'react'
import PrimaryButton from '../components/PrimaryButton'
import ScreenTitle from '../components/ScreenTitle'
import SecondaryButton from '../components/SecondaryButton'
import UserInput from '../components/UserInput'
import { useColors } from '../hooks/useColors'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, View } from 'react-native'

const LoginScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const { control, handleSubmit } = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
    })

    const onSubmit = (data: any) => console.log(data)

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

            <PrimaryButton text="Login" onPress={handleSubmit(onSubmit)} />
            <SecondaryButton text="Create Account" />
        </View>
    )
}

export default LoginScreen
