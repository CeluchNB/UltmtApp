import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateGameContext } from '../../context/create-game-context'
import { CreateTournamentProps } from '../../types/navigation'
import FormError from '../../components/atoms/FormError'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import TextDateInput from '../../components/atoms/TextDateInput'
import UserInput from '../../components/atoms/UserInput'
import { getFormFieldRules } from '../../utils/form-utils'
import { useCreateTournament } from '../../hooks/game-edit-actions/use-create-tournament'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { IconButton, Tooltip } from 'react-native-paper'
import React, { useContext } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

const CreateTournamentScreen: React.FC<CreateTournamentProps> = ({
    navigation,
    route,
}) => {
    const { name } = route.params
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const { setTournament } = useContext(CreateGameContext)

    const { mutateAsync, isLoading, error } = useCreateTournament()

    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm({
        defaultValues: {
            name,
            eventId: '',
            startDate: new Date(),
            endDate: new Date(),
        },
    })

    const onCreate = async (data: {
        name?: string
        eventId: string
        startDate: Date
        endDate: Date
    }) => {
        const tournament = await mutateAsync({
            name: data.name ?? '',
            eventId: data.eventId,
            startDate: data.startDate.toISOString(),
            endDate: data.endDate.toISOString(),
        })

        setTournament(tournament)
        navigation.pop(2)
    }

    const styles = StyleSheet.create({
        fieldContainer: {
            marginTop: 20,
        },
        input: {
            width: '100%',
            alignSelf: 'center',
        },
        label: {
            color: colors.textPrimary,
            fontWeight: weight.bold,

            fontSize: size.fontTwenty,
        },
        idTitleContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        helpIcon: {
            margin: 0,
        },
        dateGroup: {
            display: 'flex',
            flexDirection: 'column',
        },
        dateContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        dateLabel: {
            width: '20%',
        },
        datePicker: {
            width: 150,
            alignItems: 'center',
        },
        error: {
            marginTop: 2,
            fontSize: size.fontFifteen,
            color: colors.error,
        },
    })

    return (
        <ScrollView>
            <BaseScreen containerWidth={80}>
                <Controller
                    control={control}
                    name="name"
                    rules={getFormFieldRules('Tournament Name', true)}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <View style={[styles.fieldContainer]}>
                                <Text style={[styles.label]}>
                                    Tournament Name
                                </Text>
                                <UserInput
                                    placeholder="Name"
                                    onChangeText={onChange}
                                    value={value}
                                    style={styles.input}
                                />
                            </View>
                        )
                    }}
                />
                <FormError error={errors.name} />
                <Controller
                    control={control}
                    name="eventId"
                    rules={getFormFieldRules('Tournament ID', true)}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <View style={[styles.fieldContainer]}>
                                <View style={styles.idTitleContainer}>
                                    <Text style={[styles.label]}>
                                        Tournament ID
                                    </Text>
                                    <Tooltip
                                        title={'i.e. "nationals00"'}
                                        enterTouchDelay={200}>
                                        <IconButton
                                            iconColor={colors.textPrimary}
                                            icon="help-circle"
                                            size={20}
                                            onPress={() => {}}
                                            style={styles.helpIcon}
                                        />
                                    </Tooltip>
                                </View>
                                <UserInput
                                    placeholder="Unique Identifier"
                                    onChangeText={onChange}
                                    value={value}
                                />
                            </View>
                        )
                    }}
                />
                <FormError error={errors.eventId} />
                <View style={styles.dateGroup}>
                    <Controller
                        control={control}
                        name="startDate"
                        render={({ field: { onChange, value } }) => {
                            return (
                                <View
                                    style={[
                                        styles.fieldContainer,
                                        styles.dateContainer,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.label,
                                            styles.dateLabel,
                                        ]}>
                                        Start
                                    </Text>
                                    <TextDateInput
                                        value={value}
                                        style={styles.datePicker}
                                        onChange={onChange}
                                    />
                                </View>
                            )
                        }}
                    />
                    <FormError error={errors.startDate} />
                    <Controller
                        control={control}
                        name="endDate"
                        render={({ field: { onChange, value } }) => {
                            return (
                                <View
                                    style={[
                                        styles.fieldContainer,
                                        styles.dateContainer,
                                    ]}>
                                    <Text
                                        style={[
                                            styles.label,
                                            styles.dateLabel,
                                        ]}>
                                        End
                                    </Text>
                                    <TextDateInput
                                        value={value}
                                        style={styles.datePicker}
                                        onChange={onChange}
                                    />
                                </View>
                            )
                        }}
                    />
                    <FormError error={errors.endDate} />
                </View>
                {error && <Text style={styles.error}>{error?.toString()}</Text>}
                <PrimaryButton
                    style={[styles.fieldContainer]}
                    text="create"
                    onPress={handleSubmit(onCreate)}
                    loading={isLoading}
                />
            </BaseScreen>
        </ScrollView>
    )
}

export default CreateTournamentScreen
