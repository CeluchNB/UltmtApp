import BaseScreen from '../../components/atoms/BaseScreen'
import { Button } from 'react-native-paper'
import ConfirmModal from '../../components/molecules/ConfirmModal'
import PrimaryButton from '../../components/atoms/PrimaryButton'
import { TeamSettingsProps } from '../../types/navigation'
import { deleteTeam } from '../../services/data/team'
import { selectTeam } from '../../store/reducers/features/team/managedTeamReducer'
import { useMutation } from 'react-query'
import { useSelector } from 'react-redux'
import { useTheme } from '../../hooks'
import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

const TeamSettingsScreen: React.FC<TeamSettingsProps> = ({ navigation }) => {
    const {
        theme: { colors, size, weight },
    } = useTheme()

    const team = useSelector(selectTeam)

    const [modalVisible, setModalVisible] = useState(false)
    const [teamAction, setTeamAction] = useState<'delete' | 'archive'>()

    const {
        mutate: deleteTeamMutation,
        isLoading: deleteLoading,
        isError: isDeleteError,
        error: deleteError,
    } = useMutation(() => deleteTeam(team?._id ?? ''), {
        onSuccess: () => {
            navigation.navigate('ManageTeams')
        },
    })

    const isError = isDeleteError
    const error = deleteError

    const rolloverSeason = async () => {
        // navigate to rollover screen
        navigation.navigate('RolloverTeam')
    }

    const styles = StyleSheet.create({
        teamTitle: {
            textAlign: 'center',
            fontSize: size.fontThirty,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        teamname: {
            textAlign: 'center',
            fontSize: size.fontTwenty,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        date: {
            textAlign: 'center',
            fontSize: size.fontFifteen,
            fontWeight: weight.medium,
            color: colors.textPrimary,
            marginBottom: 5,
        },
        buttonContainer: {
            flexDirection: 'row',
            marginTop: 10,
            gap: 10,
        },
        button: {
            flex: 1,
        },
        error: {
            color: colors.error,
        },
    })

    return (
        <BaseScreen containerWidth={90}>
            <Text style={styles.teamTitle}>
                {team?.place} {team?.name}
            </Text>
            <Text style={styles.teamname}>@{team?.teamname}</Text>
            {team?.seasonStart === team?.seasonEnd ? (
                <Text style={styles.date}>
                    {new Date(team?.seasonStart || '').getUTCFullYear()}
                </Text>
            ) : (
                <Text style={styles.date}>
                    {new Date(team?.seasonStart || '').getUTCFullYear() +
                        ' - ' +
                        new Date(team?.seasonEnd || '').getUTCFullYear()}
                </Text>
            )}
            <PrimaryButton
                text="Rollover"
                onPress={rolloverSeason}
                loading={false}
            />
            <View style={styles.buttonContainer}>
                <Button
                    style={styles.button}
                    mode="contained"
                    buttonColor={colors.error}
                    textColor={colors.primary}
                    uppercase={true}
                    onPress={async () => {
                        setTeamAction('delete')
                        setModalVisible(true)
                    }}
                    loading={deleteLoading}>
                    Delete
                </Button>
                <Button
                    style={styles.button}
                    mode="contained"
                    buttonColor={colors.success}
                    textColor={colors.primary}
                    uppercase={true}
                    onPress={async () => {
                        setTeamAction('archive')
                        setModalVisible(true)
                    }}
                    loading={false}>
                    Archive
                </Button>
            </View>
            {isError && (
                <Text style={styles.error}>Error: {error?.toString()}</Text>
            )}
            <ConfirmModal
                visible={modalVisible}
                displayText={`Are you sure you want to ${teamAction} this team? You cannot undo this action.`}
                loading={false}
                confirmColor={
                    teamAction === 'delete' ? colors.error : colors.success
                }
                onCancel={async () => setModalVisible(false)}
                onConfirm={async () => {
                    if (teamAction === 'delete') {
                        deleteTeamMutation()
                    } else if (teamAction === 'archive') {
                    }
                }}
                onClose={async () => setModalVisible(false)}
            />
        </BaseScreen>
    )
}

export default TeamSettingsScreen
