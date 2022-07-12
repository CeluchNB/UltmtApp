import * as React from 'react'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { useColors } from '../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

const JoinByCodeScreen: React.FC<{}> = () => {
    const { colors } = useColors()
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { code: '' } })

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        title: {
            alignSelf: 'center',
        },
        inputContainer: {
            flexDirection: 'row',
            alignSelf: 'center',
        },
        input: {
            margin: 5,
            textAlign: 'center',
            width: '80%',
        },
        joinButton: {
            alignSelf: 'center',
            marginTop: 10,
        },
        error: {
            color: colors.error,
            width: '80%',
            alignSelf: 'center',
        },
    })

    const onSubmit = (value: { code: string }) => {
        reset({ code: '' })
        console.log(value.code)
    }

    return (
        <View style={styles.screen}>
            <ScreenTitle style={styles.title} title="Join By Code" />
            <View style={styles.inputContainer}>
                <Controller
                    name="code"
                    control={control}
                    rules={getFormFieldRules('Code', true, 6, 6, [
                        {
                            test: v => {
                                return validator.isNumeric(v)
                            },
                            message: 'Code must be numeric',
                        },
                    ])}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <UserInput
                                style={styles.input}
                                placeholder="6 Digit Code"
                                onChangeText={onChange}
                                value={value}
                            />
                        )
                    }}
                />
            </View>
            {errors.code && (
                <Text style={styles.error}>{errors.code.message}</Text>
            )}
            <PrimaryButton
                style={styles.joinButton}
                text="join"
                loading={false}
                onPress={handleSubmit(onSubmit)}
            />
        </View>
    )
}

export default JoinByCodeScreen
