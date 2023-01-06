import { AppDispatch } from '../../store/store'
import { CreateGame } from '../../types/game'
import { CreateGameProps } from '../../types/navigation'
import LabeledFormInput from '../../components/molecules/LabeledFormInput'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { Tournament } from '../../types/tournament'
import { createGame } from '../../store/reducers/features/game/liveGameReducer'
import { getFormFieldRules } from '../../utils/form-utils'
import { selectAccount } from '../../store/reducers/features/account/accountReducer'
import { useColors } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import React, { useEffect } from 'react'
import { SafeAreaView, StyleSheet, Switch, View } from 'react-native'
import {
    resetCreateStatus,
    selectCreateStatus,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const CreateGameScreen: React.FC<CreateGameProps> = ({ navigation, route }) => {
    // Team One and Team Two are populated through
    // SelectMyTeamScreen and SelectOpponentScreen
    // Flow SelectMyTeamScreen -> SelectOpponentScreen -> CreateGameScreen
    const { teamOne, teamTwo } = route.params
    const { colors } = useColors()
    const dispatch = useDispatch<AppDispatch>()
    const account = useSelector(selectAccount)
    const createStatus = useSelector(selectCreateStatus)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            scoreLimit: 15,
            halfScore: 8,
            softcapMins: 75,
            hardcapMins: 90,
            playersPerPoint: 7,
            timeoutPerHalf: 1,
            floaterTimeout: true,
            tournament: {} as Tournament,
        },
    })

    const onNumberChange = (text: any): string => {
        return text.toString().replace(/\D/, '')
    }

    const onCreate = async (formData: {
        scoreLimit: number
        halfScore: number
        softcapMins: number
        hardcapMins: number
        playersPerPoint: number
        timeoutPerHalf: number
        floaterTimeout: boolean
        tournament: Tournament
    }) => {
        dispatch(resetCreateStatus())
        const createGameData: CreateGame = {
            ...formData,
            teamTwoDefined: teamTwo._id !== undefined,
            startTime: new Date(),
            teamTwo: teamTwo,
            teamOne: teamOne,
            creator: {
                _id: account._id,
                firstName: account.firstName,
                lastName: account.lastName,
                username: account.username,
            },
        }

        dispatch(createGame(createGameData))
    }

    useEffect(() => {
        if (createStatus === 'success') {
            navigation.navigate('LiveGame', { screen: 'FirstPoint' })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [createStatus])

    const styles = StyleSheet.create({
        screen: {
            height: '100%',
            backgroundColor: colors.primary,
        },
        container: {
            width: '80%',
            alignSelf: 'center',
        },
        teamItemContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <View>
                    <ScreenTitle title={teamOne.name} />
                    <ScreenTitle title="vs." />
                    <ScreenTitle title={teamTwo.name} />
                </View>
                <Controller
                    name="scoreLimit"
                    control={control}
                    rules={getFormFieldRules<number>(
                        'Score limit',
                        true,
                        1,
                        2,
                        [
                            {
                                test: (value: number) =>
                                    /\d+/.test(value.toString()),
                                message: 'Score limit must be a number',
                            },
                        ],
                    )}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Game to"
                                onChange={event => {
                                    onChange(onNumberChange(event))
                                }}
                                value={value}
                                unit="points"
                                keyboardType="number-pad"
                                error={errors.scoreLimit?.message}
                            />
                        )
                    }}
                />
                <Controller
                    name="halfScore"
                    control={control}
                    rules={getFormFieldRules<number>('Half score', true, 1, 2, [
                        {
                            test: (value: number) =>
                                /\d+/.test(value.toString()),
                            message: 'Half score must be a number',
                        },
                    ])}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Half at"
                                onChange={event => {
                                    onChange(onNumberChange(event))
                                }}
                                value={value}
                                unit="points"
                                keyboardType="number-pad"
                                error={errors.halfScore?.message}
                            />
                        )
                    }}
                />
                <Controller
                    name="softcapMins"
                    control={control}
                    rules={getFormFieldRules<number>(
                        'Softcap time',
                        true,
                        2,
                        3,
                        [
                            {
                                test: (value: number) =>
                                    /\d+/.test(value.toString()),
                                message: 'Softcap time must be a number',
                            },
                        ],
                    )}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Soft cap"
                                onChange={event => {
                                    onChange(onNumberChange(event))
                                }}
                                value={value}
                                unit="minutes"
                                keyboardType="number-pad"
                                error={errors.softcapMins?.message}
                            />
                        )
                    }}
                />
                <Controller
                    name="hardcapMins"
                    control={control}
                    rules={getFormFieldRules<number>(
                        'Hardcap time',
                        true,
                        2,
                        3,
                        [
                            {
                                test: (value: number) =>
                                    /\d+/.test(value.toString()),
                                message: 'Hardcap time must be a number',
                            },
                        ],
                    )}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Hard cap"
                                onChange={event => {
                                    onChange(onNumberChange(event))
                                }}
                                value={value}
                                unit="points"
                                keyboardType="number-pad"
                                error={errors.hardcapMins?.message}
                            />
                        )
                    }}
                />
                <Controller
                    name="playersPerPoint"
                    control={control}
                    rules={getFormFieldRules<number>(
                        'Players per point',
                        true,
                        1,
                        2,
                        [
                            {
                                test: (value: number) =>
                                    /\d+/.test(value.toString()),
                                message: 'Players per point must be a number',
                            },
                        ],
                    )}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Players"
                                onChange={event => {
                                    onChange(onNumberChange(event))
                                }}
                                value={value}
                                unit="per point"
                                keyboardType="number-pad"
                                error={errors.playersPerPoint?.message}
                            />
                        )
                    }}
                />
                <Controller
                    name="timeoutPerHalf"
                    control={control}
                    rules={getFormFieldRules<number>(
                        'Timeouts per half',
                        true,
                        1,
                        2,
                        [
                            {
                                test: (value: number) =>
                                    /\d+/.test(value.toString()),
                                message: 'Timeouts per half must be a number',
                            },
                        ],
                    )}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Timeouts"
                                onChange={event => {
                                    onChange(onNumberChange(event))
                                }}
                                value={value}
                                unit="per half"
                                keyboardType="number-pad"
                                error={errors.timeoutPerHalf?.message}
                            />
                        )
                    }}
                />
                <Controller
                    name="floaterTimeout"
                    control={control}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Floater timeout"
                                onChange={onChange}
                                value={value}
                                error={errors.floaterTimeout?.message}>
                                <Switch
                                    trackColor={{
                                        false: colors.gray,
                                        true: colors.textSecondary,
                                    }}
                                    thumbColor={colors.textPrimary}
                                    onValueChange={onChange}
                                    value={value}
                                />
                            </LabeledFormInput>
                        )
                    }}
                />
                {/* <Controller
                    name="tournament"
                    control={control}
                    rules={{
                        required: true,
                    }}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Tournament"
                                onChange={onChange}
                                value={value}
                            />
                        )
                    }}
                /> */}
                <PrimaryButton
                    text="start"
                    disabled={createStatus === 'loading'}
                    loading={createStatus === 'loading'}
                    onPress={handleSubmit(onCreate)}
                />
            </View>
        </SafeAreaView>
    )
}

export default CreateGameScreen
