import { ApiError } from '../types/services'
import { ForgotPasswordProps } from '../types/navigation'
import PrimaryButton from '../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { requestPasswordRecovery } from '../services/data/user'
import { useMutation } from 'react-query'
import { useTheme } from '../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

const ForgotPasswordScreen: React.FC<ForgotPasswordProps> = ({
    navigation,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
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

    const { isLoading, mutate, error, isError } = useMutation((email: string) =>
        requestPasswordRecovery(email),
    )

    const submitRequest = async (data: { email: string }) => {
        setSuccess(false)
        mutate(data.email, {
            onSuccess() {
                reset({ email: '' })
                setSuccess(true)
            },
        })
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
            marginBottom: 10,
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
            fontSize: size.fontTwenty,
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle title="Enter your email" style={styles.title} />
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
            {isError && (
                <Text style={styles.error}>{(error as ApiError).message}</Text>
            )}
            {!error && success && (
                <Text style={styles.success}>
                    Check your inbox for a recovery code!
                </Text>
            )}
            <PrimaryButton
                text="Submit"
                onPress={handleSubmit(submitRequest)}
                loading={isLoading}
                style={[styles.button, styles.submitButton]}
            />
            <SecondaryButton
                text="I Have A Code"
                onPress={async () => {
                    navigation.navigate('ResetPassword')
                }}
                style={styles.button}
            />
        </View>
    )
}

export default ForgotPasswordScreen
