import { CreateGame } from '../types/game'
import { CreateGameProps } from '../types/navigation'
// import { GuestTeam } from '../types/team'
import LabeledFormInput from '../components/molecules/LabeledFormInput'
import PrimaryButton from '../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../components/atoms/ScreenTitle'
import { Tournament } from '../types/tournament'
// import { createGame } from '../services/data/game'
import { selectAccount } from '../store/reducers/features/account/accountReducer'
import { useColors } from '../hooks'
import { useSelector } from 'react-redux'
import { Controller, useForm } from 'react-hook-form'
import { SafeAreaView, StyleSheet, Switch, View } from 'react-native'

const CreateGameScreen: React.FC<CreateGameProps> = ({ route }) => {
    const { teamOne } = route.params
    const { colors } = useColors()
    const account = useSelector(selectAccount)

    const { control, handleSubmit } = useForm({
        defaultValues: {
            teamTwo: '',
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
        teamTwo: string
        scoreLimit: number
        halfScore: number
        softcapMins: number
        hardcapMins: number
        playersPerPoint: number
        timeoutPerHalf: number
        floaterTimeout: boolean
        tournament: Tournament
    }) => {
        const data: CreateGame = {
            ...formData,
            teamTwoDefined: false,
            startTime: new Date(),
            teamTwo: {
                name: formData.teamTwo,
            },
            teamOne: teamOne || {
                _id: 'dummy1',
                place: 'Place1',
                name: 'Name1',
                teamname: 'teamname1',
                seasonStart: '2022',
                seasonEnd: '2023',
            },
            creator: {
                _id: account.email,
                firstName: account.firstName,
                lastName: account.lastName,
                username: account.username,
            },
        }
        console.log('creating with data', data)
        // await createGame(data)
    }

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
                {teamOne ? (
                    <ScreenTitle title={teamOne.name} />
                ) : (
                    <ScreenTitle title="New Game" />
                )}
                <ScreenTitle title="vs." />
                <ScreenTitle title="Team Two" />
                <Controller
                    name="scoreLimit"
                    control={control}
                    rules={{
                        required: true,
                        minLength: 1,
                        maxLength: 2,
                        pattern: /\d+/,
                    }}
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
                            />
                        )
                    }}
                />
                <Controller
                    name="halfScore"
                    control={control}
                    rules={{
                        required: true,
                        minLength: 1,
                        maxLength: 2,
                        pattern: /\d+/,
                    }}
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
                            />
                        )
                    }}
                />
                <Controller
                    name="softcapMins"
                    control={control}
                    rules={{
                        required: true,
                        minLength: 2,
                        maxLength: 3,
                        pattern: /\d+/,
                    }}
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
                            />
                        )
                    }}
                />
                <Controller
                    name="hardcapMins"
                    control={control}
                    rules={{
                        required: true,
                        minLength: 2,
                        maxLength: 3,
                        pattern: /\d+/,
                    }}
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
                            />
                        )
                    }}
                />
                <Controller
                    name="playersPerPoint"
                    control={control}
                    rules={{
                        required: true,
                        minLength: 1,
                        maxLength: 2,
                        pattern: /\d+/,
                    }}
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
                            />
                        )
                    }}
                />
                <Controller
                    name="timeoutPerHalf"
                    control={control}
                    rules={{
                        required: true,
                        minLength: 1,
                        maxLength: 2,
                        pattern: /\d+/,
                    }}
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
                                value={value}>
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
                <Controller
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
                />
                <PrimaryButton
                    text="start"
                    loading={false}
                    onPress={handleSubmit(onCreate)}
                />
            </View>
        </SafeAreaView>
    )
}

export default CreateGameScreen
