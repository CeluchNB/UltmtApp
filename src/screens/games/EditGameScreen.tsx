import * as Constants from '../../utils/constants'
import BaseScreen from '../../components/atoms/BaseScreen'
import { EditGameProps } from '../../types/navigation'
import GameForm from '../../components/organisms/GameForm'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import React from 'react'
import ScreenTitle from '../../components/atoms/ScreenTitle'
import { size } from '../../theme/fonts'
import { useForm } from 'react-hook-form'
import { StyleSheet, Text } from 'react-native'
import { useColors, useGameEditor } from '../../hooks'

const EditGameScreen: React.FC<EditGameProps> = ({ navigation }) => {
    const { game, onEditGame } = useGameEditor()
    const { colors } = useColors()
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
            fontSize: size.fontSmall,
        },
    })
    return (
        <BaseScreen containerWidth="80%">
            <ScreenTitle title="Edit Game" />
            <GameForm control={control} errors={errors} />
            {error.length > 0 && <Text style={styles.errorText}>{error}</Text>}
            <PrimaryButton
                text="make updates"
                loading={loading}
                onPress={onSubmit}
            />
        </BaseScreen>
    )
}

export default EditGameScreen
