import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import { EditGameProps } from '../../types/navigation'
import GameForm from '../../components/organisms/GameForm'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import { useForm } from 'react-hook-form'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { useGameEditor, useTheme } from '../../hooks'

const EditGameScreen: React.FC<EditGameProps> = ({ navigation }) => {
    const { game, onEditGame } = useGameEditor()
    const {
        theme: { colors, size },
    } = useTheme()
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState('')

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            scoreLimit: game.scoreLimit,
            halfScore: game.halfScore,
            startTime: new Date(game.startTime),
            softcapMins: game.softcapMins,
            hardcapMins: game.hardcapMins,
            playersPerPoint: game.playersPerPoint,
            timeoutPerHalf: game.timeoutPerHalf,
            floaterTimeout: game.floaterTimeout,
        },
    })

    const onSubmit = async () => {
        try {
            setLoading(true)
            await handleSubmit(onEditGame)()
            navigation.goBack()
        } catch (e: any) {
            setError(e?.message ?? Constants.UPDATE_GAME_ERROR)
        } finally {
            setLoading(false)
        }
    }

    const styles = StyleSheet.create({
        errorText: {
            color: colors.error,
            fontSize: size.fontTen,
        },
    })
    return (
        <ScrollView>
            <BaseScreen containerWidth={80}>
                <GameForm control={control} errors={errors} />
                {error.length > 0 && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
                <PrimaryButton
                    text="make updates"
                    loading={loading}
                    onPress={onSubmit}
                />
            </BaseScreen>
        </ScrollView>
    )
}

export default EditGameScreen
