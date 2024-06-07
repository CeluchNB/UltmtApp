import BaseScreen from '../../components/atoms/BaseScreen'
import { EditGameProps } from '../../types/navigation'
import GameForm from '../../components/organisms/GameForm'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { useGameEditor, useTheme } from '../../hooks'

const EditGameScreen: React.FC<EditGameProps> = ({ navigation, route }) => {
    const {
        params: { gameId },
    } = route
    const {
        game,
        mutateAsync: onEditGame,
        isLoading,
        error,
    } = useGameEditor(gameId)

    const {
        theme: { colors, size },
    } = useTheme()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            scoreLimit: game?.scoreLimit,
            halfScore: game?.halfScore,
            startTime: new Date(game?.startTime ?? ''),
            softcapMins: game?.softcapMins,
            hardcapMins: game?.hardcapMins,
            playersPerPoint: game?.playersPerPoint,
            timeoutPerHalf: game?.timeoutPerHalf,
            floaterTimeout: game?.floaterTimeout,
        },
    })

    const onSubmit = async () => {
        await handleSubmit(data => onEditGame(data))()
        navigation.goBack()
    }

    const styles = StyleSheet.create({
        errorText: {
            color: colors.error,
            fontSize: size.fontFifteen,
        },
    })
    return (
        <ScrollView>
            <BaseScreen containerWidth={80}>
                <GameForm control={control} errors={errors} />
                {error && error?.message.length > 0 && (
                    <Text style={styles.errorText}>{error.message}</Text>
                )}
                <PrimaryButton
                    text="make updates"
                    loading={isLoading}
                    onPress={onSubmit}
                />
            </BaseScreen>
        </ScrollView>
    )
}

export default EditGameScreen
