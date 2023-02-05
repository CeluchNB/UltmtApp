import { AppDispatch } from '../../store/store'
import BaseModal from '../atoms/BaseModal'
import { GuestUser } from '../../types/user'
import PrimaryButton from '../atoms/PrimaryButton'
import React from 'react'
import UserInput from '../atoms/UserInput'
import { addGuestPlayer } from '../../store/reducers/features/game/liveGameReducer'
import { getFormFieldRules } from '../../utils/form-utils'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import {
    resetGuestPlayerStatus,
    selectGuestPlayerError,
    selectGuestPlayerStatus,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

interface GuestPlayerModalProps {
    visible: boolean
    onClose: () => void
}

const GuestPlayerModal: React.FC<GuestPlayerModalProps> = ({
    visible,
    onClose,
}) => {
    const {
        theme: { colors, size },
    } = useTheme()
    const status = useSelector(selectGuestPlayerStatus)
    const error = useSelector(selectGuestPlayerError)
    const dispatch = useDispatch<AppDispatch>()

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: { firstName: '', lastName: '' },
    })

    const onSubmitPlayer = async (player: GuestUser) => {
        dispatch(addGuestPlayer(player))
    }

    React.useEffect(() => {
        if (status === 'success') {
            reset()
            dispatch(resetGuestPlayerStatus())
            onClose()
        }
    }, [status, onClose, reset, dispatch])

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
        },
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
        button: {
            marginTop: 10,
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
                            />
                        )
                    }}
                />
            </View>
            {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName.message}</Text>
            )}
            {error && <Text style={styles.errorText}>{error}</Text>}
            <PrimaryButton
                style={styles.button}
                text="add"
                onPress={async () => {
                    handleSubmit(onSubmitPlayer)()
                }}
                loading={status === 'loading'}
            />
        </BaseModal>
    )
}

export default GuestPlayerModal
