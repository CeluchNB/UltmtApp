import * as React from 'react'
import PasswordValidator from 'password-validator'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { resetPassword } from '../services/data/user'
import { useColors } from '../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

const ResetPasswordScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        defaultValues: {
            passcode: '',
            newPassword: '',
        },
    })

    const [passwordHidden, setPasswordHidden] = React.useState(true)
    const [loading, setLoading] = React.useState(false)

    const submitReset = async (data: {
        passcode: string
        newPassword: string
    }) => {
        setLoading(true)
        const { passcode, newPassword } = data
        try {
            const { token, user } = await resetPassword(passcode, newPassword)
            reset({ passcode: '', newPassword: '' })
            console.log(token, user)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        input: {
            marginTop: 20,
            width: '75%',
            alignSelf: 'center',
        },
        button: {
            alignSelf: 'center',
            marginTop: 20,
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
            <ScreenTitle title="Reset Password" />
            <Controller
                control={control}
                name="passcode"
                rules={getFormFieldRules('Recovery code', true, 6, 6, [
                    {
                        test: (v: string) => {
                            return validator.isNumeric(v)
                        },
                        message: 'Recovery code can only contain numbers',
                    },
                ])}
                render={({ field: { onChange, value } }) => {
                    return (
                        <UserInput
                            style={styles.input}
                            onChangeText={onChange}
                            value={value}
                            placeholder="Recovery code"
                        />
                    )
                }}
            />
            {errors.passcode && (
                <Text style={styles.error}>{errors.passcode.message}</Text>
            )}
            <Controller
                control={control}
                name="newPassword"
                rules={getFormFieldRules('Password', true, 7, 20, [
                    {
                        test: (v: string) => {
                            const validateSchema = new PasswordValidator()

                            validateSchema
                                .is()
                                .min(7)
                                .is()
                                .max(20)
                                .has()
                                .letters()
                                .has()
                                .digits()
                                .has()
                                .symbols()
                            return validateSchema.validate(v) as boolean
                        },
                        message:
                            'Password must contain a letter, number, and symbol.',
                    },
                ])}
                render={({ field: { onChange, value } }) => {
                    return (
                        <UserInput
                            style={styles.input}
                            onChangeText={onChange}
                            value={value}
                            placeholder="New Password"
                            isPassword={passwordHidden}
                            rightIcon={true}
                            onRightPress={async () => {
                                setPasswordHidden(!passwordHidden)
                            }}
                        />
                    )
                }}
            />
            {errors.newPassword && (
                <Text style={styles.error}>{errors.newPassword.message}</Text>
            )}
            <PrimaryButton
                text="Submit"
                loading={loading}
                style={styles.button}
                onPress={handleSubmit(submitReset)}
            />
        </View>
    )
}

export default ResetPasswordScreen
