import BaseModal from '../atoms/BaseModal'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import SecondaryButton from '../atoms/SecondaryButton'
import UserInput from '../atoms/UserInput'
import { getFormFieldRules } from '../../utils/form-utils'
import { useAddGuest } from '../../hooks/game-edit-actions/use-add-guest'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'

interface GuestPlayerModalProps {
    visible: boolean
    teamId: string
    onClose: () => void
}

const GuestPlayerModal: React.FC<GuestPlayerModalProps> = ({
    visible,
    teamId,
    onClose,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()

    const { mutateAsync, isLoading, isError, error } = useAddGuest(teamId)

    const onAddGuest = async (player: {
        firstName: string
        lastName: string
    }) => {
        try {
            await mutateAsync(player)
            reset()
        } catch {}
    }

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { firstName: '', lastName: '' },
    })

    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
        },
        modalView: {
            margin: 20,
            backgroundColor: colors.darkGray,
            borderRadius: 10,
            padding: 25,
            alignItems: 'center',
            shadowColor: colors.darkPrimary,
            shadowOffset: {
                width: 5,
                height: 5,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        title: {
            fontSize: size.fontTwenty,
            color: colors.textSecondary,
        },
        inputContainer: {
            flexDirection: 'row',
            display: 'flex',
        },
        input: {
            width: '90%',
            backgroundColor: colors.darkPrimary,
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        button: {
            marginTop: 10,
            marginLeft: 5,
            marginRight: 5,
        },
        buttonContainer: {
            flexDirection: 'row',
        },
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.title}>Add Guest Player</Text>
            <View style={styles.inputContainer}>
                <Controller
                    control={control}
                    name="firstName"
                    rules={getFormFieldRules('First name', true, 1, 30)}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <UserInput
                                style={styles.input}
                                placeholder="First Name"
                                onChangeText={onChange}
                                value={value}
                                testID="first-name-input"
                            />
                        )
                    }}
                />
            </View>
            {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName.message}</Text>
            )}
            <View style={styles.inputContainer}>
                <Controller
                    control={control}
                    name="lastName"
                    rules={getFormFieldRules('Last name', true, 1, 30)}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <UserInput
                                style={styles.input}
                                placeholder="Last Name"
                                onChangeText={onChange}
                                value={value}
                                testID="last-name-input"
                            />
                        )
                    }}
                />
            </View>
            {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
            {isError && (
                <Text style={styles.errorText}>{(error as any)?.message}</Text>
            )}
            <View style={styles.buttonContainer}>
                <SecondaryButton
                    style={styles.button}
                    text="cancel"
                    onPress={async () => {
                        reset()
                        onClose()
                    }}
                />
                <PrimaryButton
                    style={styles.button}
                    text="add"
                    onPress={async () => {
                        handleSubmit(onAddGuest)()
                    }}
                    loading={isLoading}
                />
            </View>
        </BaseModal>
    )
}

export default GuestPlayerModal
