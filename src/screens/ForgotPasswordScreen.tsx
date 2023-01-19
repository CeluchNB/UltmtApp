import * as React from 'react'
import { ForgotPasswordProps } from '../types/navigation'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { requestPasswordRecovery } from '../services/data/user'
import { size } from '../theme/fonts'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import { useColors, useLazyData } from '../hooks'

const ForgotPasswordScreen: React.FC<ForgotPasswordProps> = ({
    navigation,
}) => {
    const { colors } = useColors()
    const [success, setSuccess] = React.useState(false)

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
        },
    })

    const { loading, fetch, error } = useLazyData(requestPasswordRecovery)

    const submitRequest = async (data: { email: string }) => {
        setSuccess(false)
        await fetch(data.email)
        reset({ email: '' })
        setSuccess(true)
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: { alignSelf: 'center' },
        input: {
            width: '75%',
            alignSelf: 'center',
            marginTop: 20,
        },
        submitButton: {
            marginTop: 20,
        },
        button: {
            alignSelf: 'center',
        },
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
            marginTop: 2,
        },
        success: {
            color: colors.success,
            width: '75%',
            alignSelf: 'center',
            marginTop: 2,
            fontSize: size.fontMedium,
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Forgot Password?" style={styles.title} />
            <Controller
                control={control}
                rules={getFormFieldRules('Email', true, undefined, undefined, [
                    {
                        test: (v: string) => {
                            return validator.isEmail(v)
                        },
                        message: 'Email must be in valid email format.',
                    },
                ])}
                render={({ field: { onChange, value } }) => {
                    return (
                        <UserInput
                            placeholder="Email"
                            onChangeText={onChange}
                            value={value}
                            style={styles.input}
                        />
                    )
                }}
                name="email"
            />
            {errors.email && (
                <Text style={styles.error}>{errors.email.message}</Text>
            )}
            {error && <Text style={styles.error}>{error.message}</Text>}
            {!error && success && (
                <Text style={styles.success}>
                    Check your inbox for a recovery code!
                </Text>
            )}
            <PrimaryButton
                text="Submit"
                onPress={handleSubmit(submitRequest)}
                loading={loading}
                style={[styles.button, styles.submitButton]}
            />
            <SecondaryButton
                text="I Have A Code"
                onPress={async () => {
                    navigation.navigate('ResetPasswordScreen')
                }}
                style={styles.button}
            />
        </View>
    )
}

export default ForgotPasswordScreen
