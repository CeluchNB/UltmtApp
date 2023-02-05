import LabeledFormInput from '../molecules/LabeledFormInput'
import React from 'react'
import { getFormFieldRules } from '../../utils/form-utils'
import { useTheme } from '../../hooks'
import { Control, Controller, FieldErrorsImpl } from 'react-hook-form'
import { Switch, View } from 'react-native'

interface EditGameData {
    scoreLimit: number
    halfScore: number
    softcapMins: number
    hardcapMins: number
    playersPerPoint: number
    timeoutPerHalf: number
    floaterTimeout: boolean
}

interface GameFormProps {
    control: Control<any & EditGameData, any>
    errors: Partial<FieldErrorsImpl<EditGameData>>
}

const GameForm: React.FC<GameFormProps> = props => {
    const { control, errors } = props
    const {
        theme: { colors },
    } = useTheme()

    const onNumberChange = (text: any): string => {
        return text.toString().replace(/\D/, '')
    }

    return (
        <View>
            <Controller
                name="scoreLimit"
                control={control}
                rules={getFormFieldRules<number>('Score limit', true, 1, 2, [
                    {
                        test: (value: number) => /\d+/.test(value.toString()),
                        message: 'Score limit must be a number',
                    },
                ])}
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
                        test: (value: number) => /\d+/.test(value.toString()),
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
                rules={getFormFieldRules<number>('Softcap time', true, 2, 3, [
                    {
                        test: (value: number) => /\d+/.test(value.toString()),
                        message: 'Softcap time must be a number',
                    },
                ])}
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
                rules={getFormFieldRules<number>('Hardcap time', true, 2, 3, [
                    {
                        test: (value: number) => /\d+/.test(value.toString()),
                        message: 'Hardcap time must be a number',
                    },
                ])}
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
                rules={{}}
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
        </View>
    )
}

export default GameForm
