import * as React from 'react'
import * as constants from '../utils/constants'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { requestPasswordRecovery } from '../services/data/user'
import { useColors } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

const ForgotPasswordScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const [loading, setLoading] = React.useState(false)
    const [success, setSuccess] = React.useState(false)
    const [error, setError] = React.useState('')

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

    const submitRequest = async (data: { email: string }) => {
        setSuccess(false)
        try {
            setLoading(true)
            await requestPasswordRecovery(data.email)
            reset({ email: '' })
            setSuccess(true)
        } catch (e: any) {
            setError(e.message ?? constants.UNABLE_TO_EMAIL)
        }
        setLoading(false)
    }

    const styles = StyleSheet.create({
        error: {
            color: colors.error,
            width: '75%',
            alignSelf: 'center',
            marginTop: 2,
        },
    })

    return (
        <View>
            <ScreenTitle title="Forgot Password?" />
            <Controller
                control={control}
                rules={{ required: true }}
                render={({ field: { onChange, value } }) => {
                    return (
                        <UserInput
                            placeholder="Email"
                            onChangeText={onChange}
                            value={value}
                        />
                    )
                }}
                name="email"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            {success && <Text>Check your inbox for a recovery code.</Text>}
            <PrimaryButton
                text="Submit"
                onPress={handleSubmit(submitRequest)}
                loading={loading}
            />
            <SecondaryButton text="I Have A Code" onPress={async () => {}} />
        </View>
    )
}

export default ForgotPasswordScreen
