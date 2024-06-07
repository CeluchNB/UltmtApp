import BaseModal from '../atoms/BaseModal'
import { LiveGameContext } from '../../context/live-game-context'
import PrimaryButton from '../atoms/PrimaryButton'
import { RadioButton } from 'react-native-paper'
import { TeamNumber } from '../../types/team'
import { useSetPullingTeam } from '../../hooks/game-edit-actions/use-set-pulling-team'
import { useTheme } from '../../hooks'
import { Controller, useForm } from 'react-hook-form'
import React, { useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface ChangePullingTeamModalProps {
    visible: boolean
    onClose: () => void
}

const ChangePullingTeamModal: React.FC<ChangePullingTeamModalProps> = ({
    visible,
    onClose,
}) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const { game, point } = useContext(LiveGameContext)
    const pullingTeam =
        game.teamOne._id === point.pullingTeam._id ? 'one' : 'two'

    const { control, handleSubmit } = useForm({
        defaultValues: { team: pullingTeam },
    })

    const { mutate, isLoading, isError, error } = useSetPullingTeam()

    const styles = StyleSheet.create({
        buttonContainer: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 10,
        },
        title: {
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
        },
        label: {
            fontSize: size.fontTwenty,
            fontWeight: weight.bold,
            color: colors.textPrimary,
            width: 250,
        },
        button: {
            marginTop: 10,
        },
        errorText: {
            fontSize: size.fontFifteen,
            color: colors.error,
        },
    })

    return (
        <BaseModal visible={visible} onClose={onClose}>
            <Text style={styles.title}>Choose pulling team</Text>
            <View>
                <Controller
                    control={control}
                    name="team"
                    render={({ field: { value, onChange } }) => {
                        return (
                            <RadioButton.Group
                                value={value}
                                onValueChange={onChange}>
                                <View style={styles.buttonContainer}>
                                    <Text
                                        style={styles.label}
                                        onPress={() => onChange('one')}>
                                        {game.teamOne.name}
                                    </Text>
                                    <RadioButton.Android
                                        value="one"
                                        theme={{
                                            colors: {
                                                accent: colors.textSecondary,
                                                primary: colors.textPrimary,
                                                secondary: colors.textPrimary,
                                            },
                                        }}
                                        color={colors.textPrimary}
                                        uncheckedColor={colors.textSecondary}
                                    />
                                </View>
                                <View style={styles.buttonContainer}>
                                    <Text
                                        style={styles.label}
                                        onPress={() => onChange('two')}>
                                        {game.teamTwo.name}
                                    </Text>
                                    <RadioButton.Android
                                        value="two"
                                        color={colors.textPrimary}
                                        uncheckedColor={colors.textSecondary}
                                    />
                                </View>
                            </RadioButton.Group>
                        )
                    }}
                />
            </View>
            {isError && (
                <Text style={styles.errorText}>{error?.toString()}</Text>
            )}
            <PrimaryButton
                style={styles.button}
                text="submit"
                loading={isLoading}
                onPress={async () => {
                    handleSubmit(({ team: teamNumber }) => {
                        mutate(teamNumber as TeamNumber, {
                            onSuccess() {
                                onClose()
                            },
                        })
                    })()
                }}
            />
        </BaseModal>
    )
}

export default ChangePullingTeamModal
