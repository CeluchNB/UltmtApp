import * as React from 'react'
import { CreateUserData } from '../types/user'
import PrimaryButton from '../components/atoms/PrimaryButton'
import { Props } from '../types/navigation'
import ScreenTitle from '../components/atoms/ScreenTitle'
import SecondaryButton from '../components/atoms/SecondaryButton'
import UserInput from '../components/atoms/UserInput'
import { useColors } from '../hooks'
import { Controller, useForm } from 'react-hook-form'
import { StyleSheet, Text, View } from 'react-native'
import {
    createAccount,
    selectAccount,
    selectLoading,
} from '../store/reducers/features/account/accountReducer'
import { useDispatch, useSelector } from 'react-redux'

const CreateAccountScreen: React.FC<Props> = ({ navigation }: Props) => {
    const { colors } = useColors()
    const dispatch = useDispatch()
    const loading = useSelector(selectLoading)
    const account = useSelector(selectAccount)
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
            marginStart: 50,
            marginEnd: 50,
            marginTop: 20,
        },
        createButton: {
            alignSelf: 'center',
            marginTop: 20,
        },
        backButton: {
            alignSelf: 'center',
            marginTop: 10,
        },
    })

    const dispatchCreateAccount = (data: CreateUserData) => {
        dispatch(createAccount(data))
    }

    return (
        <View style={styles.container}>
            <ScreenTitle title="Create Account" style={styles.title} />
            <Controller
                control={control}
                rules={{ required: true }}
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
            {errors.firstName && <Text>The first name field is required.</Text>}

            <Controller
                control={control}
                rules={{ required: true }}
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
            {errors.lastName && <Text>The last name field is required.</Text>}

            <Controller
                control={control}
                rules={{ required: true }}
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
            {errors.username && <Text>The username field is required.</Text>}

            <Controller
                control={control}
                rules={{ required: true }}
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
            {errors.email && <Text>The email field is required.</Text>}

            <Controller
                control={control}
                rules={{ required: true }}
                name="password"
                render={({ field: { onChange, value } }) => (
                    <UserInput
                        placeholder="Password"
                        onChangeText={onChange}
                        value={value}
                        isPassword={true}
                        style={styles.input}
                    />
                )}
            />
            {errors.password && <Text>The password field is required.</Text>}
            {account.error && (
                <Text>Error creating account: {account.error}</Text>
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
