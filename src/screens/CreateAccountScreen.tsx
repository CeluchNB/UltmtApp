import * as React from 'react'
import * as UserData from '../services/data/user'
import { CreateUserData } from '../types/user'
import PasswordValidator from 'password-validator'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { setToken } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useDispatch } from 'react-redux'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

const CreateAccountScreen: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState(undefined)
    const [passwordHidden, setPasswordHidden] = React.useState(true)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            username: '',
            password: '',
        } as CreateUserData,
    })

    const styles = StyleSheet.create({
        container: {
            height: '100%',
            backgroundColor: colors.primary,
            alignContent: 'center',
        },
        title: {
            alignSelf: 'center',
        },
        input: {
            marginTop: 20,
            width: '75%',
            alignSelf: 'center',
        },
        createButton: {
            alignSelf: 'center',
            marginTop: 20,
        },
        backButton: {
            alignSelf: 'center',
            marginTop: 10,
        },
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
        },
    })

    const dispatchCreateAccount = async (data: CreateUserData) => {
        try {
            setLoading(true)
            const { token } = await UserData.createAccount(data)
            setLoading(false)
            dispatch(setToken(token))
            navigation.navigate('Profile')
        } catch (e: any) {
            setLoading(false)
            setError(e.message ?? 'Unable to create account')
        }
    }

    return (
        <View style={styles.container}>
            <ScreenTitle title="Create Account" style={styles.title} />
            <Controller
                control={control}
                rules={getFormFieldRules('First name', true, undefined, 20)}
                name="firstName"
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="First Name"
                        onChangeText={onChange}
                        value={value}
                        style={styles.input}
                    />
                )}
            />
            {errors.firstName && (
                <Text style={styles.error}>{errors.firstName.message}</Text>
            )}

            <Controller
                control={control}
                rules={getFormFieldRules('Last name', true, undefined, 30)}
                name="lastName"
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Last Name"
                        onChangeText={onChange}
                        value={value}
                        style={styles.input}
                    />
                )}
            />
            {errors.lastName && (
                <Text style={styles.error}>{errors.lastName.message}</Text>
            )}

            <Controller
                control={control}
                rules={getFormFieldRules('Username', true, 2, 20, [
                    {
                        test: (v: string) => {
                            return validator.isAlphanumeric(v)
                        },
                        message: 'Username can only use letters and numbers.',
                    },
                ])}
                name="username"
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Username"
                        onChangeText={onChange}
                        value={value}
                        style={styles.input}
                    />
                )}
            />
            {errors.username && (
                <Text style={styles.error}>{errors.username.message}</Text>
            )}

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
                name="email"
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Email"
                        onChangeText={onChange}
                        value={value}
                        style={styles.input}
                    />
                )}
            />
            {errors.email && (
                <Text style={styles.error}>{errors.email.message}</Text>
            )}

            <Controller
                control={control}
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
                name="password"
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Password"
                        onChangeText={onChange}
                        value={value}
                        isPassword={passwordHidden}
                        style={styles.input}
                        rightIcon={true}
                        onRightPress={async () => {
                            setPasswordHidden(!passwordHidden)
                        }}
                    />
                )}
            />
            {errors.password && (
                <Text style={styles.error}>{errors.password.message}</Text>
            )}
            {error && (
                <Text style={styles.error}>
                    Error creating account: {error}
                </Text>
            )}

            <PrimaryButton
                text="Create"
                onPress={handleSubmit(dispatchCreateAccount)}
                loading={loading}
                style={styles.createButton}
            />

            <SecondaryButton
                text="Back"
                onPress={async () => {
                    navigation.goBack()
                }}
                style={styles.backButton}
            />
        </View>
    )
}

export default CreateAccountScreen
