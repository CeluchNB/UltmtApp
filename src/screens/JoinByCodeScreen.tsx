import * as React from 'react'
import * as UserData from '../services/data/user'
import { JoinByCodeProps } from '../types/navigation'
import PrimaryButton from '../components/atoms/PrimaryButton'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { User } from '../types/user'
import UserInput from '../components/atoms/UserInput'
import { getFormFieldRules } from '../utils/form-utils'
import { setProfile } from '../store/reducers/features/account/accountReducer'
import { size } from '../theme/fonts'
import { useDispatch } from 'react-redux'
import validator from 'validator'
import { Controller, useForm } from 'react-hook-form'
import { Modal, StyleSheet, Text, View } from 'react-native'
import { useColors, useLazyData } from '../hooks'

const JoinByCodeScreen: React.FC<JoinByCodeProps> = ({ navigation }) => {
    const dispatch = useDispatch()

    const { colors } = useColors()
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ defaultValues: { code: '' } })

    const [modalVisible, setModalVisible] = React.useState(false)

    const { data, loading, error, fetch } = useLazyData<User>(
        UserData.joinTeamByCode,
    )

    const onSubmit = async (value: { code: string }) => {
        reset({ code: '' })
        const { code } = value
        await fetch(code)
    }

    React.useEffect(() => {
        if (data && !loading) {
            dispatch(setProfile(data))
            setModalVisible(true)
        }
    }, [data, loading, dispatch])

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
            fontSize: size.fontLarge,
            marginBottom: 10,
        },
    })

    return (
        <View style={styles.screen}>
            <ScreenTitle style={styles.title} title="Join By Code" />
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
            {error && <Text style={styles.error}>{error.message}</Text>}
            <PrimaryButton
                style={styles.joinButton}
                text="join"
                loading={loading}
                onPress={handleSubmit(onSubmit)}
            />
        </View>
    )
}

export default JoinByCodeScreen
