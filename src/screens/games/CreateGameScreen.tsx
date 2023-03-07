import { AppDispatch } from '../../store/store'
import { CreateGame } from '../../types/game'
import { CreateGameProps } from '../../types/navigation'
import GameForm from '../../components/organisms/GameForm'
import { IconButton } from 'react-native-paper'
import LabeledFormInput from '../../components/molecules/LabeledFormInput'
import NetInfoIndicator from '../../components/atoms/NetInfoIndicator'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { selectAccount } from '../../store/reducers/features/account/accountReducer'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import React, { useEffect } from 'react'
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import {
    createGame,
    selectTeamOne,
    selectTournament,
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
        theme: { colors, size, weight },
    } = useTheme()
    const dispatch = useDispatch<AppDispatch>()
    const account = useSelector(selectAccount)
    const createStatus = useSelector(selectCreateStatus)
    const teamOne = useSelector(selectTeamOne)
    const tournament = useSelector(selectTournament)

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
    }) => {
        dispatch(resetCreateStatus())
        const { offline, ...data } = formData
        const createGameData: CreateGame = {
            ...data,
            teamTwo,
            tournament,
            teamTwoDefined: teamTwo._id !== undefined,
            startTime: new Date(),
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
            marginBottom: 10,
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
        labelText: {
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
            color: colors.textPrimary,
            width: '50%',
        },
        tournamentContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
            marginBottom: 5,
        },
        tournamentText: {
            fontSize: size.fontFifteen,
            fontWeight: weight.bold,
            color: colors.gray,
            flex: 1,
        },
        tournamentValueContainer: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '50%',
        },
        tournamentButtonStyle: {
            alignItems: 'center',
            justifyContent: 'center',
        },
    })

    return (
        <SafeAreaView style={styles.screen}>
            <ScrollView>
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
                    <View style={styles.tournamentContainer}>
                        <Text style={styles.labelText}>Tournament</Text>
                        <TouchableOpacity
                            style={styles.tournamentValueContainer}
                            onPress={() => {
                                navigation.navigate('SearchTournaments')
                            }}>
                            <Text style={styles.tournamentText}>
                                {tournament ? tournament.name : 'N/A'}
                            </Text>
                            <IconButton
                                style={styles.tournamentButtonStyle}
                                iconColor={colors.textPrimary}
                                icon="chevron-right"
                                onPress={() => {
                                    navigation.navigate('SearchTournaments')
                                }}
                                testID="go-button"
                            />
                        </TouchableOpacity>
                    </View>
                    <PrimaryButton
                        text="start"
                        disabled={createStatus === 'loading'}
                        loading={createStatus === 'loading'}
                        onPress={handleSubmit(onCreate)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default CreateGameScreen
