import { CreateGameContext } from '../../context/create-game-context'
import { CreateGameProps } from '../../types/navigation'
import GameForm from '../../components/organisms/GameForm'
import { IconButton } from 'react-native-paper'
import LabeledFormInput from '../../components/molecules/LabeledFormInput'
import NetInfoIndicator from '../../components/atoms/NetInfoIndicator'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import React, { useContext, useEffect } from 'react'
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

const CreateGameScreen: React.FC<CreateGameProps> = ({ navigation }) => {
    // Team One and Team Two are populated through
    // SelectMyTeamScreen and SelectOpponentScreen
    // Flow SelectMyTeamScreen -> SelectOpponentScreen -> CreateGameScreen
    const {
        theme: { colors, size, weight },
    } = useTheme()
    const { teamOne, teamTwo, createGame, createLoading, tournament } =
        useContext(CreateGameContext)

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            offline: false,
            scoreLimit: 15,
            halfScore: 8,
            startTime: new Date(),
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
        startTime: Date
        softcapMins: number
        hardcapMins: number
        playersPerPoint: number
        timeoutPerHalf: number
        floaterTimeout: boolean
    }) => {
        const { offline, ...data } = formData

        const game = await createGame(data)
        navigation.navigate('LiveGame', {
            screen: 'FirstPoint',
            params: { gameId: game._id },
        })
    }

    useEffect(() => {
        navigation.setOptions({
            title: `${teamOne?.name} vs. ${teamTwo?.name}`,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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
                                    onLabelPress={() => {
                                        onChange(!value)
                                    }}
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
                                testID="search-tournament-button"
                            />
                        </TouchableOpacity>
                    </View>
                    <PrimaryButton
                        text="create game"
                        disabled={createLoading}
                        loading={createLoading}
                        onPress={handleSubmit(onCreate)}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default CreateGameScreen
