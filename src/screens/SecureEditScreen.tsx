import * as React from 'react'
// import * as UserData from '../services/data/user'
import PasswordValidator from 'password-validator'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserInput from '../components/atoms/UserInput'
import { useColors } from '../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import {
    Rules,
    capitalizeFirstLetter,
    getFormFieldRules,
} from '../utils/form-utils'
import { SafeAreaView, StyleSheet, Text, View } from 'react-native'
import { SecureEditField, SecureEditProps } from '../types/navigation'
import { size, weight } from '../theme/fonts'
// import { useDispatch, useSelector } from 'react-redux'

const SecureEditScreen: React.FC<SecureEditProps> = ({ route }) => {
    const { title, value: currentValue, field } = route.params

    const { colors } = useColors()
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            value: '',
            password: '',
        },
    })

    const [passwordHidden, setPasswordHidden] = React.useState(true)

    const fieldRules: Rules = React.useMemo(() => {
        switch (field) {
            case SecureEditField.EMAIL:
                return getFormFieldRules('Email', true, undefined, undefined, [
                    {
                        test: (v: string) => {
                            return validator.isEmail(v)
                        },
                        message: 'Email must be in valid email format.',
                    },
                ])
            case SecureEditField.PASSWORD:
                return getFormFieldRules('Password', true, 7, 20, [
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
                ])
            default:
                return getFormFieldRules('None')
        }
    }, [field])

    const onSubmit = (data: { value: string; password: string }) => {
        console.log(data)
    }

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        container: {
            width: '75%',
            alignSelf: 'center',
        },
        label: {
            fontSize: size.fontMedium,
            fontWeight: weight.bold,
            color: colors.textPrimary,
            textAlignVertical: 'center',
            marginTop: 10,
        },
        error: {
            color: colors.error,
            marginTop: 2,
        },
        button: {
            alignSelf: 'center',
            marginTop: 10,
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <ScreenTitle title={`Change ${capitalizeFirstLetter(title)}`} />
                <Text style={styles.label}>{capitalizeFirstLetter(title)}</Text>
                <Controller
                    name="value"
                    control={control}
                    rules={fieldRules}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <UserInput
                                value={value}
                                onChangeText={onChange}
                                placeholder={currentValue}
                                isPassword={
                                    field === SecureEditField.PASSWORD &&
                                    passwordHidden
                                }
                                rightIcon={field === SecureEditField.PASSWORD}
                                onRightPress={async () => {
                                    setPasswordHidden(!passwordHidden)
                                }}
                            />
                        )
                    }}
                />
                {errors.value && (
                    <Text style={styles.error}>{errors.value.message}</Text>
                )}
                <Text style={styles.label}>Password</Text>
                <Controller
                    name="password"
                    control={control}
                    rules={{
                        required: {
                            value: true,
                            message: 'Current password is required',
                        },
                    }}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <UserInput
                                isPassword={true}
                                value={value}
                                onChangeText={onChange}
                                placeholder="Current Password"
                            />
                        )
                    }}
                />
                {errors.password && (
                    <Text style={styles.error}>{errors.password.message}</Text>
                )}
                <PrimaryButton
                    style={styles.button}
                    text={`Change ${title}`}
                    loading={false}
                    onPress={handleSubmit(onSubmit)}
                />
            </View>
        </SafeAreaView>
    )
}

export default SecureEditScreen
