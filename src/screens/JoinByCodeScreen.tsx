import * as React from 'react'
import { ApiError } from '../types/services'
import { JoinByCodeProps } from '../types/navigation'
import PrimaryButton from '../components/atoms/PrimaryButton'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { joinTeamByCode } from '../services/data/user'
import { setProfile } from '../store/reducers/features/account/accountReducer'
import { useDispatch } from 'react-redux'
import { useMutation } from 'react-query'
import { useTheme } from '../hooks'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { Modal, StyleSheet, Text, View } from 'react-native'

const JoinByCodeScreen: React.FC<JoinByCodeProps> = ({ navigation }) => {
    const dispatch = useDispatch()

    const {
        theme: { colors, size },
    } = useTheme()
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { code: '' } })

    const [modalVisible, setModalVisible] = React.useState(false)

    const { isLoading, error, isError, mutate } = useMutation((code: string) =>
        joinTeamByCode(code),
    )

    const onSubmit = async (value: { code: string }) => {
        reset({ code: '' })
        const { code } = value
        mutate(code, {
            onSuccess(data) {
                dispatch(setProfile(data))
                setModalVisible(true)
            },
        })
    }

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
        successText: {
            color: colors.success,
            fontSize: size.fontThirty,
            marginBottom: 10,
        },
    })

    return (
        <View style={styles.screen}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false)
                }}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.successText}>Success!</Text>
                        <PrimaryButton
                            text="Done"
                            loading={false}
                            onPress={async () => {
                                navigation.navigate('ManageTeams')
                            }}
                        />
                    </View>
                </View>
            </Modal>
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
            {isError && (
                <Text style={styles.error}>{(error as ApiError).message}</Text>
            )}
            <PrimaryButton
                style={styles.joinButton}
                text="join"
                loading={isLoading}
                onPress={handleSubmit(onSubmit)}
            />
        </View>
    )
}

export default JoinByCodeScreen
