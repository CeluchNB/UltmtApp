import BaseModal from '../atoms/BaseModal'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import UserInput from '../atoms/UserInput'
import { getFormFieldRules } from '../../utils/form-utils'
import { useTheme } from '../../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

interface JoinByCodeModalProps {
    visible: boolean
    loading: boolean
    error: string
    onSubmit: (data: { code: string }) => void
    onClose: () => void
}

const JoinByCodeModal: React.FC<JoinByCodeModalProps> = ({
    visible,
    loading,
    error,
    onSubmit,
    onClose,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { code: '' } })

    const styles = StyleSheet.create({
        header: {
            fontSize: size.fontThirty,
            color: colors.textPrimary,
        },
        inputContainer: {
            display: 'flex',
            flexDirection: 'row',
            marginTop: 10,
        },
        errorText: {
            fontSize: size.fontFifteen,
            color: colors.error,
        },
        button: {
            marginTop: 10,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.header}>Join With Code</Text>
            <View style={styles.inputContainer}>
                <Controller
                    name="code"
                    control={control}
                    rules={getFormFieldRules('Code', true, 6, 6, [
                        {
                            test: (v: string) => {
                                return validator.isNumeric(v)
                            },
                            message: 'Code must be numeric',
                        },
                    ])}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <UserInput
                                placeholder="6 Digit Code"
                                onChangeText={onChange}
                                value={value}
                            />
                        )
                    }}
                />
            </View>
            {errors.code && (
                <Text style={styles.errorText}>{errors.code.message}</Text>
            )}
            {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
            <PrimaryButton
                style={styles.button}
                text="join"
                onPress={() => {
                    handleSubmit(onSubmit)()
                    reset()
                }}
                loading={loading}
            />
        </BaseModal>
    )
}

export default JoinByCodeModal
