import { AppDispatch } from '../../store/store'
import { CreateGame } from '../../types/game'
import { CreateGameProps } from '../../types/navigation'
import GameForm from '../../components/organisms/GameForm'
import LabeledFormInput from '../../components/molecules/LabeledFormInput'
import NetInfoIndicator from '../../components/atoms/NetInfoIndicator'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { Tournament } from '../../types/tournament'
import { selectAccount } from '../../store/reducers/features/account/accountReducer'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import React, { useEffect } from 'react'
import { SafeAreaView, StyleSheet, Switch, View } from 'react-native'
import {
    createGame,
    selectTeamOne,
} from '../../store/reducers/features/game/liveGameReducer'
import {
    resetCreateStatus,
    selectCreateStatus,
} from '../../store/reducers/features/game/liveGameReducer'
import { useDispatch, useSelector } from 'react-redux'

const CreateGameScreen: React.FC<CreateGameProps> = ({ navigation, route }) => {
    // Team One and Team Two are populated through
    // SelectMyTeamScreen and SelectOpponentScreen
    // Flow SelectMyTeamScreen -> SelectOpponentScreen -> CreateGameScreen
    const { teamTwo } = route.params
    const {
        theme: { colors },
    } = useTheme()
    const dispatch = useDispatch<AppDispatch>()
    const account = useSelector(selectAccount)
    const createStatus = useSelector(selectCreateStatus)
    const teamOne = useSelector(selectTeamOne)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            offline: false,
            scoreLimit: 15,
            halfScore: 8,
            softcapMins: 75,
            hardcapMins: 90,
            playersPerPoint: 7,
            timeoutPerHalf: 1,
            floaterTimeout: true,
            tournament: undefined,
        },
    })

    const onCreate = async (formData: {
        offline: boolean
        scoreLimit: number
        halfScore: number
        softcapMins: number
        hardcapMins: number
        playersPerPoint: number
        timeoutPerHalf: number
        floaterTimeout: boolean
        tournament?: Tournament
    }) => {
        dispatch(resetCreateStatus())
        const { offline, ...data } = formData
        const createGameData: CreateGame = {
            ...data,
            teamTwoDefined: teamTwo._id !== undefined,
            startTime: new Date(),
            teamTwo: teamTwo,
            teamOne: {
                _id: teamOne._id,
                place: teamOne.place,
                name: teamOne.name,
                teamname: teamOne.teamname,
                seasonStart: teamOne.seasonStart,
                seasonEnd: teamOne.seasonEnd,
            },
            creator: {
                _id: account._id,
                firstName: account.firstName,
                lastName: account.lastName,
                username: account.username,
            },
        }

        dispatch(
            createGame({
                ...createGameData,
                offline,
                teamOnePlayers: teamOne.players,
            }),
        )
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
        titleContainer: {
            alignSelf: 'center',
            alignItems: 'center',
        },
        netInfoContainer: {
            alignSelf: 'flex-end',
        },
        teamItemContainer: {
            display: 'flex',
            flexDirection: 'row',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <ScreenTitle title={teamOne.name} />
                    <ScreenTitle title="vs." />
                    <ScreenTitle title={teamTwo.name} />
                </View>
                <View style={styles.netInfoContainer}>
                    <NetInfoIndicator />
                </View>
                <Controller
                    name="offline"
                    control={control}
                    rules={{}}
                    render={({ field: { onChange, value } }) => {
                        return (
                            <LabeledFormInput
                                label="Offline"
                                onChange={onChange}
                                value={value}
                                error={errors.offline?.message}>
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
                <GameForm control={control} errors={errors} />
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
