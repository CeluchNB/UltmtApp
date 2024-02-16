import { AddGuestProps } from '../../types/navigation'
import BaseScreen from '../../components/atoms/BaseScreen'
import { Divider } from 'react-native-paper'
import { GuestUser } from '../../types/user'
import PlayerSuccessItem from '../../components/atoms/PlayerSuccessItem'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import UserInput from '../../components/atoms/UserInput'
import { createGuest } from '../../services/data/team'
import { setTeam } from '../../store/reducers/features/team/managedTeamReducer'
import { useDispatch } from 'react-redux'
import { useMutation } from 'react-query'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const AddGuestScreen: React.FC<AddGuestProps> = ({ route }) => {
    const { teamId } = route.params

    const {
        theme: { colors, size },
    } = useTheme()
    const dispatch = useDispatch()
    const [users, setUsers] = useState<GuestUser[]>([])

    const { control, handleSubmit, reset } = useForm({
        defaultValues: { firstName: '', lastName: '' },
    })

    const { mutate, isLoading, isError, error } = useMutation(
        (user: GuestUser) => createGuest(teamId, user.firstName, user.lastName),
    )

    const onSubmit = (user: GuestUser) => {
        mutate(user, {
            onSuccess(team) {
                reset()
                setUsers(curr => [user, ...curr])
                dispatch(setTeam(team))
            },
        })
    }

    const styles = StyleSheet.create({
        formContainer: {
            width: '80%',
            alignSelf: 'center',
        },
        input: {
            marginTop: 10,
        },
        error: {
            fontSize: size.fontFifteen,
            color: colors.error,
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <FlatList
                style={styles.formContainer}
                ListHeaderComponent={
                    <View>
                        <Controller
                            control={control}
                            name="firstName"
                            rules={{ required: true }}
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
                        <Controller
                            control={control}
                            name="lastName"
                            rules={{ required: true }}
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
                        {isError && (
                            <Text style={styles.error}>
                                {(error as any)?.message}
                            </Text>
                        )}
                        <PrimaryButton
                            style={styles.input}
                            loading={isLoading}
                            text="submit"
                            onPress={async () => {
                                handleSubmit(onSubmit)()
                            }}
                        />
                        <Divider style={styles.input} />
                    </View>
                }
                data={users}
                renderItem={({ item }) => {
                    return <PlayerSuccessItem user={item} />
                }}
            />
        </BaseScreen>
    )
}

export default AddGuestScreen
