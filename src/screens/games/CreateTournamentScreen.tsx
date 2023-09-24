import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import { CreateTournamentProps } from '../../types/navigation'
import FormError from '../../components/atoms/FormError'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import TextDateInput from '../../components/atoms/TextDateInput'
import UserInput from '../../components/atoms/UserInput'
import { createTournament } from '../../services/data/tournament'
import { getFormFieldRules } from '../../utils/form-utils'
import { setTournament } from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch } from 'react-redux'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import { IconButton, Tooltip } from 'react-native-paper'
import { StyleSheet, Text, View } from 'react-native'

const CreateTournamentScreen: React.FC<CreateTournamentProps> = ({
    navigation,
    route,
}) => {
    const { name } = route.params
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const dispatch = useDispatch()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

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
        setLoading(true)
        try {
            const tournament = await createTournament({
                name: data.name || '',
                eventId: data.eventId,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
            })
            dispatch(setTournament(tournament))
            setLoading(false)

            navigation.pop(2)
        } catch (e: any) {
            setError(e?.message ?? Constants.CREATE_TOURNAMENT_ERROR)
            setLoading(false)
        }
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
        <BaseScreen containerWidth={80}>
            <Controller
                control={control}
                name="name"
                rules={getFormFieldRules('Tournament Name', true)}
                render={({ field: { onChange, value } }) => {
                    return (
                        <View style={[styles.fieldContainer]}>
                            <Text style={[styles.label]}>Tournament Name</Text>
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
                                <Text style={[styles.label, styles.dateLabel]}>
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
                                <Text style={[styles.label, styles.dateLabel]}>
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
            {error.length > 0 && <Text style={styles.error}>{error}</Text>}
            <PrimaryButton
                style={[styles.fieldContainer]}
                text="create"
                onPress={handleSubmit(onCreate)}
                loading={loading}
            />
        </BaseScreen>
    )
}

export default CreateTournamentScreen
